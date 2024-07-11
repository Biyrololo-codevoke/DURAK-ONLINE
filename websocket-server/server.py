import json
import websockets
import threading as th

from handlers import handle_list, handle_room, handle_jwt_token
from data import auth_sockets_id, authed_sockets
from websocket_logger import logger


async def handle (websocket, path):
    logger.info(path + "->" + str(websocket))
    async for message in websocket:
        await router(path, message, websocket)
        
        
logger.info("handle made")


async def router (path, payload, websocket):
    w_id = id(websocket)

    if w_id not in auth_sockets_id:
        thread = th.Thread(
            target=auth_socket, 
            args=(payload, websocket)
        )
        thread.start()

    if path == "/ws/room/list":
        thread = th.Thread(
            target=handle_list, 
            args=websocket
        )
        thread.start()

    elif path.startswith("/ws/room/"):
        try:
            room_id = int(path.replace("/ws/room/", ""))
            payload["room_id"] = room_id
            thread = th.Thread(
                target=handle_room,
                args=(payload, websocket)
            )
            thread.start()

        except ValueError:
            websocket.send(json.dumps({
                "status": "error",
                "message": "room_id must be int"
            }))

logger.info("router made")


def auth_socket(message, socket):
    if "access_token" not in message.keys():
        socket.send({
            "status": "error",
            "message": "access token wasn't found in request"
        })
    else:
        status, data = handle_jwt_token(message["access_token"])
        if not status:
            socket.send({
                "status": "error",
                "message": data
            })
        else:
            authed_sockets[data] = socket
            auth_sockets_id.append(id(socket))


logger.info("auth_socket made")


logger.info("Server listen: localhost:9000")
logger.info("running")

start_server = websockets.serve(handle, "0.0.0.0", 9000)
