from .utils import handle_jwt_token


def auth_socket(message: dict) -> tuple[bool, dict]:
    if "access_token" not in message.keys():
        return False, {"status": "error", "message": "access token wasn't found in request"}

    else:
        status, data = handle_jwt_token(message["access_token"])
        if not status:
            return False, {"status": "error", "message": data}
        else:
            return True, {"status": "success", "message": "Successfully authorized", "user_id": data}
