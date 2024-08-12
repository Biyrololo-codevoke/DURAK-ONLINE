import asyncio

from logger import logger
from websocket import connect


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    
    list_endpoint = "/room-list"
    loop.create_task(connect(list_endpoint))
