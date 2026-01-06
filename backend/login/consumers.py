import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import FirebaseChatManager


def user_group_name(user_id: int) -> str:
    return f"user_{user_id}"


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope.get("user")

        if not user or user.is_anonymous:
            await self.close(code=4001)
            return

        self.group_name = user_group_name(user.id)

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    async def match_event(self, event):
        await self.send(text_data=json.dumps(event["payload"]))


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope.get("user")

        if not user or user.is_anonymous:
            await self.close(code=4001)
            return

        self.user = user
        self.chat_id = self.scope["url_route"]["kwargs"]["chat_id"]
        self.room_group_name = f"chat_{self.chat_id}"

        # 🔐 Authorization check
        chat = FirebaseChatManager.get_chat(self.chat_id)
        if not chat:
            await self.close(code=4004)
            return

        participants = chat.get("participants", [])
        if user.username.lower() not in participants:
            await self.close(code=4003)
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # ❌ DO NOT persist messages here
    # ❌ DO NOT accept chat input over WebSocket
    # REST API is authoritative

    async def chat_message(self, event):
        """
        Receives broadcasts from REST API and forwards to client
        """
        await self.send(text_data=json.dumps(event["message"]))
