import asyncio

from websocket_logger import logger

from .event_handlers import handle_list, handle_room
from .data import Player


async def router(path: str, payload: dict, player: Player):
    endpoint, data = handle_path(path)

    match endpoint:
        case "/room-list":
            logger.info("Room list requested")
            await handle_list(player, payload)

        case "/room":
            logger.info("Room requested")
            await handle_room(player, payload)

        case _:
            logger.error(f"{endpoint=} not found")
            player.send({"status": "error", "message": f"{endpoint=} not found"})
            player.disconnect()
