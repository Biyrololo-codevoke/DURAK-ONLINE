import logging


logger = logging.getLogger("bots")  # take logger
logger.setLevel(logging.DEBUG)

console_handler = logging.StreamHandler()  # console logger
console_handler.setLevel(logging.DEBUG)

# log format
date_format = "%d %H:%M"
formatter = logging.Formatter("[%(asctime)s] %(message)s", datefmt=date_format)

console_handler.setFormatter(formatter)
logger.addHandler(console_handler)

logger.info("loggers successfully initialized")
