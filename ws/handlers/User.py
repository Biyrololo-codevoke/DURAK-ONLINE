import json

import tornado.websocket

from utils import handle_jwt_token


class User:
    auth: bool = False
    user_id: int = None
    connection: tornado.websocket.WebSocketHandler = None
    
    def __init__(self, connection: tornado.websocket.WebSocketHandler):
        self.connection = connection

    def authorize(self, access_token: str) -> tuple[bool, str]:
        status, data = handle_jwt_token(access_token)
        if not status:
            return False, data
        else:
            self.auth = True
            self.user_id = data
            return True, "OK"
        
    def send(self, message: dict):
        if self.connection:
            message_json = json.dumps(message)
            self.connection.write_message(message_json)
        else:
            raise Exception("User connection closed")

    def is_ws_active(self) -> bool:
        return self.connection.ws_connection is None or \
            self.connection.ws_connection.is_closing()
