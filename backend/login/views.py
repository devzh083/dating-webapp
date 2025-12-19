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

from math import radians, sin, cos, asin, sqrt

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from config.firebase import db
from .models import FirebaseProfileManager



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
    label = label.lower()
    if label.startswith("man"):
        return "man"
    if label.startswith("woman") or label.startswith("female"):
        return "woman"
    return label  # fallback


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


def normalize_profile(raw: dict) -> dict:
    """Convert Firestore schema -> algorithm schema."""
    if not raw:
        return {}

    gender = normalize_gender(raw.get("gender"))
    interested_in = normalize_interested_in(raw.get("interestedIn", []))

    return {
        "email": raw.get("email"),
        "gender": gender,
        "interested_in_genders": interested_in,

        # arrays
        "sexual_orientation": raw.get("orientation", []),
        "preferred_connect": raw.get("communicationStyle", []),
        "interests": raw.get("interests", []),

        # single string -> list
        "relationship_goals": [raw["relationshipType"]] if raw.get("relationshipType") else [],

        # lifestyle
        "drinking": raw.get("drinking"),
        "smoking": raw.get("smoking"),
        "workout": raw.get("workout"),
        "pets": raw.get("pets"),

        # communication pace
        "response_pace": raw.get("responsePace"),

        # distance - keep numeric if present
        "max_distance_km": raw.get("distance"),
        # geo coords (only if you later add them)
        "lat": raw.get("lat"),
        "lng": raw.get("lng"),
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


class MatchRecommendationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # email may be in email or username depending on your user model
        email = getattr(request.user, "email", None) or getattr(request.user, "username", None)
        if not email:
            return Response({"detail": "Authenticated user has no email associated"}, status=400)

        raw_me = FirebaseProfileManager.get_profile(email)
        if not raw_me:
            return Response({"detail": "Profile not found for this email"}, status=404)

        me = normalize_profile(raw_me)
        my_gender = me.get("gender")
        my_interested_in = me.get("interested_in_genders")

        if not my_gender or not my_interested_in:
            return Response({"detail": "Preference data incomplete on your profile"}, status=400)

        # if you don't yet store lat/lng, distance_km will be None below
        my_lat = me.get("lat")
        my_lng = me.get("lng")
        my_max_dist = me.get("max_distance_km")

        # Firestore query: others who are interested in my gender
        query = db.collection("Profile").where("interestedIn", "array_contains_any", ["Men", "Women"])
        docs = list(query.stream())

        results = []

        for doc in docs:
            raw_other = doc.to_dict() or {}
            other = normalize_profile(raw_other)
            other_email = other.get("email")

            if not other_email or other_email == email:
                continue

            # mutual interest: I like their gender & they like mine
            other_gender = other.get("gender")
            if not other_gender or other_gender not in my_interested_in:
                continue
            if my_gender not in other.get("interested_in_genders", []):
                continue

            # distance (optional if lat/lng present)
            lat2, lng2 = other.get("lat"), other.get("lng")
            if my_lat is not None and my_lng is not None and lat2 is not None and lng2 is not None:
                d_km = haversine_km(my_lat, my_lng, lat2, lng2)
                max_dist = min(my_max_dist or d_km, other.get("max_distance_km") or d_km)
                if my_max_dist and d_km > max_dist:
                    continue
            else:
                d_km = None
                max_dist = None

            sim = profile_similarity(me, other, d_km, max_dist)
            # if sim < 0.60:
            #     continue

            results.append(
                {
                    "email": other_email,
                    "similarity": round(sim * 100, 1),
                    "distance_km": round(d_km, 1) if d_km is not None else None,
                    "profile": raw_other,  # return original Firestore shape
                }
            )

        results.sort(key=lambda x: x["similarity"], reverse=True)
        return Response(results)