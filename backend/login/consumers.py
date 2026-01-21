import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from login.mysql_managers import MySQLChatManager, MySQLMatchManager


def user_group_name(user_id: int) -> str:
    return f"user_{user_id}"


@database_sync_to_async
def get_chat(chat_id: int):
    return MySQLChatManager.get_chat(chat_id)


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope.get("user")

        if not user or user.is_anonymous:
            await self.close(code=4401)
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

    async def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event["message"]))
