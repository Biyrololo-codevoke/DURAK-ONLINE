import os
import json

from aiokafka import AIOKafkaConsumer, errors as kafka_errors

from socket_event_handlers import send_to_user, send_to_room
from websocket_logger import logger
from data import room_list


KAFKA_URI = os.getenv("KAFKA_URI") or "localhost:9092"
KAFKA_TOPIC = "socket_events"

consumer = None


def handle_message(message):
    logger.info(message)
    destination_type = message.get("dest_type")  # "room" or "user" or "list"

    recipient_id = message.get("dest_id")

    if destination_type == "room":
        logger.info("event for room")
        send_to_room(recipient_id, message)

    elif destination_type == "user":
        logger.info("event for user")   
        send_to_user(recipient_id, message)
        
    elif destination_type == "list":  # { "dest_type": "list", ... }
        logger.info("event for list")   
        event_type = message["event_type"]
        
        if event_type == "create_room":  # { "event_type": "new_room", "room_id": 1 }
            room_list.add_room(message["room_id"])

        if event_type == "update_room":  # { "event_type": "update_room", "room_id": 1, "room_count": 2 }
            room_list.update_room(message["room_id"], message["room_count"])
            
        if event_type == "remove_room":  # { "event_type": "remove_room", "room_id": 1 }
            room_list.remove_room(message["room_id"])


async def start_consumer() -> None:
    global consumer, KAFKA_URI

    logger.info(f"try to connect to kafka by uri: {KAFKA_URI}")
    consumer = AIOKafkaConsumer(
        KAFKA_TOPIC,
        bootstrap_servers=KAFKA_URI,
        value_deserializer=lambda v: json.loads(v.decode("utf-8")),
    )

    try:
        await consumer.start()
        logger.info("successfully connected (huy)")

    except kafka_errors.KafkaConnectionError:
        logger.info("can't connect to host.")
        await consumer.stop()
        exit(-1)
        
    finally:
        logger.info("starting consumer loop")

    logger.info("starting consumer loop")
    # handling messages in loop
    try:
        async for message in consumer:
            logger.info(dir(message))
            handle_message(message.value)

    except KeyboardInterrupt:
        await consumer.stop()

    except Exception as e:
        logger.error("Exit with unhandled exception:\n" + str(e))
        await consumer.stop()
        raise Exception from e
