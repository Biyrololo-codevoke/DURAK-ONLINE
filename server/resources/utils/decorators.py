from typing import Callable, Any
from http import HTTPStatus

from flask import abort
from flask_jwt_extended import get_jwt_identity

from ...models import UserModel


def verified_user(func: Callable) -> Callable:
    def handler(*args, **kwargs) -> Any:
        user_data = get_jwt_identity()
        user = UserModel.get_by_id(user_data["id"])
        if user.verified:
            return func(*args, **kwargs)
        else:
            abort(HTTPStatus.FORBIDDEN, "You must be a verified to have access for it")

    return handler
