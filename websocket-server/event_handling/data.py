from __future__ import annotations

import json
import time
import asyncio
from dataclasses import dataclass, field
from uuid import uuid4

from websockets import WebSocketServerProtocol as WS
import websockets

from models import RoomModel, UserModel
from websocket_logger import logger

from .game import Game, Card, Player as GamePlayer
from .utils import model_to_room
from .events import router


JWT_SECRET_KEY = "OIDU#H-298ghd-7G@#DF^))GV31286f)D^#FV^2f06f6b-!%R@R^@!1263"


@dataclass
class Player:
    id: int
    type: str  # LIST | ROOM
    socket: WS
    key: str | None = field(default_factory=None)
    room_id: int | None = field(default_factory=None)
    accepted: bool | None = field(default_factory=bool)

    def send(self, payload):
        if not self.socket.state == websockets.protocol.State.CLOSED:
            asyncio.create_task(
                self.socket.send(
                    json.dumps(payload)
                )
            )

    def broadcast_room(self, payload):
        for player in player_list:
            if player.room_id == self.room_id and player.id != self.id:
                player.send(payload)

    def disconnect(self):
        self.socket.close()

    def serialize(self):
        return { "id": self.id }

    @classmethod
    def deserialize(self, data) -> Player | None:
        id = data["id"]
        for player in player_list:
            if player.id == id:
                return player
        return None


class FastRoom:
    # spped up pattern
    _rooms: dict[int, RoomModel] = dict()

    @classmethod
    def get_room(cls, id: int) -> Game | None:
        return RoomModel.get_by_id(id)
        # if id in cls._rooms.keys():
        #     return cls._rooms[id]
        # else:
        #     model = RoomModel.get_by_id(id)
        #     if model:
        #         cls._rooms[id] = model
        #         return model
        #     else:
        #         return None
    
    @classmethod
    def update_room(cls, room_id: int, game: Game):
        if room_id in cls._rooms.keys():
            room = cls._rooms[room_id]
            room.game_obj = game.serialize()
            room.save()
        else:
            model = RoomModel.get_by_id(room_id)
            model.game_obj = game.serialize()
            model.save()


player_list: list[Player] = list()
game_list: dict[int, Game] = dict()
room_keys: dict[int, list[str]] = dict()

get_player: callable[int, Player]       = lambda id: filter(lambda x: x.id == id, player_list).__next__()
get_room:   callable[int, list[Player]] = lambda id: list(filter(lambda x: x.room_id == id, player_list))



@dataclass 
class Room:
    id: int
    players: list[Player] = field(default_factory=list)
    access_keys: dict[int, str] = field(default_factory=dict)
    wait_accept: bool = field(default_factory=bool)

    def __post_init__(self):
        global room_list

    def send(self, payload):
        for player in self.players:
            player.send(paylaod)

    def take_key(self, player: Player, password: str):
        global room_keys

        room_model = FastRoom.get_room(self.id)
        player_model = UserModel.get_by_id(player.id)

        if not room_model.check_password(password):
            user.send({
                "status": "error",
                "message": "invalid password"
            })
            return user.disconnect()
            
        if room_model.reward > player_model.money:
            player.send({
                "status": "error",
                "message": "not enough money"
            })
            return player.disconnect()

        if player.id in room_model.user_ids:
            player.send({
                "status": "error",
                "message": "you are already in this room"
            })
            return player.disconnect()

        if not room_model.check_available():
            player.send({
                "status": "error",
                "message": "room is full"
            })
            return player.disconnect()

        key = f"{uuid4().hex}_{player.id}"
        self.access_keys[player.id] = key

        if not room_keys.get(self.id):
            room_keys[self.id] = list()
        room_keys[self.id].append(key)

        player.send({
            "status": "success",
            "key": key
        })

    def join_room(self, player: Player):
        global room_list

        if player.id not in self.access_keys.keys():
            player.send({
                "status": "error",
                "message": "you can't join this room."
            })
            player.disconnect()
        elif self.access_keys.get(player.id) != player.key:
            player.send({
                "status": "error",
                "message": "invalid code"
            })
            player.disconnect()
        else:
            player.send({
                "status": "success",
                "message": "joined room"
            })
            player.broadcast_room({
                "event": "player_connected",
                "player_id": player.id
            })
            self.players.append(player)
            room_model = FastRoom.get_room(self.id)
            room_model.add_player(player.id)
            room_model.save()
            room_list.update_room()

            if not room_model.check_available():
                room_list.remove_room(self.id)
                accept_start()
            else:
                logger.info(f"model: {room_model}; {len(room_model.user_ids)} / {room_model._players_count}")

    def accept_start(self):
        self.wait_accept = True
        for player in self.players:
            player.send({
                "event": "accept_start"
            })
        logger.info(f"room ready for accepting;")

    def do_accept(self, player: Player):
        if not self.wait_accept:
            player.send({
                "status": "error",
                "message": "game not started"
            })
            return
        
        player.accepted = True
        player.send({
            "status": "success"
        })

        if all([player.accepted for player in self.players]):
            self.start_game()

    def start_game(self):
        room = FastRoom.get_room(self.id)
        game = Game(
            id            = room.id,
            reward        = room.reward,
            speed         = room.speed,
            players_count = room.players_count,
            deck_size     = room.cards_count,
            game_mode     = room.game_type,
            win_type      = room.win_type,
            throw_mode    = room.throw_type
        )
        for player in self.players:
            game.join_player(
                GamePlayer(id=player.id)
            )

        room.game_state = "in_game"
        FastRoom.update_room(self.id, room)

        self.send({
            "event": "game_init",
            "last_card": game.last_card.json()
        })

        for game_player in game.players:
            payload = {
                "event": "init_deck",
                "deck": player.deck.json()
            }
            get_player(game_player.id).send(payload)

        self.send({
            "event": "next",
            "walking_player": game.attacker_player.id,
            "victim_player": game.victim_player.id,
            "throwing_players": [player.id for player in game.throwing_players]
        })

    @property
    def count(self):
        return self.players.__len__()


class RoomList:
    def __init__(self):
        self.room_list: dict[int, Room] = dict()
        self.followers: list[Player]    = list()

    def add_room(self, room_id: int, author_id: int = None, author_key: str = None):
        global room_keys
        list_room = Room(id=room_id)
        list_room.access_keys[author_id] = author_key
        room_keys[room_id] = [author_key]
        self.room_list[list_room.id] = list_room
        self.notify()
        logger.info(f"room {room_id} created;")
        logger.info(f"list: {self.room_list}")

    def recover_room(self, room: Room):
        self.room_list[room.id] = room
        self.notify()

    def update_room(self):
        self.notify()

    def remove_room(self, room_id: int):
        del self.room_list[room_id]
        self.notify()

    def subscribe(self, player: Player):
        player.send(self.json())
        self.followers.append(player)
        logger.info(f"player {player.id} subscribed to room list;")

    def unsubscribe(self, player: Player):
        self.followers.remove(player)
        logger.info(f"player {player.id} unsubscribed from room list;")

    def notify(self):
        room_list_json = self.json()
        logger.info(f"notify followers: {self.followers}")
        
        for player in self.followers:
            player.send(room_list_json)
            logger.info(f"player {player.id} notified about room list;")
    
    def json(self):
        return {
            "rooms": {
                id: room.count for id, room in self.room_list.items()
            }
        }


room_list = RoomList()
