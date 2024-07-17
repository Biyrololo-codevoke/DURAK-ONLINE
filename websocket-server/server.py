import json
from websockets import WebSocketServerProtocol as WebSocket, serve as make_websocket_server

from typing import Tuple


from handlers import handle_list, handle_room, handle_jwt_token
from websocket_logger import logger


def serialize(dict_json: dict) -> str:  # serializes dict to json string
    return json.dumps(dict_json)


def deserialize(str_json: str) -> dict:  # deserializes string json to dict
    return json.loads(str_json)


async def handle(socket: WebSocket, path: str):
    socket_id = id(socket)
    logger.info(f"{socket.remote_address}[id: {socket_id}] -> {path}")
    auth = False

    async for message in socket:
        payload = deserialize(message)
        logger.info(" :>> " + str(payload) + " " + str(type(payload)))

        # auth
        if not auth:
            auth, message = auth_socket(payload)
            await socket.send(serialize(message))
        else:
            await router(path, payload, socket)


async def router(path: str, payload: dict, socket: WebSocket):
    if path == "/ws/room/list":
        await handle_list(socket)

    elif path.startswith("/ws/room/"):
        try:
            room_id = int(path.split('/')[-1])
            payload["room_id"] = room_id
            await handle_room(payload, socket)

        except ValueError:
            await socket.send(
                serialize({"status": "error", "message": "room_id must be int"})
            )

    else:
        await socket.send(serialize({"status": "error", "message": "path not found"}))
        await socket.close()


logger.info("router made")


def auth_socket(message: dict) -> Tuple[bool, dict]:
    if "access_token" not in message.keys():
        return False, {"status": "error", "message": "access token wasn't found in request"}

    else:
        status, data = handle_jwt_token(message["access_token"])
        if not status:
            return False, {"status": "error", "message": data}
        else:
            return True, {"status": "success", "message": "Successfully authorized"}


start_server = make_websocket_server(handle, "0.0.0.0", 9000)
