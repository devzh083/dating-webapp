from rest_framework import serializers
from .models import Cafe, Booking

class CafeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cafe
        fields = "__all__"

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = "__all__"
