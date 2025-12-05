from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import FirebaseUserManager

class UserAPIView(APIView):
    def post(self, request):
        user_id = FirebaseUserManager.create_user(request.data['email'], request.data)
        return Response({"user_id": user_id}, status=status.HTTP_201_CREATED)
    
    def get(self, request, user_id):
        user = FirebaseUserManager.get_user(user_id)
        if user:
            return Response(user)
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
