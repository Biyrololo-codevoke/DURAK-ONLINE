from __future__ import annotations

from passlib.hash import pbkdf2_sha256

from .db import db, BaseModel, retry_on_exception, CustomDBException
from .VerifyCodeModel import VerifyCodeModel


class UserExceptions:
    class AlreadyExists(CustomDBException):
        message = "User with this email or username already exists"
    
    class NotFound(CustomDBException):
        message = "User obj not found in db"

    class IncorrectPassword(CustomDBException):
        message = "Incorrect password"


class UserModel(BaseModel):  # type: ignore
    __tablename__ = "user"

    id = db.Column(db.Integer, primary_key=True)
    _email = db.Column(db.String(120), unique=True)
    _username = db.Column(db.String(120), unique=True)
    money = db.Column(db.Integer, default=100)
    _password = db.Column(db.String(87), nullable=False)
    verified = db.Column(db.Boolean, default=False, nullable=False)
    image_id = db.Column(db.String, default=None, nullable=True)

    def json(self) -> dict[str, int | bool | str]:
        return {
            "id": self.id,
            "username": self.username,
            "verified": self.verified,
            "money": self.money,
            "image_id": self.image_id
        }
    
    @retry_on_exception(max_retries=3, delay=0.05)
    def __init__(self, email: str, username: str, password: str) -> None:
        self.email = email
        self.username = username
        self.password = password
        self.save()

    @retry_on_exception(max_retries=3, delay=0.05)
    def verify_user(self, code: str) -> None:
        user_verify = VerifyCodeModel.verify(self.id, code)
        self.set_verified(user_verify)

    @property
    @retry_on_exception(max_retries=1, delay=0.01)
    def username(self) -> str:
        return self._username

    @username.setter
    def username(self, username) -> None:
        try:
            self.get_by_username(username)
            raise UserExceptions.AlreadyExists
        except UserExceptions.NotFound: 
            self._username = username

    @property
    @retry_on_exception(max_retries=1, delay=0.05)
    def password(self) -> str:
        return str(self._password)

    @password.setter
    def password(self, password: str) -> None:
        self._password = pbkdf2_sha256.hash(password)

    @property
    @retry_on_exception(max_retries=1, delay=0.01)
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
    @retry_on_exception(max_retries=1, delay=0.01)
    def get_by_id(cls, _id: int) -> UserModel:
        user = cls.query.filter_by(id=_id).first()
        if not user:
            raise UserExceptions.NotFound
        return user

    @classmethod
    @retry_on_exception(max_retries=1, delay=0.01)
    def get_by_email(cls, email: str) -> UserModel:
        user = cls.query.filter_by(_email=email).first()
        if not user:
            raise UserExceptions.NotFound
        return user

    @classmethod
    @retry_on_exception(max_retries=1, delay=0.01)
    def get_by_username(cls, username: str) -> UserModel:
        user = cls.query.filter_by(_username=username).first()
        if not user:
            raise UserExceptions.NotFound
        return user

    @classmethod
    @retry_on_exception(max_retries=3, delay=0.05)
    def auth(cls, email: str, password: str) -> UserModel:
        user = cls.get_by_email(email)
        if pbkdf2_sha256.verify(password, user.password):
            return user
        else:
            raise UserExceptions.IncorrectPassword

    @retry_on_exception(max_retries=3, delay=0.05)
    def set_verified(self, verified: bool) -> None:
        self.verified = verified
        self.save()
