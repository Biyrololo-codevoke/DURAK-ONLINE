from __future__ import annotations

from typing import Type

from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.exc import NoResultFound

from .db import Base, session, retry_on_exception, CustomDBException


class UserExceptions:
    class AlreadyExists(CustomDBException):
        pass

    class NotFound(CustomDBException):
        pass

    class IncorrectPassword(CustomDBException):
        pass


class UserModel(Base):  # type: ignore
    __tablename__ = "user"

    id = Column(Integer, primary_key=True)
    _email = Column(String(120), unique=True)
    _username = Column(String(120), unique=True)
    money = Column(Integer, default=100)
    _password = Column(String(87), nullable=False)
    verified = Column(Boolean, default=False, nullable=False)
    image_id = Column(String, default=None, nullable=True)

    @classmethod
    @retry_on_exception(max_retries=1, delay=0.01)
    def get_by_id(cls, user_id: int) -> Type[UserModel]:
        try:
            return session.query(cls).filter_by(id=user_id).one()
        except NoResultFound:
            raise UserExceptions.NotFound

    @property
    @retry_on_exception(max_retries=1, delay=0.01)
    def username(self) -> str:
        return self._username
