import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from login.mysql_managers import MySQLChatManager, MySQLMatchManager


def user_group_name(email: str) -> str:
    return f"user_{email.lower()}"


@database_sync_to_async
def get_chat(chat_id: int):
    return MySQLChatManager.get_chat(chat_id)

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope.get("user")

        if not user or user.is_anonymous:
            await self.close(code=4401)
            return

        self.user = user
        self.group_name = user_group_name(self.user.email)


        # ✅ ACCEPT FIRST
        await self.accept()

        # ✅ THEN add to group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        # 🔴 USER IS ONLINE
        await self.broadcast_presence(is_online=True)

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

        if hasattr(self, "user"):
            await self.broadcast_presence(is_online=False)

    async def broadcast_presence(self, is_online: bool):
        """
        Notify all matched users that this user is online/offline
        """
        matches = await database_sync_to_async(
            MySQLMatchManager.get_user_matches
        )(self.user.email)

        for matched_email in matches:
            await self.channel_layer.group_send(
                user_group_name(matched_email),
                {
                    "type": "presence_event",
                    "payload": {
                        "type": "presence",
                        "user_email": self.user.email.lower(),
                        "is_online": is_online,
                    }
                }
            )


    async def presence_event(self, event):
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
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        event_type = data.get("type")

        if event_type == "typing":
            await self.handle_typing(data)

        elif event_type == "message":
            await self.handle_message(data)

    async def handle_typing(self, data):
        """
        Broadcast typing event to other participants
        """
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "typing_event",
                "payload": {
                    "type": "typing",
                    "user_id": self.user.id,
                    "is_typing": data.get("is_typing", False),
                }
            }
        )

    async def typing_event(self, event):
        # Don't send typing event back to sender
        if event["payload"]["user_id"] != self.user.id:
            await self.send(text_data=json.dumps(event["payload"]))


    async def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event["message"]))
