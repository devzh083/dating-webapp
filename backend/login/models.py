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
        Always handles is_verified field.
        """
        users_ref = db.collection("users")
        query = users_ref.where("email", "==", email).limit(1)
        docs = list(query.stream())

        # Always ensure is_verified is handled
        user_data: Dict[str, Any] = {
            "auth_provider": auth_provider,
            **extra,
        }

        # Default to False if not provided
        if "is_verified" not in user_data:
            user_data["is_verified"] = False

        if docs:
            # reuse existing doc
            doc_snapshot = docs[0]
            doc_ref = users_ref.document(doc_snapshot.id)
            doc_ref.update(user_data)
            return doc_snapshot.id
        else:
            # create new doc
            doc_ref = users_ref.document()
            doc_ref.set(
                {
                    "email": email,
                    "created_at": firestore.SERVER_TIMESTAMP,
                    **user_data,
                }
            )
            return doc_ref.id

class FirebaseProfileManager:
    """
    Firestore `Profile` collection: personal details only, keyed by email.
    Supports multi-step onboarding with completion tracking.
    """

    TOTAL_ONBOARDING_STEPS = 10  # Configurable total steps

    @staticmethod
    def create_profile(email: str, **profile_data) -> str:
        """
        Store arbitrary key-value pairs for profile (merge=True supports partial updates).
        Automatically handles step tracking and completion % for multi-step onboarding.
        """
        # Handle step and compute completion percentage
        step = profile_data.get("onboarding_step")
        if step is not None:
            try:
                step = int(step)
                step = max(0, min(FirebaseProfileManager.TOTAL_ONBOARDING_STEPS, step))
                completion_pct = round((step / FirebaseProfileManager.TOTAL_ONBOARDING_STEPS) * 100, 1)
                
                # Store both step and computed percentage
                profile_data["onboarding_step"] = step
                profile_data["completion_percentage"] = completion_pct
            except (TypeError, ValueError):
                # Invalid step: clear step tracking
                profile_data.pop("onboarding_step", None)
                profile_data.pop("completion_percentage", None)

        # Optional normalization: ensure photos is stored as a list of strings
        photos = profile_data.get("photos")
        if photos is not None:
            if isinstance(photos, str):
                profile_data["photos"] = [photos]
            elif isinstance(photos, list):
                profile_data["photos"] = [str(p) for p in photos]

        profile_ref = db.collection("Profile").document(email)
        profile_ref.set(
            {
                "email": email,
                "updated_at": firestore.SERVER_TIMESTAMP,
                **profile_data,
            },
            merge=True,  # Supports multi-step partial updates
        )
        return profile_ref.id

    @staticmethod
    def get_profile(email: str) -> Optional[Dict[str, Any]]:
        doc = db.collection("Profile").document(email).get()
        if not doc.exists:
            return None

        data = doc.to_dict() or {}

        # Ensure photos is always a list if present
        photos = data.get("photos")
        if photos is not None and not isinstance(photos, list):
            data["photos"] = [photos]

        return data

    @staticmethod
    def get_completion_status(email: str) -> Dict[str, Any]:
        """
        Get just the onboarding completion status.
        Returns: {"step": 3, "completion_percentage": 30.0, "is_complete": False}
        """
        profile = FirebaseProfileManager.get_profile(email)
        if not profile:
            return {"step": 0, "completion_percentage": 0.0, "is_complete": False}
        
        step = profile.get("onboarding_step", 0)
        pct = profile.get("completion_percentage", 0.0)
        is_complete = step >= FirebaseProfileManager.TOTAL_ONBOARDING_STEPS
        
        return {
            "step": step,
            "completion_percentage": pct,
            "is_complete": is_complete,
            "total_steps": FirebaseProfileManager.TOTAL_ONBOARDING_STEPS,
        }

class FirebaseUserManager:
    """Main manager - orchestrates auth + profile operations"""

    @staticmethod
    def create_complete_user(
        username: str, auth_provider: str = "email", **extra_data
    ) -> Dict[str, str]:
        """Create user + profile in one call"""
        firebase_user_id = FirebaseAuthManager.create_or_update_user(
            email=username, auth_provider=auth_provider, **extra_data
        )

        return {
            "firebase_user_id": firebase_user_id,
            "auth_provider": auth_provider,
        }

    @staticmethod
    def get_user_full_data(email: str) -> Dict[str, Any]:
        """Get complete user data: auth + profile + completion status"""
        auth_data = FirebaseAuthManager.get_user_by_email(email)
        profile_data = FirebaseProfileManager.get_profile(email)
        completion = FirebaseProfileManager.get_completion_status(email)

        return {
            "firebase_user": auth_data or {},
            "profile": profile_data or {},
            "onboarding": completion,  # New: step + completion info
        }

# Backward compatibility - keep original class
class LegacyFirebaseUserManager(FirebaseUserManager):
    """Alias for backward compatibility"""
    pass
