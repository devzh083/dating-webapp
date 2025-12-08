from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User

from .models import FirebaseUserManager

import urllib.parse
import requests

from django.conf import settings
from django.contrib.auth import get_user_model
from django.shortcuts import redirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response(
                {'detail': 'Username and password required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {'detail': 'Username already exists'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create Django User
        user = User.objects.create_user(username=username, password=password)
        
        # Create Firebase profile
        FirebaseUserManager.create_user(username=username)
        
        return Response({
            'message': 'User created successfully',
            'user_id': user.id,
            'username': user.username
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response(
                {'detail': 'Username and password required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(username=username, password=password)
        if not user:
            return Response(
                {'detail': 'Invalid credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)
        firebase_user = FirebaseUserManager.get_user_by_username(username)

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'firebase_data': firebase_user or {}
            }
        }, status=status.HTTP_200_OK)

class ProfileView(APIView):
    def get(self, request):
        firebase_user = FirebaseUserManager.get_user_by_username(request.user.username)
        return Response({
            'django_user': {
                'id': request.user.id,
                'username': request.user.username,
            },
            'firebase_data': firebase_user or {}
        })

class GoogleLoginView(APIView):
    """
    Step 1: Frontend calls GET /api/google-login/
    Response: { "auth_url": "https://accounts.google.com/o/oauth2/v2/auth?..." }
    Frontend then redirects the browser to auth_url to show the Google consent screen.
    """

    def get(self, request):
        base_url = "https://accounts.google.com/o/oauth2/v2/auth"
        params = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "redirect_uri": settings.GOOGLE_CALLBACK_URL,
            "response_type": "code",
            "scope": "openid email profile",  # minimal info: id, email, name [web:78]
            "access_type": "offline",        # ask for refresh token (shows consent) [web:71][web:74]
            "prompt": "consent",             # always show consent screen
        }
        url = f"{base_url}?{urllib.parse.urlencode(params)}"
        print("Google OAuth redirect URL:", url)
        return Response({"auth_url": url}, status=status.HTTP_200_OK)


class GoogleCallbackView(APIView):
    """
    Step 2: Google redirects the user back to GOOGLE_CALLBACK_URL with ?code=...
    This view exchanges code for Google tokens, gets user info, upserts local User,
    generates your own JWT tokens, and then redirects to the frontend with result.
    """

    def get(self, request):
        code = request.GET.get("code")
        if not code:
            return redirect(f"{settings.FRONTEND_URL}/login?error=oauth_no_code")

        # Exchange code for Google tokens
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
        google_refresh_token = token_json.get("refresh_token")  # may be None
        if not google_access_token:
            return redirect(f"{settings.FRONTEND_URL}/login?error=oauth_no_tokens")

        # Get user info from Google
        userinfo_url = "https://www.googleapis.com/oauth2/v3/userinfo"
        userinfo_res = requests.get(
            userinfo_url,
            headers={"Authorization": f"Bearer {google_access_token}"},
        )
        userinfo = userinfo_res.json()

        email = userinfo.get("email")
        name = userinfo.get("name")
        google_user_id = userinfo.get("sub")  # unique Google subject

        if not email:
            return redirect(f"{settings.FRONTEND_URL}/login?error=oauth_no_email")

        # Upsert user in your DB using Django's auth model
        user, created = User.objects.get_or_create(
            username=email, defaults={"email": email}
        )

        # Optionally store Google info on user/profile model
        # if hasattr(user, "google_id"):
        #     user.google_id = google_user_id
        #     user.full_name = name
        #     user.save()

        # Generate your own JWT tokens for this user
        refresh = RefreshToken.for_user(user)
        access_token_jwt = str(refresh.access_token)
        refresh_token_jwt = str(refresh)

        # For a **demo/simple** approach, redirect with JWTs in query (not ideal in prod)
        redirect_url = (
            f"{settings.FRONTEND_HOME_URL}"
            f"?access_token={urllib.parse.quote(access_token_jwt)}"
            f"&refresh_token={urllib.parse.quote(refresh_token_jwt)}"
            f"&email={urllib.parse.quote(email)}"
            f"&name={urllib.parse.quote(name or '')}"
            f"&google_id={urllib.parse.quote(google_user_id or '')}"
        )
        print("Redirect URL:", redirect_url)
        return redirect(redirect_url)