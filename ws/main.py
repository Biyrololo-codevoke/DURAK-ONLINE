import asyncio

from server import start_server
from kafka import start_consumer


asyncio.get_event_loop().run_until_complete(asyncio.gather(
    start_consumer(),
    start_server,
))
asyncio.get_event_loop().run_forever()
