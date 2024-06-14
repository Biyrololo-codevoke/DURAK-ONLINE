from sqlalchemy.exc import SQLAlchemyError

from .RoomModel import RoomExceptions
from .UserModel import UserExceptions
from .VerifyCodeModel import VerifyExceptions


class Exceptions:
    class User(UserExceptions):
        pass

    class Room(RoomExceptions):
        pass

    class VerifyCode(VerifyExceptions):
        pass

    DBError = SQLAlchemyError
