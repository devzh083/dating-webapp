from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.parsers import MultiPartParser, FormParser

from django.contrib.auth import authenticate, get_user_model
from django.conf import settings
from django.shortcuts import redirect
from django.core.mail import send_mail
from django.core.cache import cache

import urllib.parse
import requests
import random
import string

from .models import FirebaseAuthManager, FirebaseProfileManager
from .models_photos import UserPhoto  # <-- your ImageField model

User = get_user_model()

# ---------- OTP helpers ----------
def generate_otp(length=6):
    digits = string.digits
    return "".join(random.choice(digits) for _ in range(length))


def send_otp_email(email, otp):
    subject = "Your login OTP"
    message = f"Your OTP for login is: {otp}. It is valid for 5 minutes."
    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", settings.EMAIL_HOST_USER)
    send_mail(subject, message, from_email, [email])
    cache.set(f"login_otp_{email}", otp, timeout=300)


# ---------- Auth / Profile Views ----------


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response(
                {"detail": "Username and password required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {"detail": "Username already exists"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.create_user(username=username, password=password)

        FirebaseAuthManager.create_or_update_user(
            email=username,
            auth_provider="email",
            django_user_id=str(user.id),
            is_verified=False,
        )

        return Response(
            {
                "message": "User created successfully",
                "user_id": user.id,
                "username": user.username,
                "is_verified": False,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """
    Normal username+password login (no OTP).
    """

    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response(
                {"detail": "Username and password required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(username=username, password=password)
        if not user:
            return Response(
                {"detail": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)
        email = user.username
        firebase_user = FirebaseAuthManager.get_user_by_email(email)
        profile = FirebaseProfileManager.get_profile(email)

        is_verified = firebase_user.get("is_verified", False) if firebase_user else False

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "email": email,
                    "is_verified": is_verified,
                    "firebase_user": firebase_user or {},
                    "profile": profile or {},
                },
            },
            status=status.HTTP_200_OK,
        )


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        email = request.user.username
        profile = FirebaseProfileManager.get_profile(email)
        return Response(
            {
                "email": email,
                "profile": profile or {},
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        """
        Save full onboarding profile payload (including photos as URL list).
        """
        email = request.user.username
        data = dict(request.data)

        # Normalize photos to list[str] if present
        photos = data.get("photos")
        if photos is not None:
            if isinstance(photos, str):
                data["photos"] = [photos]
            elif isinstance(photos, list):
                data["photos"] = [str(p) for p in photos]

        FirebaseProfileManager.create_profile(email, **data)
        return Response(
            {"message": "Profile saved", "data": data},
            status=status.HTTP_200_OK,
        )


class ProfileDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, email):
        profile = FirebaseProfileManager.get_profile(email)
        if profile:
            return Response(profile, status=status.HTTP_200_OK)
        return Response(
            {"error": "Profile not found"},
            status=status.HTTP_404_NOT_FOUND,
        )


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        base_url = "https://accounts.google.com/o/oauth2/v2/auth"
        params = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "redirect_uri": settings.GOOGLE_CALLBACK_URL,
            "response_type": "code",
            "scope": "openid email profile",
            "access_type": "offline",
            "prompt": "consent",
        }
        url = f"{base_url}?{urllib.parse.urlencode(params)}"
        return Response({"auth_url": url}, status=status.HTTP_200_OK)


class GoogleCallbackView(APIView):
    """
    Handles Google OAuth callback, updates Firestore user,
    and redirects to frontend with JWT tokens.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        code = request.GET.get("code")
        if not code:
            return redirect(f"{settings.FRONTEND_URL}/login?error=oauth_no_code")

        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_CALLBACK_URL,
            "grant_type": "authorization_code",
        }
        token_res = requests.post(token_url, data=token_data)
        token_json = token_res.json()
        google_access_token = token_json.get("access_token")
        if not google_access_token:
            return redirect(
                f"{settings.FRONTEND_URL}/login?error=oauth_no_tokens"
            )

        userinfo_res = requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {google_access_token}"},
        )
        userinfo = userinfo_res.json()
        email = userinfo.get("email")
        name = userinfo.get("name")
        google_user_id = userinfo.get("sub")

        if not email:
            return redirect(
                f"{settings.FRONTEND_URL}/login?error=oauth_no_email"
            )

        user, created = User.objects.get_or_create(
            username=email,
            defaults={
                "email": email,
                "first_name": name.split()[0] if name else "",
                "last_name": " ".join(name.split()[1:]) if name else "",
            },
        )

        FirebaseAuthManager.create_or_update_user(
            email=email,
            auth_provider="google",
            django_user_id=str(user.id),
            google_id=google_user_id,
            name=name,
            is_verified=True,
        )

        refresh = RefreshToken.for_user(user)
        access_token_jwt = str(refresh.access_token)
        refresh_token_jwt = str(refresh)

        redirect_url = (
            f"{settings.FRONTEND_HOME_URL}"
            f"?access_token={urllib.parse.quote(access_token_jwt)}"
            f"&refresh_token={urllib.parse.quote(refresh_token_jwt)}"
            f"&email={urllib.parse.quote(email)}"
            f"&name={urllib.parse.quote(name or '')}"
            f"&google_id={urllib.parse.quote(google_user_id or '')}"
            f"&is_new_user={created}"
        )
        return redirect(redirect_url)


class AuthStatusView(APIView):
    """
    Returns whether the authenticated user already has a profile document.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        email = request.user.username
        profile = FirebaseProfileManager.get_profile(email)
        firebase_user = FirebaseAuthManager.get_user_by_email(email)

        return Response(
            {
                "email": email,
                "profile_exists": bool(profile),
                "has_profile": bool(profile),
                "is_verified": firebase_user.get("is_verified", False)
                if firebase_user
                else False,
                "firebase_user": firebase_user or {},
                "profile": profile or {},
            },
            status=status.HTTP_200_OK,
        )


# ---------- Photo Upload View (media + URL stored in Firestore) ----------


class PhotoUploadView(APIView):
    """
    Accepts a multipart image file, stores it in MEDIA_ROOT/uploads/,
    and appends the public URL to the Firestore Profile.photos array.
    """

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file_obj = request.FILES.get("file")
        if not file_obj:
            return Response(
                {"detail": "No file uploaded"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        photo = UserPhoto.objects.create(user=request.user, image=file_obj)

        # Build absolute URL to serve in frontend: http://host/media/uploads/...
        url = request.build_absolute_uri(photo.url)

        # Append to Firestore profile photos[]
        email = request.user.username
        profile = FirebaseProfileManager.get_profile(email) or {}
        photos = profile.get("photos", [])
        photos.append(url)
        FirebaseProfileManager.create_profile(email, photos=photos)

        return Response({"url": url}, status=status.HTTP_201_CREATED)


# ---------- OTP Email Verification Endpoints ----------


class SendLoginOTPView(APIView):
    """
    Step 1: client sends { "username": "<email>" }
    Sends OTP to email if user exists and not verified.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        if not username:
            return Response(
                {"detail": "Username (email) required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        firebase_user = FirebaseAuthManager.get_user_by_email(username)
        if firebase_user and firebase_user.get("is_verified", False):
            return Response(
                {"detail": "Email already verified. Use normal login."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        otp = generate_otp()
        send_otp_email(username, otp)

        return Response(
            {"message": "OTP sent to email"},
            status=status.HTTP_200_OK,
        )


class VerifyEmailOTPView(APIView):
    """
    Verify email after registration - marks user as verified
    """

    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        otp = request.data.get("otp")

        if not username or not otp:
            return Response(
                {"detail": "Username (email) and OTP are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cache_key = f"login_otp_{username}"
        saved_otp = cache.get(cache_key)

        if not saved_otp:
            return Response(
                {"detail": "OTP expired or not found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if str(saved_otp) != str(otp):
            return Response(
                {"detail": "Invalid OTP"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cache.delete(cache_key)

        FirebaseAuthManager.create_or_update_user(
            email=username,
            auth_provider="email",
            is_verified=True,
        )

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {
                "message": "Email verified successfully",
                "user_id": user.id,
                "is_verified": True,
            },
            status=status.HTTP_200_OK,
        )


class VerifyLoginOTPView(APIView):
    """
    Step 2: client sends { "username": "<email>", "otp": "123456" }
    If OTP matches, returns JWT tokens and user data (for unverified users).
    """

    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        otp = request.data.get("otp")

        if not username or not otp:
            return Response(
                {"detail": "Username (email) and OTP are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cache_key = f"login_otp_{username}"
        saved_otp = cache.get(cache_key)

        if not saved_otp:
            return Response(
                {"detail": "OTP expired or not found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if str(saved_otp) != str(otp):
            return Response(
                {"detail": "Invalid OTP"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cache.delete(cache_key)

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        firebase_user = FirebaseAuthManager.get_user_by_email(username)
        if firebase_user and firebase_user.get("is_verified", False):
            return Response(
                {"detail": "Email already verified. Use normal login."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        FirebaseAuthManager.create_or_update_user(
            email=username,
            auth_provider="email",
            is_verified=True,
        )

        refresh = RefreshToken.for_user(user)
        email = user.username
        profile = FirebaseProfileManager.get_profile(email)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "email": email,
                    "is_verified": True,
                    "firebase_user": firebase_user or {},
                    "profile": profile or {},
                },
            },
            status=status.HTTP_200_OK,
        )
