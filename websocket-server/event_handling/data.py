import json
import time
import asyncio
from uuid import uuid4

from websockets import WebSocketServerProtocol as WS

from models import RoomModel, Exceptions
from websocket_logger import logger

from game import Game, Player


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
        self._room_connections = dict()
        
        self.expired_join_keys = []
        self._rooms_join_keys = dict()
        
        self._room_accepts = dict()
        
        self._followers = followers or list()
        self.notify()

    def load_from_db(self) -> dict[int, list[int]]:
        return RoomModel.current_list()

    def add_room(self, room_id: int, *, room_count: int = 1, author_id=None, key=None):
        self._rooms[room_id] = room_count
        self._room_connections[room_id] = []
        self._rooms_join_keys[room_id] = []
        self._room_accepts[room_id] = {
            "accepts": 0,
            "player_ids": [],
            "value": -1
        }

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

    def join_to_room(self, room_id, player_id, password=None) -> tuple[bool, str]:
        try:
            room = RoomModel.get_by_id(room_id)
            
            if not room.check_password(password):
                logger.info(f"password: {password} != {room.password}")
                return False, "Incorrect password"

            if player_id in room.user_ids:
                return False, "Player already joined to room"

            players_in_room = len(room.user_ids)
            players_in_connection = self._rooms_join_keys.get(room_id)
            player_conn_len = 0 if players_in_connection is None else len(players_in_connection)

            if not room.check_available():
                self._accepts_need = room.players_count
                return False, "Room is full"

            if players_in_room + player_conn_len > room.players_count:
                the_oldest_conn = sorted(
                    self._rooms_join_keys[room_id],
                    key=lambda x: x["time"],
                    reverse=True
                )[0]
                current_time = int(round(time.time() * 1000))

                if current_time - the_oldest_conn["time"] > 15 * 1000:
                    self.expired_join_keys.append(the_oldest_conn["key"])
                else:
                    return False, "Room is full"

            key = uuid4().hex + f"_{player_id}"

            if self._rooms_join_keys.get(room_id) is None:
                self._rooms_join_keys[room_id] = []

            self._rooms_join_keys[room_id].append({
                "key": key,
                "player_id": player_id,
                "time": int(round(time.time() * 1000)),
            })

            return True, key

        except Exceptions.Room.NotFound:
            return False, "Room not found"

    def connect_to_room(self, room_id: int, key: str) -> tuple[bool, str]:
        room_connections = self._rooms_join_keys.get(room_id)
        player_connection = list(filter(lambda x: x["key"] == key, room_connections))[0]

        if not player_connection:
            if key in self.expired_join_keys:
                self.expired_join_keys.remove(key)
                return False, "token expired"
            else:
                return False, "key is incorrect"

        try:
            player_id = int(key.split('_')[-1])
            
            room = RoomModel.get_by_id(room_id)             # add to db
            room.add_player(player_id)

            user_socket = key_identity[key]
            self._room_connections[room_id].append(user_socket)        # add socket to room socket group
            
            room_event = {                                   
                "event": "player_connected",
                "player_id": player_id
            }
            logger.info("send accept")
            send_to_room(room_id, room_event, id(user_socket))

            # update player_count in room_list
            self.update_room(room_id, len(room._user_ids)+1)
            
            self._rooms_join_keys[room_id].remove(          # clear from join keys
                player_connection
            )
            
            if not room.check_available():
                self._room_accepts[room_id]["accepts"] = room.players_count
                self.make_start(room_id)
            
            return True, "successfully connected"

        except Exceptions.Room.NotFound:
            return False, "Room not found"
        
        except Exceptions.Room.IsFull:
            return False, "Room is full"
        
    def make_start(self, room_id: int):
        self._room_accepts[room_id]['value'] = 0
        send_to_room(room_id, {
            "event": "make_start"
        })
        
    def accept_start(self, room_id: int, key: int):
        player_id = int(key.split('_')[-1])
        player_socket = key_identity[key]

        if not self._room_accepts.get(room_id):
            status, message =  False, "room not found"
        
        elif player_id in self._room_accepts[room_id]["player_ids"]:
            status, message =  False, "already accepted"
            
        elif self._room_accepts[room_id]["value"] == -1:
            status, message = False, "room isn't full"
        
        else:
            self._room_accepts[room_id]["value"] += 1
            self._room_accepts[room_id]["player_ids"].append(player_id)
            send_to_room(room_id, {
                "event": "accept",
                "player_id": player_id
            }, id(player_socket))
            status, message = True, "wrong answer | time limit error | memory error | accepted"

        if self._room_accepts[room_id]["value"] == self._room_accepts[room_id]["accepts"]:
            send_to_room(room_id, {
                "event": "start_game",
                "message": "huy!"*9
            })
            self.start_game(room_id)
        else:
            logger.info(f'{self._room_accepts[room_id]["value"]}/{self._room_accepts[room_id]["accepts"]}')

        return status, message
    
    def start_game(self, room_id: int):
        room = RoomModel.get_by_id(room_id)
        game = Game(
            id            = room.id,
            reward        = room.reward,
            speed         = room.speed,
            players_count = room.player_count,
            deck_size     = room.cards_count,
            game_mode     = room.game_type,
            win_type      = room.win_type,
            throw_mode    = room.throw_mode
        )

        for player_id in room.players_ids:
            player = Player(player_id)
            game.join_player(player)
        
        payload = game.serialize
        room.game_obj = payload
        
        del payload["game"]

    def update_room(self, room_id: int, room_count: int):
        self._rooms[room_id] = room_count
        self.notify()

    def remove_room(self, room_id):
        del self._rooms[room_id]
        self.notify()

    def get_rooms(self) -> dict[int, int]:
        return self._rooms
    
    def get_room_connections(self, room_id) -> list[WS]:
        return self._room_connections[room_id]
    
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
        asyncio.gather(*tasks)


async def send_data(socket, payload):
    serialized = json.dumps(payload)
    await socket.send(serialized)


def send_to_room(room_id: int, payload: dict, socket_id: int = None):
    from .event_handlers import send_to_room as _send
    asyncio.create_task(
        _send(room_id, payload, socket_id)
    )


room_list = RoomListObserver()
