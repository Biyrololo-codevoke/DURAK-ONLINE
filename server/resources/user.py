from http import HTTPStatus

from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..models import UserModel, Exceptions as exc

from .api import BaseResource
from .utils import (
    validate_username, validate_email,
    parser_factory, String,
    verified_user, send_verification
)


class User(BaseResource):
    path = "/user"

    @classmethod
    def get(cls) -> tuple[dict, HTTPStatus]:
        user_id = request.args.get("id")
        try:
            user = UserModel.get_by_id(user_id)
            return {"user": user.json()}, HTTPStatus.OK

        except exc.User.NotFound:
            return {"error": "user not found"}, HTTPStatus.NOT_FOUND

        except exc.DBError as e:
            cls.logger.error(
                "User not found. Args:\n{user_id: %s}\nError: %s" % (user_id, e)
            )
            return {"error": "user not found"}, HTTPStatus.NOT_FOUND

    @classmethod
    @jwt_required()
    @verified_user
    def patch(cls) -> tuple[dict, HTTPStatus]:
        user_id = get_jwt_identity()["id"]
        cls.logger.info("id: %d" % user_id)
        parser = parser_factory(
            {
                "_username": (String[4, 16], validate_username),
                "_email": (String[120], validate_email),
            }
        )
        args = parser.parse_args()
        cls.logger.info("args: %s" % str(args))

        try:
            user = UserModel.get_by_id(user_id)
            cls.logger.info("user: %s" % str(user.json()))
            
            if args.username:
                user.username = args.username
            
            if args.email:
                user.email = args.email
                user.verified = False
                send_verification(user)

            user.save()

            return {"user": user.json()}, HTTPStatus.OK
        
        except exc.User.AlreadyExists:
            return {"error": "this email or username already taken"}, HTTPStatus.BAD_REQUEST

        except exc.User.NotFound:
            return {"error": "user not found"}, HTTPStatus.NOT_FOUND

        except exc.DBError as e:
            cls.logger.error(
                "User patch cause some error, Args:\n{user_id: %s}\nError: %s"
                % (user.id, e)
            )
            return {"error": "internal server error"}, HTTPStatus.INTERNAL_SERVER_ERROR
