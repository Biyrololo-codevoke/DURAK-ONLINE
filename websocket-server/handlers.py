import os
import json
from typing import Union

import jwt

from data import room_list, authed_sockets, socket_user_id
from kafka_producer import send_event


JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")


def handle_jwt_token(token: str) -> Union[bool, int]:
    global JWT_SECRET_KEY
    try:
        # Decode the JWT token
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
        return True, payload["id"]
    except jwt.ExpiredSignatureError:
        # Token has expired
        return False, "Token has expired"
    except jwt.InvalidTokenError:
        # Invalid token
        return False, "Invalid token"


def handle_room(payload, socket):
    room_id = payload["room_id"]

    current_rooms = room_list.get_rooms()

    if room_id not in current_rooms:
        socket.send({
            "status": "error",
            "message": "room doesn't exist"
        })

    else:
        socket_id = id(socket)
        user_id = socket_user_id.get(socket_id)
        
        event = {
            "event": "join_room",
            "data": {
                "user_id": user_id,
                "room_id": room_id
            }
        }

        send_event(user_id, event)


def handle_list(socket):
    list_changes_callback = lambda payload: socket.send(
        serialize_payload(payload)
    )
    current_room_list = room_list.get_rooms()
    socket.send({
        current_room_list
    })
    room_list.subscribe(list_changes_callback)


def send_event(user_id: int, payload: dict):
    socket = authed_sockets.get(user_id)
    if socket:
        socket.send(
            serialize_payload(payload))

def send_to_room(room_id, payload: dict):
    room_sockets = room_list.get(room_id)
    if room_sockets:
        for socket in room_sockets:
            socket.send(
                serialize_payload(payload))

def serialize_payload(payload: dict):
    return json.dumps(payload)
