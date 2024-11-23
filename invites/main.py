import asyncio

from server import start_server
from _logging import logger


logger.info("Server starting...")
asyncio.get_event_loop().run_until_complete(asyncio.gather(
    start_server
))
asyncio.get_event_loop().run_forever()
