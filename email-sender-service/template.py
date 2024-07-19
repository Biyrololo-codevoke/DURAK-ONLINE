html_letter_template = r"""<html><body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Roboto','Oxygen','Ubuntu','Cantarell','Fira Sans','Droid Sans','Helvetica Neue',sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;color:white;"><div style="position: relative; width: 100%; background: #2f679e;"><center><div style="width: 650px; background: #4E7499;"><center><div style="width:600px;left:25px;"><table style="padding-top:25px;"><tbody><tr><td style="height:375px;"><img src={image_path} style="width:375px;border-radius:12px;"></td></tr><tr><th style="padding-top:15px;font-size:40px;">Durak Online</th></tr></tbody></table><br><p style="font-size:25px;margin:0;">Здравствуйте, {username}.<br>Ваш код для подтверждения электронной почты:</p><div style="padding:20px;user-select:all;cursor:pointer;" onclick="navigator.clipboard.writeText('{code}')" title="click to copy"><div style="border:2px solid white;padding: 5px 10px;font-size:30px;letter-spacing:5px;display:table;">{code}</div></div><br><hr><p style="padding: 0 0 25px;margin:0;">Данный код действует в течении часа с момента отправки письма</p></div></center></div></center></div></body></html>"""


def render_template(name, code, image_path) -> str:
    return html_letter_template.format(username=name, code=code, image_path=image_path)
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
SERVER = "https://durak.online"  # replcae actual servername

KAFKA_URI = os.getenv("KAFKA_URI") or "localhost:9092"
KAFKA_TOPIC = "send_email"

consumer = None


async def send_email(email: str, username: str, code: str) -> None:
    global SMTP_LOGIN, SMTP_PASSWORD, SMTP_SERVER, SMTP_PORT, SERVER, LOGO_PATH

    message = MIMEMultipart("alternative")
    message["Subject"] = "Подтвердите ваш адрес электронной почты"
    message["From"] = SMTP_LOGIN
    message["To"] = email

    text = "Здравствуйте %s.\nВаш код для подтверждения электронной почты: %s" % (
        username,
        code,
    )
    html = render_template(username, code, SERVER + LOGO_PATH)

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
        logger.WARNING(f"Ошибка отправки письма: {e}")
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
