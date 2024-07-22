from .UserModel import UserExceptions as _user
from .RoomModel import RoomExceptions as _room


class Exceptions(BaseException):
    class User(_user):
        pass

    class Room(_room):
        pass
