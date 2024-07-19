from websockets import WebSocketServerProtocol as WebSocket, serve as make_websocket_server

from typing import Tuple

from utils import serialize, deserialize, handle_path, handle_jwt_token
from socket_event_handlers import handle_list, handle_room
from websocket_logger import logger
from data import socket_identity


async def socket_listener(socket: WebSocket, path: str):
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
            if auth:
                socket_identity[socket_id] = message["user_id"]

        if auth:
            await router(path, payload, socket)


def auth_socket(message: dict) -> Tuple[bool, dict]:
    if "access_token" not in message.keys():
        return False, {"status": "error", "message": "access token wasn't found in request"}

    else:
        status, data = handle_jwt_token(message["access_token"])
        if not status:
            return False, {"status": "error", "message": data}
        else:
            return True, {"status": "success", "message": "Successfully authorized", "user_id": data}


async def router(path: str, payload: dict, socket: WebSocket):
    endpoint, data = handle_path(path)

    match endpoint:
        case "room-list":
            await handle_list(socket)

        case "room":
            # pre-handling shit requests
            if data.get('room_id') is None or data.get('key') is None:
                await socket.send(
                    serialize(
                        {"status": "error", "message": "missed one of required args (room_id or key)"}
                    )
                )
                await socket.close()

            payload["req"] = data  # add request params to payload
            await handle_room(payload, socket)

        case _:
            await socket.send(serialize({"status": "error", "message": f"{endpoint=} not found"}))
            await socket.close()


start_server = make_websocket_server(socket_listener, "0.0.0.0", 9000)
