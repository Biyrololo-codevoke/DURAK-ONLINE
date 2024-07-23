import json
import logging
import os
import time

from confluent_kafka import Producer


logger = logging.getLogger("api_logger")

KAFKA_URI = os.getenv("KAFKA_URI") or "localhost:9092"
KAFKA_TOPIC_email = "send_email"
KAFKA_TOPIC_room = "socket_events"

config = {
    "bootstrap.servers": KAFKA_URI,
    "client.id": "python-producer",
}

logger.info("waiting 40s for kafka to be ready")
time.sleep(40)

# try to establish connection
logger.info(f"try to establish connection with kafka by uri: {KAFKA_URI}")
producer = Producer(config)

try:
    producer.produce("test", value="test")
    producer.flush()
except Exception as e:
    logger.info(f"Failed to connect to kafka: {e}")
    exit(-1)

def produce(topic, message):
    global producer

    serialized_message = serialize(message)
    producer.produce(topic, value=serialized_message)
    producer.flush()

def serialize(v: str) -> bytes:
    return json.dumps(v).encode("utf-8")


def send_mail_letter(name:str , email:str, code:int) -> None:
    message = {"name": name, "email": email, "code": code}
    produce(KAFKA_TOPIC_email, message)
    
def send_new_room(room_id: int, author_id: int, key: str) -> None:
    message = {
      "dest_type": "list",
      "event_type": "create_room",
      "author_id": author_id,
      "key": key,
      "room_id": room_id
    }
    produce(KAFKA_TOPIC_room, message)
