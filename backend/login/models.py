from config.firebase import db
from firebase_admin import firestore
from typing import List, Dict, Any

class FirebaseUserManager:
    @staticmethod
    def create_user(email: str, data: Dict[str, Any]) -> str:
        user_ref = db.collection('users').document()
        user_ref.set({"email": email, **data, "id": user_ref.id})
        return user_ref.id
    
    @staticmethod
    def get_user(user_id: str) -> Dict[str, Any]:
        doc = db.collection('users').document(user_id).get()
        return doc.to_dict() if doc.exists else None
