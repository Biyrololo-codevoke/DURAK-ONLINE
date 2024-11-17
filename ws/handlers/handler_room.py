import tornado.ioloop
import tornado.web
import tornado.websocket
import tornado.httpserver

from websocket_logger import logger
from .User import User
from .dataset import users, follow, unfollow, join_to_room


class WebSocketHandler(tornado.websocket.WebSocketHandler):
    path = r"/room/([0-9]+)"

    def open(self):
        user = User(self)
        users.append(user)
        self.user = user
        self.write_message({
            "status": "success",
            "message": "successfully connected. now please authorize yourself by access_token"
        })
        
    def on_message(self, message: dict):
        event = message.get("event")
        handle_room_event(event, message, self.user)

    def on_close(self):
        logger.info("WebSocket closed")
        self.user.connection = None
        unfollow(self)

    def check_origin(self, origin):
        logger.info("origin: " + origin)
        return True


def handle_room_event(event: str, message: dict, user: User):
    match event:
        case "place_card":
            ...

        case "pass":
            ...

        case "bito":
            ...

        case "take":
            ...
        
        case "throw_card":
            ...

        case "throw_card":
            ...
        
        case "transfer_card":
            ...

        case _:
            user.send({
                "status": "error",
                "message": "Unknown event"
            })