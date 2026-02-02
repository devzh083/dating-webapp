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
from .models import Match, Like

import urllib.parse
import requests
import random
from django.db.models import Q
import string

from math import radians, sin, cos, asin, sqrt

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from admin_panel.models import UserReport
from login.serializers import CreateUserReportSerializer
from login.models import Match

from config.firebase import db
from .models import BlockedUser, FirebaseProfileManager, clean_firestore_data
from google.cloud import firestore

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status


from .ws import notify_user

from django.contrib.auth import get_user_model
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from .models import FirebaseAuthManager, FirebaseProfileManager

from login.mysql_managers import MySQLChatManager, MySQLLikeManager as FirebaseLikeManager
from login.mysql_managers import MySQLMatchManager as FirebaseMatchManager
from login.mysql_managers import MySQLChatManager as FirebaseChatManager
from profiles.models import UserProfile
from django.db.models import Q



from .models_photos import UserPhoto  # <-- your ImageField model

User = get_user_model()

# ---------- OTP helpers ----------
def generate_otp(length=6):
    digits = string.digits
    return "".join(random.choice(digits) for _ in range(length))


def send_otp_email(email, otp):
    subject = f"The Dating App: your sign-in code"
    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", settings.EMAIL_HOST_USER)
    
    # Format OTP digits with spaces (e.g., "1234" becomes "1 2 3 4")
    otp_digits = ' '.join(list(str(otp)))
    
    # ---------------- HTML TEMPLATE (Netflix-style) ----------------
    # Clean, minimal design with focus on the OTP code
    # Uses your brand colors: #0095E0 (Blue) -> #00C98B (Teal)
    
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Sign-In Code</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Helvetica, Arial, sans-serif; background-color: #ffffff;">
        
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; width: 100%;">
            <tr>
                <td align="center" style="padding: 40px 20px;">
                    
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; margin: 0 auto;">
                        
                        <!-- Header -->
                        <tr>
                            <td style="padding: 0 0 30px 0; text-align: left;">
                                <h1 style="margin: 0; font-size: 28px; font-weight: 700; background: linear-gradient(90deg, #0095E0 0%, #00C98B 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                                    The Dating App
                                </h1>
                            </td>
                        </tr>

                        <!-- Main Content -->
                        <tr>
                            <td style="padding: 0 0 30px 0;">
                                <h2 style="margin: 0 0 20px 0; color: #000000; font-size: 24px; font-weight: 700; line-height: 1.3;">
                                    Enter this code to sign in
                                </h2>
                                
                                <!-- OTP Code Display (Netflix-style) -->
                                <div style="margin: 30px 0; text-align: left;">
                                    <span style="display: inline-block; color: #000000; font-size: 48px; font-weight: 700; letter-spacing: 12px; padding: 20px 0;">
                                        {otp_digits}
                                    </span>
                                </div>

                                <p style="margin: 0 0 20px 0; color: #000000; font-size: 16px; line-height: 1.5;">
                                    Enter the code above on your device to sign in to The Dating App.
                                </p>

                                <p style="margin: 0 0 20px 0; color: #000000; font-size: 16px; line-height: 1.5;">
                                    This code will expire in <strong>5 minutes</strong>.
                                </p>

                                <p style="margin: 0 0 20px 0; color: #737373; font-size: 14px; line-height: 1.5;">
                                    If you didn't send this request, you can ignore this email or review your recent device activity.
                                </p>

                                <p style="margin: 0; color: #737373; font-size: 14px; line-height: 1.5;">
                                    To help security, please don't share this code with anyone.
                                </p>
                            </td>
                        </tr>

                        <!-- Signature -->
                        <tr>
                            <td style="padding: 20px 0 40px 0;">
                                <p style="margin: 0; color: #000000; font-size: 16px; font-weight: 600;">
                                    The Dating App team
                                </p>
                            </td>
                        </tr>

                        <!-- Footer Links -->
                        <tr>
                            <td style="padding: 20px 0 0 0; border-top: 1px solid #e6e6e6;">
                                <p style="margin: 0 0 15px 0; color: #737373; font-size: 13px; line-height: 1.6;">
                                    <a href="#" style="color: #0095E0; text-decoration: none;">Help Centre</a> | 
                                    <a href="#" style="color: #0095E0; text-decoration: none;">Terms of Use</a> | 
                                    <a href="#" style="color: #0095E0; text-decoration: none;">Privacy</a>
                                </p>
                                
                                <p style="margin: 0; color: #737373; font-size: 11px; line-height: 1.5;">
                                    This message was emailed to {email} by The Dating App.
                                </p>
                                
                                <p style="margin: 10px 0 0 0; color: #737373; font-size: 11px; line-height: 1.5;">
                                    Made with ❤️ in Hyderabad
                                </p>
                            </td>
                        </tr>
                    </table>

                </td>
            </tr>
        </table>
    </body>
    </html>
    """

    # Create plain text version for older email clients
    plain_message = f"""
