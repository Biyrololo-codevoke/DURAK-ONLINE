from .user_model import UserExceptions as _user
from .room_model import RoomExceptions as _room


class Exceptions(BaseException):
    class User(_user):
        pass

    class Room(_room):
        pass
