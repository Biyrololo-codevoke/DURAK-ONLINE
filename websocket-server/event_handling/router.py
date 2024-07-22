from websockets import WebSocketServerProtocol as WebSocket

from .utils import serialize, handle_path
from .event_handlers import handle_list, handle_room


async def router(path: str, payload: dict, socket: WebSocket):
    endpoint, data = handle_path(path)

    match endpoint:
        case "room-list":
            await handle_list(socket, payload)

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