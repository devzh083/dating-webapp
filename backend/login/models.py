from datetime import datetime

from django.conf import settings 
from admin_panel.models import PremiumPlan
from profiles.management.commands.create_sample_users import User
from config.firebase import db
from firebase_admin import firestore
from django.db import models
from typing import Dict, Any, Optional, List
from google.cloud import firestore

def clean_firestore_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Bulletproof Firestore data cleaner - NO import issues"""
    if not isinstance(data, dict):
        return data
    
    cleaned = {}
    for k, v in data.items():
        if hasattr(v, 'isoformat'):  # Timestamp
            cleaned[k] = v.isoformat()
        elif str(type(v)).find('Sentinel') != -1 or str(type(v)).find('SERVER_TIMESTAMP') != -1:
            cleaned[k] = None  # Safe fallback
        elif isinstance(v, (list, dict)):
            cleaned[k] = clean_firestore_data(v)
        else:
            cleaned[k] = v
    return cleaned
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


# class FirebaseLikeManager:
#     @staticmethod
#     def send_like(from_email: str, to_email: str) -> Dict[str, Any]:
#         likes_ref = db.collection("likes")

#         # 1. Prevent duplicate like
#         existing_like = list(
#             likes_ref
#             .where("from_email", "==", from_email.lower())
#             .where("to_email", "==", to_email.lower())
#             .limit(1)
#             .stream()
#         )
#         if existing_like:
#             return {"status": "already_liked"}

#         # 2. Check reverse like
#         reverse_like = list(
#             likes_ref
#             .where("from_email", "==", to_email.lower())
#             .where("to_email", "==", from_email.lower())
#             .limit(1)
#             .stream()
#         )

#         # 3. MATCH → create chat immediately
#         if reverse_like:
#             match = FirebaseMatchManager.create_match(from_email, to_email)
#             FirebaseLikeManager._cleanup_incoming_likes(from_email, to_email)
#             return {"status": "matched", "match": match}

#         # 4. Save like
#         likes_ref.add({
#             "from_email": from_email.lower(),
#             "to_email": to_email.lower(),
#             "created_at": firestore.SERVER_TIMESTAMP,
#         })
#         return {"status": "liked"}

#     @staticmethod
#     def _cleanup_incoming_likes(a: str, b: str):
#         """Remove stale incoming_like cards once match occurs"""
#         incoming_ref = db.collection("incoming_likes")
#         queries = [
#             incoming_ref.where("from_email", "==", a.lower()).where("to_email", "==", b.lower()),
#             incoming_ref.where("from_email", "==", b.lower()).where("to_email", "==", a.lower()),
#         ]
#         for q in queries:
#             for doc in q.stream():
#                 doc.reference.delete()

# class FirebaseMatchManager:
#     @staticmethod
#     def create_match(user_a: str, user_b: str) -> Dict[str, Any]:
#         users = sorted([user_a.lower(), user_b.lower()])

#         matches_ref = db.collection("matches")
#         existing = list(matches_ref.where("users", "==", users).limit(1).stream())
#         if existing:
#             return clean_firestore_data(existing[0].to_dict())

#         chat_id = FirebaseChatManager.create_chat(users)

#         # Store with SERVER_TIMESTAMP (Firestore handles it)
#         match_ref = matches_ref.document()
#         match_ref.set({
#             "users": users,
#             "chat_id": chat_id,
#             "status": "active",
#             "created_at": firestore.SERVER_TIMESTAMP,  # OK for storage
#         })

#         # Return CLEAN data WITHOUT Sentinel
#         response_data = {
#             "match_id": match_ref.id,
#             "users": users,
#             "chat_id": chat_id,
#             "status": "active",
#             "created_at": datetime.utcnow().isoformat() + "Z"  # Clean timestamp
#         }
#         return response_data  # No cleaning needed!

# class FirebaseChatManager:
#     @staticmethod
#     def create_chat(users: List[str]) -> str:
#         chat_ref = db.collection("chats").document()
#         chat_ref.set({
#             "participants": users,
#             "created_at": firestore.SERVER_TIMESTAMP,
#             "last_message": None,
#             "last_message_at": None,
#         })
#         return chat_ref.id

#     @staticmethod
#     def add_message(
#         chat_id: str,
#         sender: str,
#         receiver: str,
#         content: str,
#         message_type: str = "text",
#     ) -> None:
#         message = {
#             "chat_id": chat_id,
#             "sender": sender,
#             "receiver": receiver,
#             "content": content,
#             "type": message_type,
#             "created_at": firestore.SERVER_TIMESTAMP,
#             "read": False,
#         }

#         # Store message
#         db.collection("chats") \
#           .document(chat_id) \
#           .collection("messages") \
#           .add(message)

#         # Update chat metadata
#         db.collection("chats").document(chat_id).update({
#             "last_message": content,
#             "last_message_at": firestore.SERVER_TIMESTAMP,
#         })

#     @staticmethod
#     def get_chat_messages(
#         chat_id: str,
#         limit: int = 50,
#         before: Optional[datetime] = None,
#     ) -> List[Dict[str, Any]]:
#         query = (
#             db.collection("chats")
#             .document(chat_id)
#             .collection("messages")
#             .order_by("created_at", direction=firestore.Query.DESCENDING)
#             .limit(limit)
#         )

#         if before:
#             query = query.where("created_at", "<", before)

#         messages = query.stream()
#         return [
#             clean_firestore_data(msg.to_dict())
#             for msg in messages
#         ]
    
#     @staticmethod
#     def get_chat(chat_id: str) -> Optional[Dict[str, Any]]:
#         doc = db.collection("chats").document(chat_id).get()
#         return doc.to_dict() if doc.exists else None

class Like(models.Model):
    from_email = models.EmailField()
    to_email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("from_email", "to_email")

class Chat(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    last_message = models.TextField(null=True, blank=True)
    last_message_at = models.DateTimeField(null=True, blank=True)


class ChatParticipant(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
    email = models.EmailField()

    class Meta:
        unique_together = ("chat", "email")

class Message(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
    sender = models.EmailField()
    receiver = models.EmailField()
    content = models.TextField()
    type = models.CharField(max_length=20, default="text")
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)

class Match(models.Model):
    user_a = models.EmailField()
    user_b = models.EmailField()
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, default="active")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user_a", "user_b")

class BlockedUser(models.Model):
    blocker = models.EmailField(db_index=True)
    blocked = models.EmailField(db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("blocker", "blocked")


class Payment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    plan = models.ForeignKey(PremiumPlan, on_delete=models.PROTECT)
    razorpay_order_id = models.CharField(max_length=100)
    razorpay_payment_id = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    status = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

# models.py
class UserSubscription(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    plan_id = models.CharField(max_length=100)
    razorpay_order_id = models.CharField(max_length=100)
    razorpay_payment_id = models.CharField(max_length=100)
    razorpay_signature = models.CharField(max_length=255)

    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

class Notification(models.Model):
    user = models.EmailField()  # receiver
    type = models.CharField(max_length=50)
    match = models.ForeignKey(
        Match,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    chat_id = models.IntegerField(null=True, blank=True)

    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
