from django.urls import path
from . import views

urlpatterns = [
    # Auth endpoints
    path("register/", views.RegisterView.as_view(), name="register"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("google-login/", views.GoogleLoginView.as_view(), name="google-login"),
    path("google-callback/", views.GoogleCallbackView.as_view(), name="google-callback"),

    # Profile endpoints
    path("profile/", views.ProfileView.as_view(), name="profile"),
    path("profile/<path:email>/", views.ProfileDetailView.as_view(), name="profile-detail"),

    # Photo upload (media + URL stored in Firestore)
    path("photos/upload/", views.PhotoUploadView.as_view(), name="photo-upload"),

    # Auth status (existing vs new user)
    path("auth/status/", views.AuthStatusView.as_view(), name="auth-status"),

    # OTP login
    path("login/send-otp/", views.SendLoginOTPView.as_view(), name="send-login-otp"),
    path("login/verify-otp/", views.VerifyLoginOTPView.as_view(), name="verify-login-otp"),

    # Match recommendations
    path("matches/", views.MatchRecommendationsView.as_view(), name="matches"),

    path("like/", views.LikeProfileView.as_view()),
    # path("matches/accept/", views.AcceptMatchView.as_view(), name="accept_match"),

    path("chats/matched/", views.MatchedChatsView.as_view(), name="matched-chats"),

]
