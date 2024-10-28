import asyncio

from server import start_server
from kafka import start_consumer
from websocket_logger import logger


logger.info("Server starting...")
asyncio.get_event_loop().run_until_complete(asyncio.gather(
    start_server,
    start_consumer()
))
asyncio.get_event_loop().run_forever()
