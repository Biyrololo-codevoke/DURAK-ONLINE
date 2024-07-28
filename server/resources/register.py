from typing import Any
from string import digits
from http import HTTPStatus

from flask_jwt_extended import create_access_token

from ..models import UserModel, VerifyCodeModel, Exceptions as exc

from .api import BaseResource

from .utils import (
    validate_email, validate_username,
    parser_factory, String,
    send_verification
)

class Register(BaseResource):  # type: ignore
    path = "/register"

    @classmethod
    def post(cls) -> tuple[dict[str, str | Any], HTTPStatus]:
        parser = parser_factory(
            {
                "username": (String[4, 16], validate_username),
                "password": String[8, 16],
                "email": (String[5, 120], validate_email),
            }
        )
        args = parser.parse_args()
        
        try:
            cls.logger.info("create user object")
            new_user = UserModel(
                args.email,
                args.username,
                args.password
            )
            cls.logger.info("send verification email")
            send_verification(new_user)
            
            access_token = create_access_token(identity=new_user.json())

            return {
                "user": new_user.json(),
                "access_token": access_token
            }, HTTPStatus.CREATED

        except exc.User.AlreadyExists as e:
            return {
                "message": "User already exists"
            }, HTTPStatus.CONFLICT

        except exc.DBError as e:
            cls.logger.error(
                "Register error. Args:\n{username: %s, password: %s, email: %s}\nError: %s"
                % (args.username, args.password, args.email, e)
            )
            return {
                "message": "Internal database error"
            }, HTTPStatus.INTERNAL_SERVER_ERROR
