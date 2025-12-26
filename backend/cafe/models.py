from django.db import models

class Cafe(models.Model):
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    cuisine = models.CharField(max_length=100)

    rating = models.FloatField(default=0)
    price_for_two = models.IntegerField()

    address = models.CharField(max_length=255)
    area = models.CharField(max_length=100)

    has_table_booking = models.BooleanField(default=False)
    pure_veg = models.BooleanField(default=False)
    serves_alcohol = models.BooleanField(default=False)
    rooftop = models.BooleanField(default=False)

    image = models.ImageField(upload_to="cafes/")
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Booking(models.Model):
    cafe = models.ForeignKey(Cafe, on_delete=models.CASCADE, related_name="bookings")
    user_name = models.CharField(max_length=100)
    user_phone = models.CharField(max_length=15)

    date = models.DateField()
    time = models.TimeField()
    guests = models.IntegerField()

    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("cancelled", "Cancelled"),
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    created_at = models.DateTimeField(auto_now_add=True)
