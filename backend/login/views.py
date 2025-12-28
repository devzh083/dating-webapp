from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.auth import authenticate, get_user_model
from django.conf import settings
from django.shortcuts import redirect
from django.core.mail import send_mail
from django.core.cache import cache
from django.db.models import Q

import urllib.parse
import requests
import random
import string
from datetime import date

from .models import FirebaseAuthManager
from profiles.models import UserProfile
from profiles.serializers import UserProfileSerializer

User = get_user_model()


# ============================================
# OTP HELPERS
# ============================================

def generate_otp(length=6):
    digits = string.digits
    return "".join(random.choice(digits) for _ in range(length))


def send_otp_email(email, otp):
    subject = "Your login OTP"
    message = f"Your OTP for login is: {otp}. It is valid for 5 minutes."
    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", settings.EMAIL_HOST_USER)
    send_mail(subject, message, from_email, [email])
    cache.set(f"login_otp_{email}", otp, timeout=300)


# ============================================
# AUTH STATUS VIEW
# ============================================

class AuthStatusView(APIView):
    """
    Returns whether the authenticated user already has a profile.
    Uses Django models instead of Firebase.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        email = request.user.username
        firebase_user = FirebaseAuthManager.get_user_by_email(email)
        
        # Check Django database for profile
        try:
            profile = UserProfile.objects.get(user=request.user)
            profile_exists = True
            profile_complete = profile.is_complete
            profile_data = UserProfileSerializer(profile).data
        except UserProfile.DoesNotExist:
            profile_exists = False
            profile_complete = False
            profile_data = None

        return Response(
            {
                "email": email,
                "profile_exists": profile_exists,
                "has_profile": profile_exists,
                "profile_complete": profile_complete,
                "is_verified": firebase_user.get("is_verified", False) if firebase_user else False,
                "firebase_user": firebase_user or {},
                "profile": profile_data,
            },
            status=status.HTTP_200_OK,
        )


# ============================================
# REGISTRATION & LOGIN
# ============================================

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
        
        # Get Django profile instead of Firebase
        try:
            profile = UserProfile.objects.get(user=user)
            profile_data = UserProfileSerializer(profile).data
        except UserProfile.DoesNotExist:
            profile_data = {}

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
                    "profile": profile_data,
                },
            },
            status=status.HTTP_200_OK,
        )


# ============================================
# GOOGLE OAUTH
# ============================================

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
    Handles Google OAuth callback, updates Firebase user,
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
            return redirect(f"{settings.FRONTEND_URL}/login?error=oauth_no_tokens")

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


# ============================================
# OTP EMAIL VERIFICATION
# ============================================

class SendLoginOTPView(APIView):
    """
    Step 1: Send OTP to email if user exists and not verified.
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
    Step 2: Verify OTP and return JWT tokens (for unverified users).
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
        
        # Get Django profile instead of Firebase
        try:
            profile = UserProfile.objects.get(user=user)
            profile_data = UserProfileSerializer(profile).data
        except UserProfile.DoesNotExist:
            profile_data = {}

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "email": username,
                    "is_verified": True,
                    "firebase_user": firebase_user or {},
                    "profile": profile_data,
                },
            },
            status=status.HTTP_200_OK,
        )


# ============================================
# MATCHING ALGORITHM
# ============================================

class MatchRecommendationsView(APIView):
    """
    Returns potential matches based on user preferences and compatibility.
    Uses Django database instead of Firebase.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Get current user's profile from Django database
        try:
            my_profile = UserProfile.objects.get(user=request.user)
        except UserProfile.DoesNotExist:
            return Response(
                {"detail": "Profile not found. Please complete your profile."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get my preferences
        my_gender = my_profile.gender
        my_interested_in = my_profile.interested_in  # List of genders I'm interested in
        
        if not my_gender or not my_interested_in:
            return Response(
                {"detail": "Please complete your gender and preference settings"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Query for potential matches from Django database
        # Find profiles where their gender is in my interested_in list
        potential_matches = UserProfile.objects.exclude(
            user=request.user
        ).filter(
            gender__in=my_interested_in
        )

        results = []
        
        for other_profile in potential_matches:
            # Check mutual interest: do they want my gender?
            if my_gender not in other_profile.interested_in:
                continue
            
            # Calculate similarity score
            sim = self.calculate_similarity(my_profile, other_profile)
            
            # Get user email
            other_email = other_profile.user.email or other_profile.user.username
            
            # Build response data
            results.append({
                "email": other_email,
                "similarity": round(sim * 100, 1),
                "distance_km": None,  # Can add distance calculation later
                "profile": {
                    "firstName": other_profile.first_name,
                    "tagline": other_profile.bio[:100] if other_profile.bio else "",
                    "starter": other_profile.conversation_starter,
                    "interests": other_profile.interests,
                    "photos": other_profile.photos,
                    "age": self.calculate_age(other_profile.date_of_birth) if other_profile.date_of_birth else None,
                }
            })
        
        # Sort by similarity score (highest first)
        results.sort(key=lambda x: x["similarity"], reverse=True)
        
        return Response(results, status=status.HTTP_200_OK)

    def calculate_similarity(self, profile1, profile2):
        """Calculate similarity score between two profiles (0.0 to 1.0)"""
        score = 0.0
        weights = {
            "orientation": 0.30,
            "relationship": 0.25,
            "communication": 0.15,
            "lifestyle": 0.15,
            "interests": 0.10,
            "other": 0.05,
        }
        
        # 1. Orientation similarity
        orientation_overlap = self.list_overlap(
            profile1.orientation,
            profile2.orientation
        )
        score += weights["orientation"] * orientation_overlap
        
        # 2. Relationship type similarity
        relationship_match = 1.0 if profile1.relationship_type == profile2.relationship_type else 0.0
        score += weights["relationship"] * relationship_match
        
        # 3. Communication style similarity
        comm_overlap = self.list_overlap(
            profile1.communication_style,
            profile2.communication_style
        )
        response_match = 1.0 if profile1.response_pace == profile2.response_pace else 0.0
        comm_score = 0.7 * comm_overlap + 0.3 * response_match
        score += weights["communication"] * comm_score
        
        # 4. Lifestyle similarity
        lifestyle_score = (
            (1.0 if profile1.drinking == profile2.drinking else 0.0) * 0.25 +
            (1.0 if profile1.smoking == profile2.smoking else 0.0) * 0.25 +
            (1.0 if profile1.workout == profile2.workout else 0.0) * 0.25 +
            (1.0 if profile1.pets == profile2.pets else 0.0) * 0.25
        )
        score += weights["lifestyle"] * lifestyle_score
        
        # 5. Interests overlap
        interests_overlap = self.list_overlap(
            profile1.interests,
            profile2.interests
        )
        score += weights["interests"] * interests_overlap
        
        return min(score, 1.0)  # Cap at 1.0

    def list_overlap(self, list1, list2):
        """Calculate Jaccard similarity between two lists"""
        if not list1 or not list2:
            return 0.0
        
        set1 = set(list1)
        set2 = set(list2)
        
        intersection = len(set1 & set2)
        union = len(set1 | set2)
        
        if union == 0:
            return 0.0
        
        return intersection / union
    
    def calculate_age(self, date_of_birth):
        """Calculate age from date of birth"""
        if not date_of_birth:
            return None
        
        today = date.today()
        age = today.year - date_of_birth.year
        
        # Adjust if birthday hasn't occurred this year
        if today.month < date_of_birth.month or (
            today.month == date_of_birth.month and today.day < date_of_birth.day
        ):
            age -= 1
        
        return age