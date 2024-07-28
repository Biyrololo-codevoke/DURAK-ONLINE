import random
from string import digits

from ...models import UserModel, VerifyCodeModel

from .kafka import send_mail_letter


def send_verification(user: UserModel) -> None:
    code = "".join(random.choices(digits, k=6))

    user_verify = VerifyCodeModel(
        user_id = user.id, 
        code    = code
    )
    user_verify.save()

    send_mail_letter(
        name  = user.username,
        email = user.email,
        code  = user_verify.code
    )
