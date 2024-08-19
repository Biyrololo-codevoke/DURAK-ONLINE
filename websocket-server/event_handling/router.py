import asyncio

from websockets import WebSocketServerProtocol as WebSocket
from websocket_logger import logger

from .utils import serialize, handle_path, handle_socket_closing
from .event_handlers import handle_list, handle_room
from .data import key_identity


@handle_socket_closing
async def router(path: str, payload: dict, socket: WebSocket):
    endpoint, data = handle_path(path)

    match endpoint:
        case "/room-list":
            await handle_list(socket, payload)

        case "/room":
            # pre-handling shit requests
            if data.get('room_id') is None or data.get('key') is None:
                await socket.send(
                    serialize(
                        {"status": "error", "message": "missed one of required args (room_id or key)"}
                    )
                )
                await socket.close()

            key_identity[data['key']] = socket
            
            # add request params to payload
            payload["req"] = data
            asyncio.create_task(handle_room(payload, socket))

        case _:
            await socket.send(serialize({"status": "error", "message": f"{endpoint=} not found"}))
            await socket.close()