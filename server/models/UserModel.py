from __future__ import annotations

from passlib.hash import pbkdf2_sha256

from .db import db, BaseModel
from .VerifyCodeModel import VerifyCodeModel


class UserExceptions:
    class AlreadyExists(Exception):
        pass
    
    class NotFound(Exception):
        pass

    class IncorrectPassword(Exception):
        pass


class UserModel(BaseModel):  # type: ignore
    __tablename__ = "user"

    id = db.Column(db.Integer, primary_key=True)
    _email = db.Column(db.String(120), unique=True)
    username = db.Column(db.String(120), unique=True)
    money = db.Column(db.Integer, default=100)
    _password = db.Column(db.String(87), nullable=False)
    verified = db.Column(db.Boolean, default=False, nullable=False)

    def json(self) -> dict[str, int | bool | str]:
        return {
            "id": self.id,
            "username": self.username,
            "verified": self.verified,
            "money": self.money
        }
    
    def __init__(self, email: str, username: str, password: str) -> None:
        self.email = email
        self.username = username
        self.password = password

    def verify_user(self, code: str) -> None:
        self.set_verified(
            VerifyCodeModel.verify(self.id, code)
        )

    @property
    def password(self) -> str:
        return str(self._password)

    @password.setter
    def password(self, password: str) -> None:
        self._password = pbkdf2_sha256.hash(password)

    @property
    def email(self) -> str:
        return str(self._email)

    @email.setter
    def email(self, email: str) -> None:
        try:
            self.get_by_email(email)
            raise UserExceptions.AlreadyExists
        except UserExceptions.NotFound: 
            self._email = email

    @classmethod
    def get_by_id(cls, _id: int) -> UserModel:
        user = cls.query.filter_by(id=_id).first()
        if not user:
            raise UserExceptions.NotFound
        return user

    @classmethod
    def get_by_email(cls, email: str) -> UserModel:
        user = cls.query.filter_by(email=email).first()
        if not user:
            raise UserExceptions.NotFound
        return user

    @classmethod
    def get_by_username(cls, username: str) -> UserModel:
        user = cls.query.filter_by(username=username).first()
        if not user:
            raise UserExceptions.NotFound
        return user

    @classmethod
    def auth(cls, email: str, password: str) -> UserModel:
        user = cls.get_by_email(email)
        if pbkdf2_sha256.verify(password, user.password):
            return user
        else:
            raise UserExceptions.IncorrectPassword

    def set_verified(self, verified: bool) -> None:
        self.verified = verified
        self.save()