The Dating App

Enter this code to sign in

{otp_digits}

Enter the code above on your device to sign in to The Dating App.

This code will expire in 5 minutes.

If you didn't send this request, you can ignore this email or review your recent device activity.

To help security, please don't share this code with anyone.

The Dating App team

---
Help Centre | Terms of Use | Privacy

This message was emailed to {email} by The Dating App.
Made with ❤️ in Hyderabad
    """.strip()

    # Send the email
    send_mail(
        subject=subject,
        message=plain_message,
        from_email=from_email,
        recipient_list=[email],
        html_message=html_message
    )

    # Cache the OTP
    cache.set(f"login_otp_{email}", otp, timeout=300)

def is_blocked(sender, receiver):
    return BlockedUser.objects.filter(
        blocker=receiver,
        blocked=sender
    ).exists()


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
    Staff users should use /api/admin/login/ instead.
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

        # 🔥 NEW: If user is staff, they should use admin login endpoint
        if user.is_staff:
            return Response(
                {"detail": "Staff users must use admin login endpoint"},
                status=status.HTTP_403_FORBIDDEN,
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

    def post(self, request):
        """
        Save/update onboarding profile payload.
        Expects:
          - onboarding_step (int): current step number (1..10)
          - other profile fields
        """
        email = request.user.username
        data = dict(request.data)

        # --- get step from payload ---
        try:
            step = int(data.get("onboarding_step", 0))
        except (TypeError, ValueError):
            step = 0

        TOTAL_STEPS = 10
        if step < 0:
            step = 0
        if step > TOTAL_STEPS:
            step = TOTAL_STEPS

        # --- compute completion percentage ---
        completion_percentage = 0
        if TOTAL_STEPS > 0 and step > 0:
            completion_percentage = round(step / TOTAL_STEPS * 100, 1)

        # --- normalize photos to list[str] ---
        photos = data.get("photos")
        if photos is not None:
            if isinstance(photos, str):
                data["photos"] = [photos]
            elif isinstance(photos, list):
                data["photos"] = [str(p) for p in photos]

        # Store step + completion in profile
        data["onboarding_step"] = step
        data["completion_percentage"] = completion_percentage

        FirebaseProfileManager.create_profile(email, **data)
        updated_profile = FirebaseProfileManager.get_profile(email) or {}

        return Response(
            {
                "message": "Profile saved",
                "step": step,
                "completion_percentage": completion_percentage,
                "profile": updated_profile,
            },
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

# views.py


# ----------------- helpers ----------------- #

def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    c = 2 * asin(sqrt(a))
    return R * c


def list_overlap(a, b):
    a = a or []
    b = b or []
    if not a or not b:
        return 0.0
    sa, sb = set(a), set(b)
    inter = len(sa & sb)
    union = len(sa | sb)
    return inter / union


def categorical_exact(a, b):
    return 1.0 if a and b and a == b else 0.0


def distance_similarity_km(distance_km, hard_limit_km):
    if not hard_limit_km or hard_limit_km <= 0:
        return 0.0
    return max(0.0, 1.0 - distance_km / hard_limit_km)


WEIGHTS = {
    "sexual_orientation": 0.30,
    "relationship_goals": 0.25,
    "communication":      0.15,
    "lifestyle":          0.15,
    "interests":          0.10,
    "distance_soft":      0.05,
}


def normalize_gender(label: str | None) -> str | None:
    if not label:
        return None

    label = label.lower().strip()

    if label in ("male", "man", "m"):
        return "man"

    if label in ("female", "woman", "f"):
        return "woman"

    return None  # reject invalid values


def normalize_interested_in(values):
    # Firestore: ["Men"] / ["Women"]
    out = []
    for v in values or []:
        v = v.lower()
        if v.startswith("men") or v.startswith("man"):
            out.append("man")
        elif v.startswith("women") or v.startswith("woman"):
            out.append("woman")
    return out


def normalize_mysql_profile(profile: UserProfile) -> dict:
    return {
        "email": profile.user.email or profile.user.username,
        "gender": normalize_gender(profile.gender),

        # lifestyle
        "drinking": profile.drinking,
        "smoking": profile.smoking,
        "workout": profile.workout,
        "pets": profile.pets,

        # communication
        "preferred_connect": profile.communication_style or [],
        "response_pace": profile.response_pace,

        # interests
        "interests": profile.interests or [],

        # distance
        "max_distance_km": profile.distance,

        # geo (future)
        "lat": None,
        "lng": None,
    }



def profile_similarity(u, v, distance_km, max_dist_km):
    s_orientation = list_overlap(u.get("sexual_orientation"), v.get("sexual_orientation"))
    s_goals = list_overlap(u.get("relationship_goals"), v.get("relationship_goals"))

    s_comm_pref = list_overlap(u.get("preferred_connect"), v.get("preferred_connect"))
    s_comm_pace = categorical_exact(u.get("response_pace"), v.get("response_pace"))
    s_comm = 0.7 * s_comm_pref + 0.3 * s_comm_pace

    s_lifestyle = (
        0.25 * categorical_exact(u.get("drinking"), v.get("drinking")) +
        0.25 * categorical_exact(u.get("smoking"), v.get("smoking")) +
        0.25 * categorical_exact(u.get("workout"), v.get("workout")) +
        0.25 * categorical_exact(u.get("pets"), v.get("pets"))
    )

    s_interests = list_overlap(u.get("interests"), v.get("interests"))

    # if no coords, ignore distance in score
    if distance_km is None or max_dist_km is None:
        s_dist = 0.0
        dist_weight = 0.0
    else:
        s_dist = distance_similarity_km(distance_km, max_dist_km)
        dist_weight = WEIGHTS["distance_soft"]

    base = (
        WEIGHTS["sexual_orientation"] * s_orientation +
        WEIGHTS["relationship_goals"] * s_goals +
        WEIGHTS["communication"]      * s_comm +
        WEIGHTS["lifestyle"]          * s_lifestyle +
        WEIGHTS["interests"]          * s_interests
    )
    return base + dist_weight * s_dist

def serialize_profile(profile: UserProfile) -> dict:
    return {
        "id": profile.user.id,
        "email": profile.user.email,
        "username": profile.user.username,
        "first_name": profile.first_name,
        "age": profile.age,
        "gender": profile.gender,
        "distance": profile.distance,
        "lifestyle": {
            "drinking": profile.drinking,
            "smoking": profile.smoking,
            "workout": profile.workout,
            "pets": profile.pets,
        },
        "communication": {
            "style": profile.communication_style,
            "response_pace": profile.response_pace,
        },
        "interests": profile.interests,
        "location": profile.location,
        "photos": profile.photos,
        "bio": profile.bio,
        "conversation_starter": profile.conversation_starter,
        "verified": profile.verified,
        "premium": profile.premium,
        "last_active": profile.last_active,
    }






class MatchRecommendationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # ----------------------------------
        # 1. Identify current user
        # ----------------------------------
        email = (request.user.email or request.user.username).lower()

        try:
            me_profile = UserProfile.objects.select_related("user").get(
                Q(user__email=email) | Q(user__username=email)
            )
        except UserProfile.DoesNotExist:
            return Response({"detail": "Profile not found"}, status=404)

        # ----------------------------------
        # 2. Gender preference
        # ----------------------------------
        my_gender = normalize_gender(me_profile.gender)

        if my_gender == "man":
            target_gender_db = "Woman"
        elif my_gender == "woman":
            target_gender_db = "Man"
        else:
            return Response({"detail": "Invalid gender"}, status=400)

        # ----------------------------------
        # 3. Fetch MATCHED users
        # ----------------------------------
        matched_qs = Match.objects.filter(
            Q(user_a=email) | Q(user_b=email),
            status="active"
        ).values_list("user_a", "user_b")

        matched_emails = set()
        for a, b in matched_qs:
            matched_emails.add(a.lower())
            matched_emails.add(b.lower())

        matched_emails.discard(email)

        # ----------------------------------
        # 4. Fetch LIKED users
        # ----------------------------------
        liked_emails = set(
            Like.objects.filter(from_email=email)
            .values_list("to_email", flat=True)
        )

        # ----------------------------------
        # 5. Fetch BLOCKED users
        # ----------------------------------
        blocked_emails = set(
            BlockedUser.objects.filter(blocker=email)
            .values_list("blocked", flat=True)
        )

        # ----------------------------------
        # 6. Build candidate queryset
        # ----------------------------------
        others = (
            UserProfile.objects
            .select_related("user")
            .filter(
                gender=target_gender_db,
                account_status="active"
            )
            .exclude(user=me_profile.user)
            .exclude(
                Q(user__email__in=matched_emails) |
                Q(user__username__in=matched_emails)
            )
            .exclude(
                Q(user__email__in=liked_emails) |
                Q(user__username__in=liked_emails)
            )
            .exclude(
                Q(user__email__in=blocked_emails) |
                Q(user__username__in=blocked_emails)
            )
        )

        # ----------------------------------
        # 7. Similarity scoring
        # ----------------------------------
        me_data = serialize_profile(me_profile)
        results = []

        for other_profile in others:
            other_data = serialize_profile(other_profile)

            similarity = profile_similarity(
                me_data,
                other_data,
                None,
                None
            )

            results.append({
                "similarity": round(similarity * 100, 1),
                "profile": other_data
            })

        results.sort(key=lambda x: x["similarity"], reverse=True)
        return Response(results)

# class LikeProfileView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         from_email = request.user.username
#         to_email = request.data.get("to_email")

#         if not to_email:
#             return Response(
#                 {"error": "to_email is required"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         result = FirebaseLikeManager.send_like(
#             from_email=from_email,
#             to_email=to_email
#         )

#         if result.get("status") == "matched":
#             match = result.get("match")

#             try:
#                 to_user = User.objects.get(username=to_email)
#             except User.DoesNotExist:
#                 pass
#             else:
#                 notify_user(
#                     to_user.id,
#                     {
#                         "type": "MATCH_CREATED",
#                         "match_id": match["match_id"],
#                         "chat_id": match["chat_id"],
#                         "from_email": from_email,
#                     }
#                 )


#         return Response(result, status=status.HTTP_200_OK)
class LikeProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from_email = request.user.email.lower()
        to_email = request.data.get("to_email")

        if not to_email:
            return Response(
                {"error": "to_email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        result = FirebaseLikeManager.send_like(
            from_email=from_email,
            to_email=to_email
        )

        # 🔔 If matched → notify both users
        if result.get("status") == "matched":
            match = result["match"]

            notify_user(from_email, {
                "type": "MATCH_CREATED",
                "match_id": match["match_id"],
                "chat_id": match["chat_id"],
                "from_email": to_email,
            })

            notify_user(to_email, {
                "type": "MATCH_CREATED",
                "match_id": match["match_id"],
                "chat_id": match["chat_id"],
                "from_email": from_email,
            })

            # 🔥 VERY IMPORTANT: flatten response for frontend
            return Response({
                "status": "matched",
                "match_id": match["match_id"],
                "chat_id": match["chat_id"],
            }, status=status.HTTP_200_OK)

        return Response(result, status=status.HTTP_200_OK)



# class MatchedChatsView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         my_email = request.user.username

#         matches_ref = (
#             db.collection("matches")
#             .where("users", "array_contains", my_email)
#         )

#         chats = []

#         for match_doc in matches_ref.stream():
#             match = match_doc.to_dict() or {}

#             chat_id = match.get("chat_id")
#             users = match.get("users", [])

#             # Enforce invariant: active chat must exist
#             if not chat_id or len(users) != 2:
#                 continue

#             other_email = users[0] if users[1] == my_email else users[1]

#             profile = FirebaseProfileManager.get_profile(other_email) or {}

#             chats.append({
#                 "chat_id": chat_id,
#                 "email": other_email,
#                 "first_name": profile.get("firstName"),
#                 "profile_photo": (
#                     profile.get("photos", [None])[0]
#                     if profile.get("photos")
#                     else None
#                 ),
#             })

#         return Response(chats, status=status.HTTP_200_OK)

class MatchedChatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        my_email = request.user.username.lower()

        matches = Match.objects.filter(
            Q(user_a=my_email) | Q(user_b=my_email)
        ).select_related("chat")

        chats = []

        for match in matches:
            # Determine other user
            if match.user_a == my_email:
                other_email = match.user_b
            else:
                other_email = match.user_a

            # ✅ Block checks (MUST be inside loop)
            is_blocked_by_me = BlockedUser.objects.filter(
                blocker=my_email,
                blocked=other_email
            ).exists()

            is_blocked_me = BlockedUser.objects.filter(
                blocker=other_email,
                blocked=my_email
            ).exists()

            profile = FirebaseProfileManager.get_profile(other_email) or {}

            chats.append({
                "chat_id": match.chat.id if match.chat else None,
                "match_id": match.id,
                "status": match.status,
                "created_at": match.created_at.isoformat(),
                "user_email": my_email,
                "email": other_email,
                "first_name": profile.get("firstName"),
                "profile_photo": (
                    profile.get("photos", [None])[0]
                    if profile.get("photos")
                    else None
                ),
                # ✅ expose block info to frontend
                "blocked_by_me": is_blocked_by_me,
                "blocked_me": is_blocked_me,
            })

        return Response(chats, status=status.HTTP_200_OK)

class ChatMessagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, chat_id):
        user_email = request.user.username.lower()

        chat = MySQLChatManager.get_chat(chat_id)
        if not chat:
            return Response(
                {"detail": "Chat not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if user_email not in chat["participants"]:
            return Response(
                {"detail": "Forbidden"},
                status=status.HTTP_403_FORBIDDEN
            )

        messages = MySQLChatManager.get_messages(chat_id)

        return Response(messages, status=status.HTTP_200_OK)


class SendChatMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, chat_id):
        sender = request.user.username.lower()
        content = request.data.get("content")

        chat = MySQLChatManager.get_chat(chat_id)
        if not chat or sender not in chat["participants"]:
            return Response({"detail": "Forbidden"}, status=403)

        receiver = next(e for e in chat["participants"] if e != sender)

        # 🚫 BLOCK CHECK (THIS IS THE KEY)
        is_blocked = BlockedUser.objects.filter(
            Q(blocker=receiver, blocked=sender) |
            Q(blocker=sender, blocked=receiver)
        ).exists()

        if is_blocked:
            return Response(
                {"detail": "You cannot send messages to this user"},
                status=status.HTTP_403_FORBIDDEN
            )

        # ✅ ONLY NOW create & broadcast
        MySQLChatManager.add_message(
            chat_id=chat_id,
            sender=sender,
            receiver=receiver,
            content=content
        )

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"chat_{chat_id}",
            {
                "type": "chat.message",
                "message": {
                    "sender": sender,
                    "receiver": receiver,
                    "content": content,
                }
            }
        )

        return Response({"status": "sent"}, status=201)

class BlockUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        blocker = request.user.username.lower()
        blocked = request.data.get("email")

        if not blocked:
            return Response(
                {"detail": "Blocked email required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        BlockedUser.objects.get_or_create(
            blocker=blocker,
            blocked=blocked.lower()
        )

        return Response({"status": "blocked"}, status=status.HTTP_200_OK)

class UnblockUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        blocker = request.user.username.lower()
        blocked = request.data.get("email")

        BlockedUser.objects.filter(
            blocker=blocker,
            blocked=blocked.lower()
        ).delete()

        return Response({"status": "unblocked"}, status=status.HTTP_200_OK)


class MarkChatReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, chat_id):
        user_email = request.user.username.lower()

        chat = MySQLChatManager.get_chat(chat_id)
        if not chat or user_email not in chat["participants"]:
            return Response(
                {"detail": "Forbidden"},
                status=status.HTTP_403_FORBIDDEN
            )

        MySQLChatManager.mark_read(
            chat_id=chat_id,
            receiver_email=user_email
        )

        return Response({"status": "ok"}, status=status.HTTP_200_OK)

class CreateUserReportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreateUserReportSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        reported_user = User.objects.get(
            id=serializer.validated_data['reported_user_id']
        )

        # Prevent self-reporting
        if reported_user == request.user:
            return Response(
                {"error": "You cannot report yourself"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Optional: prevent duplicate pending reports
        if UserReport.objects.filter(
            reporter=request.user,
            reported_user=reported_user,
            status='pending'
        ).exists():
            return Response(
                {"error": "You already reported this user"},
                status=status.HTTP_400_BAD_REQUEST
            )

        report = UserReport.objects.create(
            reporter=request.user,
            reported_user=reported_user,
            reason=serializer.validated_data['reason'],
            description=serializer.validated_data['description'],
        )

        return Response(
            {"message": "Report submitted successfully"},
            status=status.HTTP_201_CREATED
        )