from config.firebase import db
from firebase_admin import firestore
from typing import Dict, Any, Optional

class FirebaseUserManager:
    @staticmethod
    def create_user(username: str, **extra_data) -> str:
        """Create user in Firebase - NO PASSWORD NEEDED"""
        user_ref = db.collection('users').document()
        user_ref.set({
            "username": username,
            "created_at": firestore.SERVER_TIMESTAMP,
            **extra_data
        })
        return user_ref.id

    @staticmethod
    def get_user_by_username(username: str) -> Optional[Dict[str, Any]]:
        """Find user by username"""
        users_ref = db.collection('users')
        query = users_ref.where('username', '==', username).limit(1)
        docs = query.stream()
        for doc in docs:
            return doc.to_dict()
        return None

    @staticmethod
    def get_user(user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by Firebase document ID"""
        doc = db.collection('users').document(user_id).get()
        return doc.to_dict() if doc.exists else None
