import random
from typing import Any
from string import digits
from http import HTTPStatus

from flask_jwt_extended import create_access_token

from ..models import UserModel, VerifyCodeModel, Exceptions as exc

from .api import BaseResource
from .utils.validators import validate_username, validate_email
from .utils.parser import parser_factory, String
from .utils.kafka import send_mail_letter


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
        
        code = "".join(random.choices(digits, k=6))
        
        try:
            new_user = UserModel(
                email=args.email,
                username=args.username,
                password=args.password
            )
            new_user.save()

            user_verify_code = VerifyCodeModel(user_id=new_user.id, code=code)
            user_verify_code.save()

            send_mail_letter(
                name=new_user.username, email=new_user.email, code=user_verify_code.code
            )
            
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
