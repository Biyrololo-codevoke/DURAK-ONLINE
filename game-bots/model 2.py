from __future__ import annotations

import os
from typing import Type

from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import create_engine
from sqlalchemy import Column, Integer, String, Boolean, Enum, ARRAY, ForeignKey
from sqlalchemy.exc import NoResultFound


Base = declarative_base()
engine = create_engine(os.getenv("DATABASE_URI"))
Session = sessionmaker(bind=engine)
session = Session()


class VerifyExceptions(Exception):
    class NotFound(Exception):
        pass

    class IncorrectCode(Exception):
        pass
    

class BaseModel(Base):
    def save(self) -> None:
        session.add(self)
        session.commit()

    def delete(self) -> None:
        session.delete(self)
        session.commit()


class VerifyCodeModel(BaseModel):
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("user.id"))
    code = Column(String(6))

    @classmethod
    def get_by_user_id(cls, user_id: int) -> VerifyCodeModel:
        try:
            return session.query(cls).filter(cls.user_id == user_id).one()
        except NoResultFound:
            return None


if __name__ == "__main__":
    Base.metadata.create_all(engine)
