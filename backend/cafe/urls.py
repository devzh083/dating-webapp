from rest_framework.routers import DefaultRouter
from .views import CafeViewSet, BookingViewSet

router = DefaultRouter()
router.register("cafes", CafeViewSet)
router.register("bookings", BookingViewSet)

urlpatterns = router.urls
