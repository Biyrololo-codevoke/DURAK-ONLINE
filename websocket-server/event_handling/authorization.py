from websocket_logger import logger

from .utils import handle_jwt_token
from .data import room_keys


def auth_socket_via_token(message: dict) -> tuple[bool, dict]:
    access_token = message.get("access_token")

    if not access_token:
        return False, {"status": "error", "message": "access token wasn't found in request"}

    status, data = handle_jwt_token(access_token)
    if not status:
        return False, {"status": "error", "message": data}

    return True, {"status": "success", "message": "Successfully authorized", "user_id": data}


def auth_socket_via_key(message: dict) -> tuple[bool, dict]:
    room_id: int = int(message.get("room_id"))
    key: str = message.get("key")

    if not all([room_id, key]):
        return False, {"status": "error", "message": "missed one of required args (room_id or key)"}

    if not room_keys.get(room_id):
        logger.info(room_keys)
        return False, {"status": "error", "message": "invalid room id"}

    if key not in room_keys[room_id]:
        return False, {"status": "error", "message": "invalid key"}

    user_id = int(key.split("_")[-1])

    return True, {
        "status": "success", "message": "Successfully authorized",
        "user_id": user_id,
        "key": key,
        "room_id": room_id
    }
