from asyncio import create_task
import json
import websockets
from threading import Thread

from handlers import handle_list, handle_room, handle_jwt_token
from data import auth_sockets_id, authed_sockets, room_list
from websocket_logger import logger


def s(data: dict) -> str:  # serializes dict to json string
    return json.dumps(data)


def d(raw: str) -> dict:  # deserializes string json to dict
    return json.loads(raw)


async def handle(websocket, path):
    async for message in websocket:
        payload = d(message)
        logger.info(path + "->" + str(websocket.remote_address) + " :>> " + str(payload) +" "+ str(type(payload)))
        await handle_auth(path, payload, websocket)
        
        
logger.info("handle made")


async def handle_auth(path: str, payload: dict, socket):
    await auth_socket(payload, socket)
    await router(path, payload, socket)

async def router(path: str, payload: str, socket):
    if path == "/ws/room/list":
        await handle_list(socket)
        
    elif path.startswith("/ws/room/"):
        try:
            room_id = int(path.split('/')[-1])
            payload["room_id"] = room_id
            await handle_room(payload, socket)


        except ValueError:
            await socket.send(
                s({ "status": "error", "message": "room_id must be int" })
            )
logger.info("router made")


async def auth_socket(message: dict, socket):
    if "access_token" not in message.keys():
        await socket.send(
            s({ "status": "error", "message": "access token wasn't found in request" })
        )
    else:
        status, data = handle_jwt_token(message["access_token"])
        if not status:
            await socket.send(
                s({ "status": "error", "message": data })
            )
        else:
            authed_sockets[data] = socket
            auth_sockets_id.append(id(socket))
            await socket.send(s({ "status": "success" }))


logger.info("auth_socket made")


logger.info("Server listen: localhost:9000")
logger.info("running")

start_server = websockets.serve(handle, "0.0.0.0", 9000)
