import os
import json
from typing import Any, Tuple

import jwt
from websockets import WebSocketServerProtocol as WebSocket

from data import room_list, socket_identity
from kafka_producer import send_kafka_event
from websocket_logger import logger


JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")


def serialize(payload: dict):
    return json.dumps(payload)


def handle_jwt_token(token: str) -> tuple[bool, Any] | tuple[bool, str]:
    global JWT_SECRET_KEY
    try:
        # Decode the JWT token
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
        return True, payload["sub"]["id"]
    except jwt.ExpiredSignatureError:
        # Token has expired
        return False, "Token has expired"
    except jwt.InvalidTokenError:
        # Invalid token
        return False, "Invalid token"


def handle_path(path: str) -> Tuple[str, dict]:
    endpoint = path.replace('/ws', '', 1).split('?')[0]  # replace /ws prefix and params of request
    data = {}

    if "?" in path:
        data = {
            key: value
            for (key, value) in [
                pair.split('=')
                for pair in path.split("?")[-1].split("&")
            ]
        }
    return endpoint, data


# socket handlers


async def send_to_socket(socket: WebSocket, payload: dict):
    await socket.send(serialize(payload))


async def send_to_room(room_id: int, payload: dict):
    room_sockets = room_list.get(room_id)
    if room_sockets:
        for socket in room_sockets:
            await send_to_socket(socket, payload)


def handle_room(payload: dict, socket: WebSocket):
    socket_id = id(socket)
    room_id = payload["room_id"]
    user_id = socket_identity[socket_id]

    current_rooms = room_list.get_rooms()

    if room_id not in current_rooms:
        send_to_socket(socket, {"status": "error", "message": "room doesn't exist"})

    else:
        event = payload["event"]

        match event:
            case "join_room":
                event_for_room = {
                    "event": "player_joined",
                    "user_id": user_id
                }
                send_to_room(room_id, event_for_room)
                response = {
                    "status": "success",
                    "message": "you successfully joined to room %d" % room_id
                }


async def handle_list(socket: WebSocket):
    current_room_list = room_list.get_rooms()
    await send_to_socket(socket, current_room_list)
    # subscribe for future updates
    room_list.subscribe(socket)

logger.info("init handlers.py")
