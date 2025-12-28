from django.urls import path
from . import views

# Import profile views from the profiles app
from profiles import views as profile_views

urlpatterns = [
    # ========== AUTHENTICATION ==========
    path("register/", views.RegisterView.as_view(), name="register"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("google-login/", views.GoogleLoginView.as_view(), name="google-login"),
    path("google-callback/", views.GoogleCallbackView.as_view(), name="google-callback"),
    
    # Auth status
    path("auth/status/", views.AuthStatusView.as_view(), name="auth-status"),
    
    # OTP login
    path("login/send-otp/", views.SendLoginOTPView.as_view(), name="send-login-otp"),
    path("login/verify-otp/", views.VerifyLoginOTPView.as_view(), name="verify-login-otp"),
    
    # ========== PROFILE (Using profiles app) ==========
    path("profile/", profile_views.get_profile, name="profile"),
    path("profile/save/", profile_views.create_or_update_profile, name="save-profile"),
    path("profile/status/", profile_views.profile_status, name="profile-status"),
    path("profile/upload-photo/", profile_views.upload_photo, name="upload-photo"),
    
    # ========== MATCHING ==========
    path("matches/", views.MatchRecommendationsView.as_view(), name="matches"),
]