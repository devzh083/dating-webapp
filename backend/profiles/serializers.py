# ============================================
# profiles/serializers.py
# ============================================
from rest_framework import serializers
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    # Read-only field to return username
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'username',
            'email',
            'first_name',
            'date_of_birth',
            'gender',
            'show_gender',
            'interested_in',
            'orientation',
            'show_orientation',
            'relationship_type',
            'distance',
            'strict_distance',
            'drinking',
            'smoking',
            'workout',
            'pets',
            'communication_style',
            'response_pace',
            'interests',
            'location',
            'use_current_location',
            'photos',
            'bio',
            'conversation_starter',
            'social_accounts',
            'is_complete',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at', 'is_complete']
    
    def validate_photos(self, value):
        """Ensure max 4 photos"""
        if len(value) > 4:
            raise serializers.ValidationError("Maximum 4 photos allowed")
        return value
    
    def validate_interests(self, value):
        """Ensure max 10 interests"""
        if len(value) > 10:
            raise serializers.ValidationError("Maximum 10 interests allowed")
        return value
    
    def validate_social_accounts(self, value):
        """Validate social accounts structure"""
        if value is None:
            return {}
        
        if not isinstance(value, dict):
            raise serializers.ValidationError("Social accounts must be a dictionary")
        
        # Define allowed keys
        allowed_keys = ['instagram', 'whatsapp', 'snapchat', 'twitter', 'linkedin']
        
        # Check for invalid keys
        invalid_keys = set(value.keys()) - set(allowed_keys)
        if invalid_keys:
            raise serializers.ValidationError(f"Invalid social account types: {invalid_keys}")
        
        # Validate each value is a string
        for key, val in value.items():
            if not isinstance(val, str):
                raise serializers.ValidationError(f"{key} must be a string")
        
        return value
    
    def to_representation(self, instance):
        """Ensure social_accounts is always a dict in response"""
        representation = super().to_representation(instance)
        if representation.get('social_accounts') is None:
            representation['social_accounts'] = {}
        return representation