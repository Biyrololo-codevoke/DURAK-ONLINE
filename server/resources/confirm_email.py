from http import HTTPStatus

from flask_jwt_extended import jwt_required, get_jwt_identity

from ..models import UserModel, Exceptions as exc

from .api import BaseResource
from .utils import parser_factory, String


class ConfirmEmail(BaseResource):
    path = "/confirm_email"

    @classmethod
    @jwt_required()
    def post(cls) -> tuple[dict[str, int | str | bool | None], HTTPStatus]:
        args = parser_factory(
            {
                "code": String[6]
            }
        ).parse_args()
        payload = get_jwt_identity()

        try:
            user = UserModel.get_by_id(payload["id"])
            user.verify_user(args.code)

            return user.json(), HTTPStatus.OK

        except exc.VerifyCode.NotFound:
            return {"message": "Authorized user not found"}, HTTPStatus.NOT_FOUND

        except exc.VerifyCode.IncorrectCode:
            return {"message": "Incorrect code"}, HTTPStatus.BAD_REQUEST
