import os
import json

from aiokafka import AIOKafkaConsumer, errors as kafka_errors

from event_handling import send_to_user, send_to_room, room_list
from websocket_logger import logger


KAFKA_URI = os.getenv("KAFKA_URI") or "localhost:9092"
KAFKA_TOPIC = "socket_events"

consumer = None


def handle_message(message):
    destination_type = message.get("dest_type")  # "room" or "user" or "list"

    recipient_id = message.get("dest_id")

    if destination_type == "room":
        send_to_room(recipient_id, message)

    elif destination_type == "user":
        send_to_user(recipient_id, message)
        
    elif destination_type == "list":
        event_type = message["event_type"]
        
        if event_type == "create_room":  # { "event_type": "new_room", "room_id": 1 }
            room_list.add_room(
                message["room_id"],          
                author_id=message["author_id"],
                key=message["key"]
            )

        # if event_type == "update_room":  # { "event_type": "update_room", "room_id": 1, "room_count": 2 }
        #     room_list.update_room(message["room_id"], message["room_count"])
            
        # if event_type == "remove_room":  # { "event_type": "remove_room", "room_id": 1 }
        #     room_list.remove_room(message["room_id"])


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
