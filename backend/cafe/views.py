from rest_framework import viewsets, filters
from .models import Cafe, Booking
from .serializers import CafeSerializer, BookingSerializer

class CafeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Cafe.objects.filter(is_active=True)
    serializer_class = CafeSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "cuisine", "area"]

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
