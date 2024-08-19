import os
import json
from typing import Any, Tuple
from websockets import ConnectionClosed

import jwt
from websocket_logger import logger


JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")


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


def serialize(dict_json: dict) -> str:  # serializes dict to json string
    return json.dumps(dict_json)


def deserialize(str_json: str) -> dict:  # deserializes string json to dict
    return json.loads(str_json)


def handle_socket_closing(func: Any) -> Any:
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except ConnectionClosed as e:
            logger.info(f"Connection closed: code={e.code}, reason='{e.reason}'")
            match e.code:
                case 1000:
                    logger.info("Connection closed normally")
                case 1001:
                    logger.info("пиздюк свалил куда-то")
                case 1002:
                    logger.info("пиздюк нарушил протокол")
                case 1003:
                    logger.info("пиздюк не по русски базарит")
                case 1004:
                    logger.info("зарезервировано нахуй")
                case 1005:
                    logger.info("пиздюк свалил без подтверждения")
                case 1006:
                    logger.info("у пиздюка проблемы с инетом")
                case 1007:
                    logger.info("пиздюк напиздел")
                case 1008:
                    logger.info("пиздюк оказался хохлом")
                case 1009:
                    logger.info("пиздюк слишком много и долго болтает")
                case 1010:
                    logger.info("пиздюк ждал ксиву")
                case 1011:
                    logger.info("ПИЗДЕЦ НА КОРАБЛЕ")
                case 1015:
                    logger.info("пиздюк не защищается")
                case _:
                    logger.info(f"Connection closed with unknown code: {e.code}")
    return wrapper