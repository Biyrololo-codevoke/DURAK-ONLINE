from functools import wraps
from logging import getLogger, StreamHandler as LoggingStreamHandler, DEBUG as LoggingLevelDebug
import time

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import SQLAlchemyError

from flask.typing import AppOrBlueprintKey


db = SQLAlchemy()

db_logger = getLogger("db")
# set up logging
console_handler = LoggingStreamHandler()  # console logger
console_handler.setLevel(LoggingLevelDebug)
db_logger.addHandler(console_handler)


def init_app(app: AppOrBlueprintKey) -> None:
    global db, db_logger

    db.init_app(app)
    with app.app_context():
        db.create_all()
        db_logger.info("Database initialized successfully")
        
        
class CustomDBException(SQLAlchemyError, BaseException):
    message = "CustomDBException"

    def __init__(self, message=None):
        global db_logger
        msg = message or self.message
        db_logger.error("raised custom db exception: " + str(msg))
        super().__init__(msg)
        
        
def retry_on_exception(max_retries=3, delay=0.1):
    global db_logger
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            retries = 0
            while retries < max_retries:
                try:
                    return func(*args, **kwargs)
                except SQLAlchemyError as e:
                    db_logger.error(f"Database error: {str(e)}\nRetrying {retries + 1}/{max_retries}...")
                    db.session.rollback()  # Откат транзакции для ошибок SQLAlchemy
                    retries += 1
                    time.sleep(delay)
                    if retries >= max_retries:
                        db_logger.critical("Maximum number of retries exceeded, aborting.")
                        raise e  # Повторное выбрасывание исключения после исчерпания попыток
                except CustomDBException as e:
                    raise e  # Повторное выбрасывание исключения после исчерпания попыток
        return wrapper
    return decorator


class BaseModel(db.Model):  # type: ignore
    __abstract__ = True

    def __str__(self) -> str:
        return str(self.json())

    def save(self) -> None:
        db.session.add(self)
        db.session.commit()

    def delete(self) -> None:
        db.session.delete(self)
        db.session.commit()
