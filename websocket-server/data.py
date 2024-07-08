
JWT_SECRET_KEY = "OIDU#H-298ghd-7G@#DF^))GV31286f)D^#FV^2f06f6b-!%R@R^@!1263"

auth_sockets_id = list()  # [socket_id]
authed_sockets  = dict()  # {user_id: socket}
socket_user_id  = dict()  # {socket_id: user_id}


class RoomListObserver:
    def __init__(self, rooms: dict[int, int] = None, followers: list = None):
        self._rooms = rooms or dict()
        self._followers = followers or list()
        self.notifiy()
    
    def add_room(self, room_id: int, room_count: int):
        self._rooms[room_id] = room_count
        self.notify()

    def update_room(self, room_id: int, room_count: int = 1):
        self._rooms[room_id] = room_count
        self.notify()

    def remove_room(self, room_id):
        del self._rooms[room_id]
        self.notify()

    def get_rooms(self) -> dict[int, int]:
        return self._rooms
    
    def subscribe(self, callback):
        self._followers.append(callback)

    def notify(self):
        for callback in self._followers:
            callback(self.get_rooms())


room_list = RoomListObserver()
