import json
import asyncio

from websockets import WebSocketServerProtocol as WebSocket
from websockets.exceptions import ConnectionClosed

from websocket_logger import logger

from event_handling.data import Player, player_list, room_list
from event_handling import serialize, deserialize, router, auth_socket_via_key, auth_socket_via_token, handle_disconnect


async def ping_socket(socket: WebSocket, player: Player):
    while True:
        try:
            await socket.ping()
            await asyncio.sleep(0.5)
        except ConnectionClosed:
            handle_disconnect(player)
            break


async def socket_listener(socket: WebSocket):
    path = socket.request.path
    logger.info(f"New connection from {socket.remote_address}")

    auth:   bool   = False
    player: Player = None
    room_id: int   = None
    type: str      = None

    async for message in socket:
        payload = deserialize(message)

        # auth
        if not auth:
            if path.startswith("/ws/room?"):
                auth, message = auth_socket_via_key(payload)
                type = "ROOM"
                room_id = int(payload.get("room_id", "-1"))
            else:
                auth, message = auth_socket_via_token(payload)
                type = "LIST"

            # send auth message
            await socket.send(serialize(message))

            if auth:
                user_id = int(message.get("user_id", "-1"))
                key = message.get("key")
                player = Player(
                    socket  = socket,
                    type    = type,
                    key     = key,
                    id      = user_id,
                    room_id = room_id
                )

                if type == "LIST":
                    room_list.subscribe(player)

                player_list.append(player)

                asyncio.create_task(ping_socket(socket, player))
        else:
            await router(path, payload, player)
