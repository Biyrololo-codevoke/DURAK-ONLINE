import os
import json
from typing import Union

import jwt


JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")


def handle_jwt_token(token: str) -> Union[bool, str | int]:
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
        
        
def auth_socket(message: dict) -> tuple[bool, dict]:
    if "access_token" not in message.keys():
        return False, {"status": "error", "message": "access token wasn't found in request"}

    else:
        status, data = handle_jwt_token(message["access_token"])
        if not status:
            return False, {"status": "error", "message": data}
        else:
            return True, {"status": "success", "message": "Successfully authorized", "user_id": data}
            

def serialize(dict_json: dict) -> str:  # serializes dict to json string
    return json.dumps(dict_json)


def deserialize(str_json: str) -> dict:  # deserializes string json to dict
    return json.loads(str_json)