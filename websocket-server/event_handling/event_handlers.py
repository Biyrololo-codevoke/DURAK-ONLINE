import asyncio

from websockets import WebSocketServerProtocol as WebSocket

from websocket_logger import logger

from .data import room_list, user_socket, socket_identity
from .utils import serialize


async def send_to_socket(socket: WebSocket, payload: dict):
    await socket.send(serialize(payload))


async def send_to_user(user_id: int, payload: dict):
    socket = user_socket[user_id]
    await send_to_socket(socket, payload)


async def send_to_room(room_id: int, payload: dict, broadcast_socket_id: int = None):
    room_sockets = room_list.get_room_connections(room_id)
    if room_sockets:
        logger.info(f"{room_sockets=}; {broadcast_socket_id=}\n {payload=}")
        for socket in room_sockets:
            if broadcast_socket_id == id(socket):
                continue
            await send_to_socket(socket, payload)


async def handle_room(payload: dict, socket: WebSocket):
    logger.info(f"handle_room: {payload=}")

    event = payload["event"]
    logger.info("received event %s" % event)

    match event:
        case "join_room":
            logger.info("try to join room")
            room_id = int(payload["req"]["room_id"])
            key = payload["req"]["key"]

            status, message = room_list.connect_to_room(room_id, key)
            logger.info(f"join result: {status=} {message=}")

            if not status:
                asyncio.gather(*[
                    send_to_socket(socket, {"status": "error", "message": message}),
                    socket.close()
                ])
            else:
                response = {
                    "status": "success",
                    "message": "you successfully joined to room %d" % room_id
                }
                asyncio.create_task(
                    send_to_socket(socket, response)
                )

        case "accept":
            logger.info("try to accept room")
            room_id = int(payload["req"]["room_id"])
            key = payload["req"]["key"]
            
            status, message = room_list.accept_start(room_id, key)
            logger.info(f"accept result: {status=} {message=}")
            
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
            asyncio.create_task(
                send_to_socket(socket, response)
            )


async def handle_list(socket: WebSocket, payload: dict):
    if "event" not in payload.keys():
        current_room_list = room_list.get_rooms()
        await send_to_socket(socket, current_room_list)
        # subscribe for future updates
        room_list.subscribe(socket)
    else:
        event = payload["event"]
        match event:
            case "join_room":
                if payload.get("room_id") is None:
                    await send_to_socket(socket, {"status": "error", "message": "room_id is missed"})

                room_id = payload.get("room_id")
                passsword = payload.get("password")  # nullable
                player_id = socket_identity[id(socket)]

                status, message = room_list.join_to_room(room_id, player_id, passsword)

                if status:
                    await send_to_socket(socket, {"status": "success", "key": message})
                else:
                    await send_to_socket(socket, {"status": "error", "message": message})

            case _:
                await send_to_socket(socket, {"status": "error", "message": f"{event=} not found"})
    return 0