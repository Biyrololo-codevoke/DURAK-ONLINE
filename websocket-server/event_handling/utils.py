import os
import json
from typing import Any, Tuple

from websockets import ConnectionClosed

from .game import Game

import jwt
from websocket_logger import logger


JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")


def handle_jwt_token(token: str) -> tuple[bool, Any] | tuple[bool, str]:
    global JWT_SECRET_KEY
    try:
        # Decode the JWT token
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
        return True, json.loads(payload["sub"])["id"]

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


def serialize(dict_json: dict) -> str:  # serializes dict to json string
    return json.dumps(dict_json)


def deserialize(str_json: str) -> dict:  # deserializes string json to dict
    return json.loads(str_json)


def model_to_room(model) -> dict:
    if model:
        serialized_room = model.game_obj
        if serialized_room:
            return Game.deserialize(serialized_room)
