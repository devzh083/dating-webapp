from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AdminDashboardViewSet,
    UserManagementViewSet,
    ReportManagementViewSet,
    AdminActionViewSet,
    AdminLoginView,  
)

router = DefaultRouter()
router.register(r'dashboard', AdminDashboardViewSet, basename='admin-dashboard')
router.register(r'users', UserManagementViewSet, basename='admin-users')
router.register(r'reports', ReportManagementViewSet, basename='admin-reports')
router.register(r'actions', AdminActionViewSet, basename='admin-actions')

urlpatterns = [
    path('login/', AdminLoginView.as_view(), name='admin-login'),  
    path('', include(router.urls)),
]