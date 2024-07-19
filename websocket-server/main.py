import asyncio

from server import start_server
from kafka_consumer import start_consumer
from websocket_logger import logger


logger.info("Starting server creating")
asyncio.get_event_loop().run_until_complete(asyncio.gather(
    start_server,
    start_consumer()
))
asyncio.get_event_loop().run_forever()

logger.info("Server successfully upped")
