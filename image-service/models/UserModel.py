from __future__ import annotations
from .db import db


class UserExceptions:
    class AlreadyExists(Exception):
        pass
    
    class NotFound(Exception):
        pass

    class IncorrectPassword(Exception):
        pass


class UserModel(db.Model):  # type: ignore
    __tablename__ = "user"

    id = db.Column(db.Integer, primary_key=True)
    _email = db.Column(db.String(120), unique=True)
    _username = db.Column(db.String(120), unique=True)
    money = db.Column(db.Integer, default=100)
    _password = db.Column(db.String(87), nullable=False)
    verified = db.Column(db.Boolean, default=False, nullable=False)
    image_id = db.Column(db.Integer, db.ForeignKey("images.id"), default=None, nullable=True)

    @classmethod
    def get_by_id(cls, user_id: int) -> UserModel:
        return cls.query.filter_by(id=user_id).first()

    def save(self) -> None:
        db.session.add(self)
        db.session.commit()
