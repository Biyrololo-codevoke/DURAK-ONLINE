from typing import Tuple

from websockets import WebSocketServerProtocol as WebSocket, serve as make_websocket_server

from websocket_logger import logger

from event_handling.data import socket_identity, user_socket
from event_handling import serialize, deserialize, router, auth_socket


async def socket_listener(socket: WebSocket, path: str):
    socket_id = id(socket)
    logger.info(f"{socket.remote_address}[id: {socket_id}] -> {path}")
    auth = False
    
    if path.startswith("/ws/room?"):
        await router(path, {}, socket)

    async for message in socket:
        payload = deserialize(message)
        logger.info(f"[id: {socket_id}] ({path}) <- {payload}")

        # auth
        if not auth:
            auth, message = auth_socket(payload)
            await socket.send(serialize(message))
            if auth:
                user_id = int(message["user_id"])
                # save socket with user_id (two dicts for useful)
                socket_identity[socket_id] = user_id
                user_socket[user_id] = socket

        # post auth event handling ( if auth was success )
        if auth:
            await router(path, payload, socket)


start_server = make_websocket_server(socket_listener, "0.0.0.0", 9000)
