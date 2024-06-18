import os
import time
import json
import asyncio

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import aiosmtplib as smtp
from aiokafka import AIOKafkaConsumer, errors as kafka_errors

from logger import logger
from template import render_template


SMTP_SERVER = "smtp.yandex.ru"
SMTP_PORT = 465
SMTP_LOGIN = "durak2.online@yandex.ru"
SMTP_PASSWORD = "nrddetakhuebpakk"

LOGO_PATH = os.getenv("LOGO_PATH")
KAFKA_URI = os.getenv("KAFKA_URI") or "localhost:9092"
KAFKA_TOPIC = "send_email"

consumer = None


async def send_email(email: str, username: str, code: str) -> None:
    global SMTP_LOGIN, SMTP_PASSWORD, SMTP_SERVER, SMTP_PORT, LOGO_PATH

    message = MIMEMultipart("alternative")
    message["Subject"] = "Подтвердите ваш адрес электронной почты"
    message["From"] = SMTP_LOGIN
    message["To"] = email

    text = "Здравствуйте %s.\nВаш код для подтверждения электронной почты: %s" % (
        username,
        code,
    )
    html = render_template(username, code, LOGO_PATH)

    part1 = MIMEText(text, "plain")
    part2 = MIMEText(html, "html")
    message.attach(part1)
    message.attach(part2)

    try:
        await smtp.send(
            message,
            hostname=SMTP_SERVER,
            port=SMTP_PORT,
            username=SMTP_LOGIN,
            password=SMTP_PASSWORD,
            use_tls=True,
        )
        return True
    except Exception as e:
        logger.error(f"Ошибка отправки письма: {e}")
        return False


async def process_message(message) -> None:
    global consumer

    data = message.value
    email = data["email"]
    username = data["name"]
    code = data["code"]

    email_sent = await send_email(email, username, code)

    if email_sent:
        pass
    else:
        logger.info(f"Ошибка отправки письма для {username} ({email})")


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
            await process_message(message)

    except KeyboardInterrupt:
        await consumer.stop()

    except Exception as e:
        logger.error("Exit with unhandled exception:\n" + str(e))
        await consumer.stop()


if __name__ == "__main__":
    logger.info("start email microservice")
    asyncio.run(main())
