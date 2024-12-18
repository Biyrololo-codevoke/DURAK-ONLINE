import asyncio

from websockets import serve

from server import socket_listener
from kafka import start_consumer
from websocket_logger import logger



async def main():
    await asyncio.gather(
        serve(socket_listener, "0.0.0.0", 9000),
        start_consumer()
    )


if __name__ == "__main__":
    logger.info("Server starting...")
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())