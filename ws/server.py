import asyncio

import tornado.ioloop
import tornado.web
import tornado.websocket

from handlers import Room, RoomList
from websocket_logger import logger


WEB_SOCKET_PORT = 8888
WEB_SOCKET_PREFIX = "/ws"


def make_app():
    return tornado.web.Application([
        (WEB_SOCKET_PREFIX + Room.path, Room),
        (WEB_SOCKET_PREFIX + RoomList.path, RoomList),
    ])


async def start_server():
    app = make_app()
    app.listen(WEB_SOCKET_PORT)
    shutdown_event = asyncio.Event()
    logger.info("Server listening on port %d", WEB_SOCKET_PORT)
    await shutdown_event.wait()


if __name__ == "__main__":
    asyncio.run(start_server())
