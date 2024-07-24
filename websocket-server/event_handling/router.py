from websockets import WebSocketServerProtocol as WebSocket

from websocket_logger import logger

from .utils import serialize, handle_path
from .event_handlers import handle_list, handle_room

from event_handling import key_identity


async def router(path: str, payload: dict, socket: WebSocket):
    endpoint, data = handle_path(path)
    logger.info(f"endpoint: {endpoint} data: {data}")

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
            payload["req"] = data  # add request params to payload
            payload["event"] = "join_room"
            handle_room(payload, socket)

        case _:
            await socket.send(serialize({"status": "error", "message": f"{endpoint=} not found"}))
            await socket.close()