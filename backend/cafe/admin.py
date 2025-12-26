from django.contrib import admin
from .models import Cafe, Booking

@admin.register(Cafe)
class CafeAdmin(admin.ModelAdmin):
    list_display = ("name", "area", "rating", "has_table_booking")
    list_filter = ("area", "has_table_booking", "pure_veg", "rooftop")
    search_fields = ("name", "area")

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("cafe", "user_name", "date", "time", "status")
