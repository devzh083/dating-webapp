from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from decimal import Decimal
# Ensure you have the 'profiles' app. If not, comment this import out.
from profiles.models import UserProfile 

class PremiumPlan(models.Model):
    """Model for managing premium subscription plans"""
    
    PLAN_TYPES = [
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('biannual', '6 Months'),
        ('annual', 'Annual'),
    ]
    
    ICON_CHOICES = [
        ('zap', 'Zap'),
        ('flame', 'Flame'),
        ('trending-up', 'Trending Up'),
        ('crown', 'Crown'),
        ('star', 'Star'),
    ]
    
    plan_id = models.CharField(max_length=50, unique=True, primary_key=True)
    name = models.CharField(max_length=100)
    duration = models.CharField(max_length=50)
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPES)
    
    # Pricing
    price = models.DecimalField(max_digits=10, decimal_places=2)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    # Allow blank so model can calculate it
    price_per_month = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount_text = models.CharField(max_length=50, null=True, blank=True)
    
    # Display
    icon = models.CharField(max_length=20, choices=ICON_CHOICES, default='zap')
    color = models.CharField(max_length=100, default='from-blue-500 to-cyan-500')
    gradient = models.CharField(max_length=100, default='bg-gradient-to-br from-blue-500 to-cyan-500')
    popular = models.BooleanField(default=False)
    
    # Features
    features = models.JSONField(default=list, help_text="List of features for this plan")
    
    # Metadata
    active = models.BooleanField(default=True)
    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['display_order', 'price']
        verbose_name = 'Premium Plan'
        verbose_name_plural = 'Premium Plans'
    
    def __str__(self):
        return f"{self.name} - {self.price}"
    
    def save(self, *args, **kwargs):
        # Auto-calculate price per month if missing or zero
        if not self.price_per_month:
            months_map = {
                'monthly': 1,
                'quarterly': 3,
                'biannual': 6,
                'annual': 12,
            }
            months = months_map.get(self.plan_type, 1)
            # Use Decimal for precision
            self.price_per_month = self.price / Decimal(months)
        
        # Auto-calculate discount text if original price exists
        if self.original_price and self.original_price > self.price:
            discount_percent = ((self.original_price - self.price) / self.original_price) * 100
            self.discount_text = f"Save {int(discount_percent)}%"
        
        super().save(*args, **kwargs)


class PremiumFeature(models.Model):
    """Model for managing premium features displayed on the premium page"""
    
    ICON_CHOICES = [
        ('eye', 'Eye'),
        ('zap', 'Zap'),
        ('message-circle', 'Message Circle'),
        ('map-pin', 'Map Pin'),
        ('shield', 'Shield'),
        ('star', 'Star'),
        ('heart', 'Heart'),
        ('crown', 'Crown'),
        ('filter', 'Filter'), 
    ]
    
    title = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=20, choices=ICON_CHOICES, default='star')
    
    active = models.BooleanField(default=True)
    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['display_order']
        verbose_name = 'Premium Feature'
        verbose_name_plural = 'Premium Features'
    
    def __str__(self):
        return self.title

# ... (Keep UserReport and AdminAction classes as they were in your code) ...
class UserReport(models.Model):
    REPORT_REASONS = [
        ('spam', 'Spam'),
        ('harassment', 'Harassment'),
        ('inappropriate', 'Inappropriate Content'),
        ('fake', 'Fake Profile'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('reviewed', 'Reviewed'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
    ]
    
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports_made')
    reported_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports_received')
    reason = models.CharField(max_length=50, choices=REPORT_REASONS)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reports_reviewed')
    admin_notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"Report against {self.reported_user.username} by {self.reporter.username}"
    
    class Meta:
        db_table = 'user_reports'
        ordering = ['-created_at']


class AdminAction(models.Model):
    ACTION_TYPES = [
        ('suspend', 'Suspend'),
        ('ban', 'Ban'),
        ('activate', 'Activate'),
        ('delete', 'Delete'),
        ('verify', 'Verify'),
        ('warn', 'Warn'),
    ]
    
    admin = models.ForeignKey(User, on_delete=models.CASCADE, related_name='admin_actions')
    target_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='actions_received')
    action_type = models.CharField(max_length=20, choices=ACTION_TYPES)
    reason = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.action_type} on {self.target_user.username} by {self.admin.username}"
    
    class Meta:
        db_table = 'admin_actions'
        ordering = ['-created_at']