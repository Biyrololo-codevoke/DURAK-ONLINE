import asyncio

from server import make_websocket_server, socket_listener
from kafka import start_consumer
from websocket_logger import logger


logger.info("Server starting...")


async def main():
    await asyncio.gather(
        make_websocket_server(socket_listener, "0.0.0.0", 9000),
        start_consumer()
    )


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())