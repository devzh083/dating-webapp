from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

channel_layer = get_channel_layer()

def notify_user(user_id: int, payload: dict):
    group = f"user_{user_id}"
    async_to_sync(channel_layer.group_send)(
        group,
        {
            "type": "match_event",
            "payload": payload,
        }
    )
