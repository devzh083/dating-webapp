# ws.py

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

channel_layer = get_channel_layer()

def notify_user(email: str, payload: dict):
    group = f"user_{email.lower()}"
    async_to_sync(channel_layer.group_send)(
        group,
        {
            "type": "presence_event",
            "payload": payload,
        }
    )
