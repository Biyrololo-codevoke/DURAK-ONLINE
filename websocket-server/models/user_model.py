from __future__ import annotations

from typing import Type

from sqlalchemy import Column, Integer, String, Boolean, Enum, ARRAY
from sqlalchemy.exc import NoResultFound

from .db import Base, session


class UserExceptions:
    class AlreadyExists(Exception):
        pass

    class NotFound(Exception):
        pass

    class IncorrectPassword(Exception):
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
    def get_by_id(cls, user_id: int) -> Type[UserModel]:
        try:
            return session.query(cls).filter_by(id=user_id).one()
        except NoResultFound:
            raise UserExceptions.NotFound

    @property
    def username(self) -> str:
        return self._username
