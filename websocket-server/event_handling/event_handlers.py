import asyncio
import json

from websockets import WebSocketServerProtocol as WebSocket

from websocket_logger import logger

from .data import room_list, Player, player_list, route_game_events
from .utils import serialize


async def send_to_socket(socket: WebSocket, payload: dict):
    await socket.send(serialize(payload))


async def send_to_user(user_id: int, payload: dict):
    socket = user_socket[user_id]
    logger.info(f"send_to_user[{user_id}] event {payload.get('event')}: -> {payload}")
    await send_to_socket(socket, payload)


async def send_to_room(room_id: int, payload: dict, broadcast_socket_id: int = None):
    room_sockets = room_list.get_room_connections(room_id)
    if room_sockets:
        logger.info(f"send_to_room[{room_id}] event: {payload.get('event')}")
        for socket in room_sockets:
            if broadcast_socket_id == id(socket):
                continue
            await send_to_socket(socket, payload)


async def handle_room(player: Player, payload: dict):
    event = payload.get("event")

    room_id = player.room.id
    key = player.key

    match event:
        case "join_room":
            status, message = room_list.connect_to_room(room_id, key)

            if not status:
                player.send({"status": "error", "message": message})
                player.disconnect()
            else:
                player.send({
                    "status": "success",
                    "message": "you successfully joined to room %d" % room_id
                })

        case "accept":
            status, message = room_list.accept_start(room_id, key)  # todo: refactor

            if not status:
                response = {
                    "status": "error",
                    "message": message
                }
            else:
                response = {
                    "status": "success",
                    "message": "you successfully accept game start"
                }
            player.send(response)

        case _:
            route_game_events(payload, room_id, player)


async def handle_list(player: Player, payload: dict):
    key = player.key
    event = payload.get("event")
    
    if not event:
        room_list_json = {
            "rooms": room_list.get_rooms()
        }
        player.send
        room_list.subscribe(player)
    else:
        match event:
            case "join_room":
                room_id   = payload.get("room_id")
                passsword = payload.get("password")  # nullable

                if room_id is None:
                    player.send({"status": "error", "message": "room_id is missed"})

                status, message = room_list.join_to_room(room_id, player, passsword)

                if status:
                    player.send({"status": "success", "key": message})
                else:
                    player.send({"status": "error", "message": message})

            case _:
                player.send({"status": "error", "message": f"{event=} not found"})
