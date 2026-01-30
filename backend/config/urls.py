from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from admin_panel.views import (
    public_premium_plans, 
    public_premium_features,
    public_expert_tips,
    ApprovedReviewsView,  
    SubmitReviewView,     
)

urlpatterns = [
    path("admin/", admin.site.urls),

    # ==========================================
    # ✅ PUBLIC ENDPOINTS (no auth required or basic auth only)
    # ==========================================
    
    # Premium & Features
    path('api/premium/plans/', public_premium_plans, name='public-premium-plans'),
    path('api/premium/features/', public_premium_features, name='public-premium-features'),
    path('api/expert-tips/', public_expert_tips, name='public-expert-tips'),
    
    # Reviews (public endpoints)
    path('api/reviews/approved/', ApprovedReviewsView.as_view(), name='public-approved-reviews'),  # ✅ NEW: View approved reviews
    path('api/reviews/submit/', SubmitReviewView.as_view(), name='public-submit-review'),          # ✅ NEW: Submit new review
    
    # ==========================================
    # APP-SPECIFIC API ROUTES
    # ==========================================
    
    # All login app APIs under /api/
    path("api/", include("login.urls")),
    path('api/profile/', include('profiles.urls')),
    
    # Admin panel (admin-only endpoints)
    path('api/admin/', include('admin_panel.urls')),  

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)