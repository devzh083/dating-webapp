from config.firebase import db
from firebase_admin import firestore
from typing import Dict, Any, Optional, List

class FirebaseAuthManager:
    """Firestore `users` collection: one doc per email, auth state only."""

    @staticmethod
    def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
        users_ref = db.collection("users")
        query = users_ref.where("email", "==", email).limit(1)
        docs = list(query.stream())
        return docs[0].to_dict() if docs else None

    @staticmethod
    def create_or_update_user(email: str, auth_provider: str, **extra) -> str:
        """
        Ensure a single document per email.
        If email exists -> update same doc.
        Else -> create a new doc.
        """
        users_ref = db.collection("users")
        query = users_ref.where("email", "==", email).limit(1)
        docs = list(query.stream())

        if docs:
            # reuse existing doc
            doc_snapshot = docs[0]
            doc_ref = users_ref.document(doc_snapshot.id)
            doc_ref.update({
                "auth_provider": auth_provider,
                **extra
            })
            return doc_snapshot.id
        else:
            # create new doc
            doc_ref = users_ref.document()
            doc_ref.set({
                "email": email,
                "auth_provider": auth_provider,
                "created_at": firestore.SERVER_TIMESTAMP,
                **extra
            })
            return doc_ref.id


class FirebaseProfileManager:
    """Firestore `Profile` collection: personal details only, keyed by email."""

    @staticmethod
    def create_profile(email: str, **profile_data) -> str:
        """
        Store arbitrary key-value pairs for profile.
        Document ID = email (1 profile per email).
        """
        profile_ref = db.collection("Profile").document(email)
        profile_ref.set({
            "email": email,
            "updated_at": firestore.SERVER_TIMESTAMP,
            **profile_data
        }, merge=True)
        return profile_ref.id

    @staticmethod
    def get_profile(email: str) -> Optional[Dict[str, Any]]:
        doc = db.collection("Profile").document(email).get()
        return doc.to_dict() if doc.exists else None


class FirebaseUserManager:
    """Main manager - orchestrates auth + profile operations"""
    
    @staticmethod
    def create_complete_user(username: str, auth_provider: str = 'email', **extra_data) -> Dict[str, str]:
        """Create user + profile in one call"""
        # 1. Create auth record
        firebase_user_id = FirebaseAuthManager.create_user(
            username=username, 
            auth_provider=auth_provider, 
            **extra_data
        )
        
        # 2. Create profile (use Django user ID as profile document ID)
        # Note: You'll pass django_user_id from views
        return {
            "firebase_user_id": firebase_user_id,
            "auth_provider": auth_provider
        }

    @staticmethod
    def get_user_full_data(django_user_id: str, username: str = None) -> Dict[str, Any]:
        """Get complete user data: auth + profile"""
        auth_data = FirebaseAuthManager.get_user_by_username(username) if username else None
        profile_data = FirebaseProfileManager.get_profile(django_user_id)
        
        return {
            "firebase_user": auth_data or {},
            "profile": profile_data or {}
        }


# Backward compatibility - keep original class
class LegacyFirebaseUserManager(FirebaseUserManager):
    """Alias for backward compatibility"""
    pass
