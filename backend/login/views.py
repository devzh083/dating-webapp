from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.conf import settings
from django.shortcuts import redirect
from django.contrib.auth import get_user_model
import urllib.parse
import requests

from .models import FirebaseAuthManager, FirebaseProfileManager

User = get_user_model()


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

        # Django user (username is email)
        user = User.objects.create_user(username=username, password=password)

        # Firestore users collection: one doc per email
        FirebaseAuthManager.create_or_update_user(
            email=username,
            auth_provider="email",
            django_user_id=str(user.id),
        )

        return Response(
            {
                "message": "User created successfully",
                "user_id": user.id,
                "username": user.username,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
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

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "email": email,
                    "firebase_user": firebase_user or {},
                    "profile": profile or {},
                },
            },
            status=status.HTTP_200_OK,
        )


class ProfileView(APIView):
    """
    Authenticated user profile.
    Stores and returns arbitrary key-value pairs for personal details.
    """

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
        Body can be any key-value pairs:
        { "name": "...", "age": 25, "gender": "female", ... }
        """
        email = request.user.username
        FirebaseProfileManager.create_profile(email, **request.data)
        return Response(
            {"message": "Profile saved", "data": request.data},
            status=status.HTTP_200_OK,
        )


class ProfileDetailView(APIView):
    """
    Public profile by email (optional; remove if you do not need public access).
    """

    permission_classes = [AllowAny]

    def get(self, request, email):
        profile = FirebaseProfileManager.get_profile(email)
        if profile:
            return Response(profile, status=status.HTTP_200_OK)
        return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)


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
    Handles Google OAuth callback.
    IMPORTANT: does NOT create any profile document.
    Only updates `users` collection and Django user.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        code = request.GET.get("code")
        if not code:
            return redirect(f"{settings.FRONTEND_URL}/login?error=oauth_no_code")

        # 1) Exchange code for tokens
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
            return redirect(f"{settings.FRONTEND_URL}/login?error=oauth_no_tokens")

        # 2) Get user info
        userinfo_res = requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {google_access_token}"},
        )
        userinfo = userinfo_res.json()
        email = userinfo.get("email")
        name = userinfo.get("name")
        google_user_id = userinfo.get("sub")

        if not email:
            return redirect(f"{settings.FRONTEND_URL}/login?error=oauth_no_email")

        # 3) Upsert Django user (email used as username)
        user, created = User.objects.get_or_create(
            username=email,
            defaults={
                "email": email,
                "first_name": name.split()[0] if name else "",
                "last_name": " ".join(name.split()[1:]) if name else "",
            },
        )

        # 4) Upsert Firestore `users` doc by email (no profile write)
        FirebaseAuthManager.create_or_update_user(
            email=email,
            auth_provider="google",
            django_user_id=str(user.id),
            google_id=google_user_id,
            name=name,
        )

        # 5) Issue JWT and redirect back to frontend
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
    Returns whether the authenticated user is new or existing,
    based on presence of a profile document in Firestore.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        email = request.user.username
        
        # Check if profile exists for this email
        profile = FirebaseProfileManager.get_profile(email)
        has_profile = profile is not None
        
        # Boolean flag as requested: true if profile exists, false otherwise
        profile_exists = bool(profile)
        
        # Get Firebase user data for completeness
        firebase_user = FirebaseAuthManager.get_user_by_email(email)

        return Response(
            {
                "email": email,
                "profile_exists": profile_exists,  # true/false as requested
                "has_profile": has_profile,        # same boolean, kept for backward compatibility
                "firebase_user": firebase_user or {},
                "profile": profile or {},
            },
            status=status.HTTP_200_OK,
        )

