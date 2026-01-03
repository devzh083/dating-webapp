from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from profiles.models import UserProfile  # Import UserProfile from profiles app


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