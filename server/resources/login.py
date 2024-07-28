from typing import Any
from http import HTTPStatus

from flask_jwt_extended import create_access_token

from ..models import UserModel, Exceptions as exc

from .api import BaseResource
from .utils.parser import parser_factory, String


class Login(BaseResource):  # type: ignore
    path = "/login"

    @classmethod
    def post(cls) -> tuple[dict[str, str | Any], HTTPStatus]:
        parser = parser_factory(
            {
                "email": String[120],
                "password": String[4, 16],
            }
        )
        args = parser.parse_args()

        try:
            user = UserModel.auth(args.email, args.password)
            access_token = create_access_token(identity=user.json())

            return {"user": user.json(), "access_token": access_token}, HTTPStatus.OK

        except exc.User.NotFound:
            return {"message": "User is not registered"}, HTTPStatus.NOT_FOUND

        except exc.User.IncorrectPassword:
            return {"message": "Incorrect login or password"}, HTTPStatus.BAD_REQUEST

        except exc.DBError as e:
            cls.logger.error(
                "Login error. Args:\n{email: %s, password: %s}\nError: %s"
                % (args.email, args.password, e)
            )
            return {"message": "Internal server error"}, HTTPStatus.INTERNAL_SERVER_ERROR
