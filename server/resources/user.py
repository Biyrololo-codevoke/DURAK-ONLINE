from http import HTTPStatus

from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..models import UserModel, Exceptions as exc

from .api import BaseResource
from .utils import (
    parser_factory,
    String,
    verified_user,
    validate_username,
    validate_email,
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
        parser = parser_factory(
            {
                "_username": (String[4, 16], validate_username),
                "_email": (String[120], validate_email()),
            }
        )
        args = parser.parse_args()

        user = UserModel.get_by_id(get_jwt_identity()["id"])
        try:
            user.username = args.username or user.username
            user.email = args.email or user.email  # if None -> not changed
            user.save()
            return {"user": user.json()}, HTTPStatus.OK

        except exc.User.NotFound:
            return {"error": "user not found"}, HTTPStatus.NOT_FOUND

        except exc.DBError as e:
            cls.logger.error(
                "User patch cause some error, Args:\n{user_id: %s}\nError: %s"
                % (user.id, e)
            )
            return {"error": "internal server error"}, HTTPStatus.INTERNAL_SERVER_ERROR
