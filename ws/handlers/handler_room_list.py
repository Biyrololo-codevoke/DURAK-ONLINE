import tornado.ioloop
import tornado.web
import tornado.websocket
import tornado.httpserver

from websocket_logger import logger
from .User import User
from .dataset import users, follow, unfollow, join_to_room


class WebSocketHandler(tornado.websocket.WebSocketHandler):
    path = r"/rooms"

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
        handle_list_event(event, message, self)

    def on_close(self):
        logger.info("WebSocket closed")
        self.user.connection = None
        unfollow(self)

    def check_origin(self, origin):
        logger.info("origin: " + origin)
        return True


def handle_list_event(event: str, message: dict, user: User):
    if event != "auth" and not user.auth:
        user.send({
            "status": "error",
            "message": "unauthorized"
        })

    match event:
        case "auth":
            access_token = message.get("access_token")
            if not access_token:
                user.send({
                    "status": "error",
                    "message": "has no token"
                })
            else:
                status, text = user.authorize(access_token)
                user.send({
                    "status": "success" if status else "error",
                    "message": text
                })
                follow(user)
                
        case "join_room":
            room_id = message.get("room_id")
            if not room_id:
                user.send({
                    "status": "error",
                    "message": "has no room_id"
                })
            password = message.get("password")
            player_id = user.id
            
            status, data = join_to_room(room_id, password, player_id)
            if status:
                user.send({
                    "status": "success",
                    "message": "successfully joined room",
                    "key": data
                })
            else:
                user.send({
                    "status": "error",
                    "message": data
                })

        case _:
            user.send({
                "status": "error",
                "message": f"unknown event {event=}"
            })