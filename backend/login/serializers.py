from rest_framework import serializers
from .models import Match, Message
from admin_panel.models import UserReport
from django.contrib.auth.models import User

class MatchSerializer(serializers.ModelSerializer):
    partner = serializers.SerializerMethodField()

    class Meta:
        model = Match
        fields = ['id', 'partner', 'created_at']

    def get_partner(self, obj):
        request = self.context.get('request')
        if not request:
            return None
        
        # Find the other user in the match
        partner = obj.users.exclude(id=request.user.id).first()
        
        if partner and hasattr(partner, 'profile'):
            # Safe access to profile data
            photos = partner.profile.photos
            photo_url = None
            
            if photos and isinstance(photos, list) and len(photos) > 0:
                photo_url = photos[0]
            elif photos and isinstance(photos, str):
                photo_url = photos

            return {
                'id': partner.id,
                'name': partner.profile.first_name,
                'photo': photo_url,
                'bio': partner.profile.bio
            }
        return None

class MessageSerializer(serializers.ModelSerializer):
    is_me = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'content', 'timestamp', 'is_me', 'is_read']

    def get_is_me(self, obj):
        request = self.context.get('request')
        if request and request.user:
            return obj.sender == request.user
        return False
    
class CreateUserReportSerializer(serializers.ModelSerializer):
    reported_user_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = UserReport
        fields = ['reported_user_id', 'reason', 'description']

    def validate_reported_user_id(self, value):
        if not User.objects.filter(id=value).exists():
            raise serializers.ValidationError("Reported user does not exist")
        return value