import os
import json
import asyncio

from aiokafka import AIOKafkaConsumer, errors as kafka_errors

from handlers import send_event, send_to_room
from websocket_logger import logger
from data import room_list

KAFKA_URI = os.getenv("KAFKA_URI") or "localhost:9092"
KAFKA_TOPIC = "socket_answers"

consumer = None


def handle_message(message):
    destination_type = message["dest_type"]  # "room" or "user" or "list"
    recepient_id = message["dest_id"]

    if destination_type == "room":
        send_to_room(recepient_id, message)

    elif destination_type == "user":
        send_event(recepient_id, message)
        
    elif destination_type == "list": 
        event_type = message["event_type"]
        
        if event_type == "create_room":  # { "event_type": "new_room", "room_id": 1 }
            room_list.add_room(message["room_id"])

        if event_type == "update_room":  # { "event_type": "update_room", "room_id": 1, "room_count": 2 }
            room_list.update_room(message["room_id"], message["room_count"])
            
        if event_type == "remove_room":  # { "event_type": "remove_room", "room_id": 1 }
            room_list.remove_room(message["room_id"])


async def main() -> None:
    global consumer, KAFKA_URI

    logger.info("waiting 40s for kafka to be ready")
    await asyncio.sleep(40)

    logger.info(f"try to connect to kafka by uri: {KAFKA_URI}")
    consumer = AIOKafkaConsumer(
        KAFKA_TOPIC,
        bootstrap_servers=KAFKA_URI,
        value_deserializer=lambda v: json.loads(v.decode("utf-8")),
    )

    try:
        await consumer.start()
        logger.info("successfully connected")

    except kafka_errors.KafkaConnectionError:
        logger.info("can't connect to host.")
        await consumer.stop()
        exit(-1)

    # handling messages in loop
    try:
        async for message in consumer:
            await handle_message(message)

    except KeyboardInterrupt:
        await consumer.stop()

    except Exception as e:
        logger.error("Exit with unhandled exception:\n" + str(e))
        await consumer.stop()


if __name__ == "__main__":
    logger.info("start websocket kafka consumer")
    asyncio.run(main())