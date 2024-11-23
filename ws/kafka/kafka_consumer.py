import os
import json

from aiokafka import AIOKafkaConsumer, errors as kafka_errors

from handlers.Room import Room, RoomConfig
from websocket_logger import logger


KAFKA_URI = os.getenv("KAFKA_URI") or "localhost:9092"
KAFKA_TOPIC = "socket_events"

consumer = None


def handle_message(message):
    event = message["event"]
    
    match event:
        case "create_room":  # { "event_type": "new_room", "room_id": 1 }
            id = message["room_id"],          
            author_id = message["author_id"],
            key = message["key"]
            config = message["config"]
            
            room_config = RoomConfig(
                **config  # TODO: cast to RoomConfig
            )
            room = Room(id, author_id, config.private, room_config)
            
        case _:
            logger.error(f"unknown kafka event: {event}")


async def start_consumer() -> None:
    global consumer, KAFKA_URI

    consumer = AIOKafkaConsumer(
        KAFKA_TOPIC,
        bootstrap_servers=KAFKA_URI,
        value_deserializer=lambda v: json.loads(v.decode("utf-8")),
    )

    try:
        await consumer.start()
        logger.info("successfully connected kafka consumer")

    except kafka_errors.KafkaConnectionError:
        logger.info("can't connect to host.")
        await consumer.stop()
        exit(-1)

    # handling messages in loop
    try:
        async for message in consumer:
            handle_message(message.value)

    except KeyboardInterrupt:
        await consumer.stop()

    except Exception as e:
        logger.error("Exit with unhandled exception:\n" + str(e))
        await consumer.stop()
        raise Exception from e
