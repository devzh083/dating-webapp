from rest_framework import serializers
from django.contrib.auth.models import User
from profiles.models import UserProfile
from .models import UserReport, AdminAction
from .models import PremiumPlan, PremiumFeature


class PremiumPlanSerializer(serializers.ModelSerializer):
    """Serializer for Premium Plans"""
    
    class Meta:
        model = PremiumPlan
        fields = [
            'plan_id', 'name', 'duration', 'plan_type', 'price', 
            'original_price', 'price_per_month', 'discount_text',
            'icon', 'color', 'gradient', 'popular', 'features',
            'active', 'display_order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def validate_price(self, value):
        """Ensure price is positive"""
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0")
        return value
    
    def validate(self, data):
        """Validate that original_price is greater than price if provided"""
        if data.get('original_price') and data.get('price'):
            if data['original_price'] <= data['price']:
                raise serializers.ValidationError(
                    "Original price must be greater than current price"
                )
        return data


class PremiumFeatureSerializer(serializers.ModelSerializer):
    """Serializer for Premium Features"""
    
    class Meta:
        model = PremiumFeature
        fields = [
            'id', 'title', 'description', 'icon', 
            'active', 'display_order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined', 'is_active']
        read_only_fields = ['id', 'date_joined']


class UserProfileSerializer(serializers.ModelSerializer):
    """Admin-focused serializer for UserProfile with nested User data"""
    user = UserSerializer(read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'user', 'username', 'email', 'phone', 'gender', 'age', 
            'location', 'status', 'account_status', 'join_date', 'last_active',
            'active_time', 'matches', 'messages', 'photo_count', 'reports',
            'profile_complete', 'verified', 'premium', 'first_name',
            'date_of_birth', 'bio', 'interests'
        ]
        read_only_fields = ['join_date', 'last_active', 'age', 'photo_count', 'profile_complete']


class UserReportSerializer(serializers.ModelSerializer):
    """Serializer for UserReport with reporter and reported user details"""
    reporter_username = serializers.CharField(source='reporter.username', read_only=True)
    reported_username = serializers.CharField(source='reported_user.username', read_only=True)
    reviewed_by_username = serializers.CharField(source='reviewed_by.username', read_only=True, allow_null=True)
    
    class Meta:
        model = UserReport
        fields = [
            'id', 'reporter', 'reporter_username', 'reported_user', 
            'reported_username', 'reason', 'description', 'status',
            'created_at', 'reviewed_at', 'reviewed_by', 'reviewed_by_username',
            'admin_notes'
        ]
        read_only_fields = ['id', 'created_at', 'reviewed_at', 'reviewed_by']


class AdminActionSerializer(serializers.ModelSerializer):
    """Serializer for AdminAction with admin and target user details"""
    admin_username = serializers.CharField(source='admin.username', read_only=True)
    target_username = serializers.CharField(source='target_user.username', read_only=True)
    
    class Meta:
        model = AdminAction
        fields = [
            'id', 'admin', 'admin_username', 'target_user', 'target_username',
            'action_type', 'reason', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class UserActionSerializer(serializers.Serializer):
    """Serializer for validating user action requests"""
    ACTION_CHOICES = [
        ('suspend', 'Suspend'),
        ('ban', 'Ban'),
        ('activate', 'Activate'),
        ('delete', 'Delete'),
        ('verify', 'Verify'),
    ]
    
    action = serializers.ChoiceField(choices=ACTION_CHOICES, required=True)
    reason = serializers.CharField(required=False, allow_blank=True, max_length=500)
    
    def validate_action(self, value):
        """Validate that the action is allowed"""
        if value not in dict(self.ACTION_CHOICES):
            raise serializers.ValidationError(f"Invalid action: {value}")
        return value