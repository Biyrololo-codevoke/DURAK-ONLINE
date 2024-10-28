import asyncio
import websockets
import json
from typing import Callable

from logger import logger


SERVER:   str      = "wss://codevoke.ru"
run:      bool     = None
callback: Callable = None


async def handle_event(message: dict):
    logger.info("received message[%d] - %s" % (id(message), str(message)))
    try:
        await callback(message)
    except BaseException as e:
        logger.error("get error while handle message[%d] - %s" % (id(message), str(e)))


async def send_message(ws, event: dict):
    logger.info(f"Sending message: {event}")
    await ws.send(json.dumps(event))


async def connect(endpoint: str, _callback: Callable):
    global run, callback
    run = True
    callback = _callback
    
    async with websockets.connect(SERVER + endpoint) as ws:
        asyncio.create_task(receive_messages(ws))
        while run:
            await asyncio.sleep(1)


async def receive_messages(ws):
    try:
        async for message in ws:
            data = json.loads(message)
            await handle_event(data)
    except websockets.ConnectionClosed:
        logger.info("Connection closed")
  

async def disconnect():
    global run
    run = False
