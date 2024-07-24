import json
import time
from asyncio import gather
from uuid import uuid4

from models import RoomModel, Exceptions
from websocket_logger import logger



logger.info("start init data")

JWT_SECRET_KEY = "OIDU#H-298ghd-7G@#DF^))GV31286f)D^#FV^2f06f6b-!%R@R^@!1263"
socket_identity = dict()
user_socket = dict()

key_identity = dict()


class RoomListObserver:
    def __init__(self, rooms: dict[int, int] = None, followers: list = None):
        self._rooms = rooms or dict()
        self._rooms.update(
            self.load_from_db()
        )
        self.expired_join_keys = []
        self._rooms_join_keys = dict()
        
        self._followers = followers or list()
        self.notify()
        
    def load_from_db(self) -> dict[int, list[int]]:
        return RoomModel.current_list()
    
    def add_room(self, room_id: int, *, room_count: int = 1, author_id=None, key=None):
        self._rooms[room_id] = room_count
        self._rooms_join_keys[room_id] = []
        
        if author_id and key and key.startswith("athr"):
            self._rooms_join_keys[room_id].append({
                "key": key,
                "player_id": author_id,
                "time": int(round(time.time() * 1000)),
            })
            logger.info("create room and add author there")
        else:
            logger.info("create room")
        self.notify()

    def join_to_room(self, room_id, player_id, password = None) -> tuple[bool, str]:
        try:
            room = RoomModel.get_by_id(room_id)
            
            if not room.check_password(password):
                return False, "Incorrect password"

            if player_id in room.user_ids:
                return False, "Player already joined to room"

            players_in_room = len(room.user_ids)
            players_in_connection = len(self._rooms_join_keys.get(room_id))

            if not room.check_available():
                return False, "Room is full"

            if players_in_room + players_in_connection >= room.players_count:
                self._rooms_join_keys = sorted(self._rooms_join_keys[room_id], key=lambda x: x["time"])
                current_time = int(round(time.time() * 1000))

                if current_time - self._rooms_join_keys[-1]["time"] > 15 * 1000:
                    self.expired_join_keys.append(self._rooms_join_keys[-1]["key"])
                    del self._rooms_join_keys[room_id][-1]

                else:
                    return False, "Room is full"

            key = uuid4().hex

            self._rooms_join_keys[room_id].append({
                "key": key,
                "player_id": player_id,
                "time": int(round(time.time() * 1000)),
            })

            return True, key

        except Exceptions.Room.NotFound:
            return False, "Room not found"

    def connect_to_room(self, room_id: int, key: str) -> tuple[bool, str]:
        if room_id not in self._rooms_join_keys:
            return False, "Room not found"

        player_connection = list(filter(lambda x: x["key"] == key, self._rooms_join_keys[room_id]))[0]
        
        if not player_connection:
            if key in self.expired_join_keys:
                self.expired_join_keys.remove(key)
                return False, "token expired"
            else:
                return False, "key is incorrect"

        try:
            from .event_handlers import send_to_room
            
            RoomModel.add_player(player_connection)
            self._rooms_join_keys[room_id].remove(player_connection["player_id"])
            self._rooms[room_id].append(key_identity[key])
            send_to_room(room_id, {
                "event": "player_connected",
                "player_id": player_connection["player_id"],
            })
            self.update_room(room_id, len(self._rooms[room_id])+1)
            return True, "successfully connected"

        except Exceptions.Room.NotFound:
            return False, "Room not found"
        
        except Exceptions.Room.IsFull:
            return False, "Room is full"

    def update_room(self, room_id: int, room_count: int):
        self._rooms[room_id] = room_count
        self.notify()

    def remove_room(self, room_id):
        del self._rooms[room_id]
        self.notify()

    def get_rooms(self) -> dict[int, int]:
        return self._rooms
    
    def subscribe(self, follower):
        self._followers.append(follower)

    def notify(self):
        logger.info("new event! notify followers... (%s)" % ", ".join(
            [str(socket.remote_address) for socket in self._followers]
        ))
        tasks = []
        data = self.get_rooms()
        
        for follower in self._followers:
            tasks.append(
                send_data(follower, data)
            )
        gather(*tasks)


async def send_data(socket, payload):
    serialized = json.dumps(payload)
    await socket.send(serialized)


room_list = RoomListObserver()
