import os
import datetime
import logging


date = datetime.datetime.now().strftime("%Y.%m.%d")

logger = logging.getLogger("websocket")  # take logger
logger.setLevel(logging.INFO)

console_handler = logging.StreamHandler()  # console logger
console_handler.setLevel(logging.INFO)

if not os.path.exists("logs"):
    os.mkdir("logs")

file_handler = logging.FileHandler("logs/%s.log" % (date, ))  # file logger
file_handler.setLevel(logging.WARNING)

# log format
date_format = "%d.%m.%y %H:%M"
formatter = logging.Formatter("[%(asctime)s] %(name)s -> %(message)s", datefmt=date_format)

console_handler.setFormatter(formatter)
file_handler.setFormatter(formatter)

logger.addHandler(console_handler)
logger.addHandler(file_handler)

logger.info("websocket logger successfully initialized")