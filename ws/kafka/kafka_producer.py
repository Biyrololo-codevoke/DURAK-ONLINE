import json
import os
import time
from websocket_logger import logger

from confluent_kafka import Producer


KAFKA_URI = os.getenv("KAFKA_URI") or "localhost:9092"
KAFKA_TOPIC = "events"

config = {
    "bootstrap.servers": KAFKA_URI,
    "client.id": "python-producer",
}

producer = Producer(config)

try:
    producer.produce("test", value="test")
    producer.flush()
    logger.info("successfully connected producer to kafka")
except Exception as e:
    logger.info(f"Failed to connect to kafka: {e}")
    exit(-1)


def produce(topic, message, key=None, partition=None):
    global producer

    serialized_message = serialize(message)
    producer.produce(topic, value=serialized_message, key=key, partition=partition)
    producer.flush()


def serialize(v: str) -> bytes:
    return json.dumps(v).encode("utf-8")


key_partitions = {
    "test": 0,
    "enter": 1,
    "leave": 2,
    "room_list": 3,
}


def send_event(payload):
    global key_partitions

    key = payload["event"]
    partition = key_partitions.get(key)

    produce(KAFKA_TOPIC, payload, partition=partition, key=payload["event"])
