# config/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),

    # All login app APIs under /api/
    path("api/", include("login.urls")),
    path('api/profile/', include('profiles.urls')),
    path('api/admin/', include('admin_panel.urls')),  

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
