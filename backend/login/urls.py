from django.urls import path
from . import views

urlpatterns = [
    # Auth endpoints
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('google-login/', views.GoogleLoginView.as_view(), name='google-login'),
    
    # Profile endpoints
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('profiles/<str:user_id>/', views.ProfileDetailView.as_view(), name='profile-detail'),
    
    # Google OAuth callback (must be publicly accessible)
    path('google-callback/', views.GoogleCallbackView.as_view(), name='google-callback'),
]
