# profiles/models.py
from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    # Link to Django User (One-to-One relationship)
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='profile',
        primary_key=True
    )
    
    # Step 1: Basic Info
    first_name = models.CharField(max_length=100, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=50, blank=True)
    show_gender = models.BooleanField(default=True)
    interested_in = models.JSONField(default=list, blank=True)
    
    # Step 2: Orientation
    orientation = models.JSONField(default=list, blank=True)
    show_orientation = models.BooleanField(default=True)
    relationship_type = models.CharField(max_length=100, blank=True)
    
    # Step 3: Distance
    distance = models.IntegerField(default=25)
    strict_distance = models.BooleanField(default=False)
    
    # Step 4: Lifestyle
    drinking = models.CharField(max_length=50, blank=True)
    smoking = models.CharField(max_length=50, blank=True)
    workout = models.CharField(max_length=50, blank=True)
    pets = models.CharField(max_length=50, blank=True)
    
    # Step 5: Communication
    communication_style = models.JSONField(default=list, blank=True)
    response_pace = models.CharField(max_length=100, blank=True)
    
    # Step 6: Interests
    interests = models.JSONField(default=list, blank=True)
    
    # Step 7: Location
    location = models.CharField(max_length=200, blank=True)
    use_current_location = models.BooleanField(default=False)
    
    # Step 8: Photos
    photos = models.JSONField(default=list, blank=True)
    
    # Step 9: Bio
    bio = models.TextField(max_length=500, blank=True)
    conversation_starter = models.CharField(max_length=300, blank=True)
    
    # Step 10: Social Accounts
    social_accounts = models.JSONField(default=dict, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_complete = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
    
    def __str__(self):
        return f"{self.user.username}'s Profile"
    
    def save(self, *args, **kwargs):
        # Ensure social_accounts is always a dict, not None
        if self.social_accounts is None:
            self.social_accounts = {}
        
        # Auto-check if profile is complete
        self.is_complete = all([
            self.first_name,
            self.date_of_birth,
            self.gender,
            self.location,
            len(self.photos) > 0 if isinstance(self.photos, list) else False
        ])
        super().save(*args, **kwargs)