import asyncio

from websockets import WebSocketServerProtocol as WebSocket, serve as make_websocket_server
from websocket_logger import logger

from event_handling.data import socket_identity, user_socket
from event_handling import serialize, deserialize, router, auth_socket


async def socket_listener(socket: WebSocket, path: str):
    try:
        socket_id = id(socket)
        logger.info(f"ws opened - {socket_id}; path - {path}")
        auth = False

        if path.startswith("/ws/room?"):
            await router(path, {"event": "join_room"}, socket)

            async for message in socket:
                try:
                    asyncio.create_task(router(path, deserialize(message), socket))
                except Exception as e:
                    logger.error("socket listener error into async into room: " + str(e))
            logger.info(f"ws closed - {socket.closed}; code - {socket.close_code}; reason - {socket.close_reason}")

        async for message in socket:
            try:
                payload = deserialize(message)

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

            except Exception as e:
                logger.error("socket listener error into async with auth: " + str(e))

    except Exception as e:
        logger.error("socket listener error: " + str(e))


start_server = make_websocket_server(socket_listener, "0.0.0.0", 9000)

