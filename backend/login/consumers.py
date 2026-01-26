import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.core.cache import cache

from login.mysql_managers import MySQLChatManager, MySQLMatchManager


# -------------------------------
# Helpers
# -------------------------------

ONLINE_USERS_KEY = "online_users"


def email_to_group(email: str) -> str:
    return "user_" + email.replace("@", "_at_")


@database_sync_to_async
def get_chat(chat_id: int):
    return MySQLChatManager.get_chat(chat_id)


def get_online_users() -> set:
    return cache.get(ONLINE_USERS_KEY, set())


def add_online_user(email: str):
    users = get_online_users()
    users.add(email)
    cache.set(ONLINE_USERS_KEY, users)


def remove_online_user(email: str):
    users = get_online_users()
    users.discard(email)
    cache.set(ONLINE_USERS_KEY, users)


# ===============================
# NOTIFICATION CONSUMER (Presence)
# ===============================

class NotificationConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        user = self.scope.get("user")

        if not user or user.is_anonymous:
            await self.close(code=4401)
            return

        self.user_email = user.email.lower()
        self.group_name = email_to_group(self.user_email)

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

        # 1️⃣ Register user as online
        add_online_user(self.user_email)

        # 2️⃣ Send existing online presence to THIS user
        await self.send_existing_presence()

        # 3️⃣ Broadcast THIS user's presence
        await self.broadcast_presence(is_online=True)

    async def disconnect(self, close_code):
        if hasattr(self, "user_email"):
            remove_online_user(self.user_email)
            await self.broadcast_presence(is_online=False)

        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    # -------------------------------
    # Presence logic
    # -------------------------------

    async def broadcast_presence(self, is_online: bool):
        matched_emails = await database_sync_to_async(
            MySQLMatchManager.get_user_matches
        )(self.user_email)

        for email in matched_emails:
            await self.channel_layer.group_send(
                email_to_group(email),
                {
                    "type": "presence_event",
                    "payload": {
                        "type": "presence",
                        "user_email": self.user_email,
                        "is_online": is_online,
                    }
                }
            )

    async def send_existing_presence(self):
        online_users = get_online_users()

        matched_emails = await database_sync_to_async(
            MySQLMatchManager.get_user_matches
        )(self.user_email)

        for email in matched_emails:
            if email in online_users:
                await self.send(text_data=json.dumps({
                    "type": "presence",
                    "user_email": email,
                    "is_online": True,
                }))

    async def presence_event(self, event):
        await self.send(text_data=json.dumps(event["payload"]))


# ===============================
# CHAT CONSUMER (Messages + Typing)
# ===============================

class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        user = self.scope.get("user")

        if not user or user.is_anonymous:
            await self.close(code=4401)
            return

        chat_id = self.scope["url_route"]["kwargs"].get("chat_id")
        if not chat_id:
            await self.close(code=4400)
            return

        self.user = user
        self.chat_id = int(chat_id)
        self.room_group_name = f"chat_{self.chat_id}"

        chat = await get_chat(self.chat_id)
        if not chat:
            await self.close(code=4404)
            return

        participants = chat.get("participants", [])
        if user.email.lower() not in participants:
            await self.close(code=4403)
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def receive(self, text_data):
        data = json.loads(text_data)
        event_type = data.get("type")

        if event_type == "typing":
            await self.handle_typing(data)

        elif event_type == "message":
            await self.handle_message(data)

    # -------------------------------
    # Typing
    # -------------------------------

    async def handle_typing(self, data):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "typing_event",
                "payload": {
                    "type": "typing",
                    "user_email": self.user.email.lower(),
                    "is_typing": data.get("is_typing", False),
                }
            }
        )

    async def typing_event(self, event):
        if event["payload"]["user_email"] != self.user.email.lower():
            await self.send(text_data=json.dumps(event["payload"]))

    # -------------------------------
    # Disconnect
    # -------------------------------

    async def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
