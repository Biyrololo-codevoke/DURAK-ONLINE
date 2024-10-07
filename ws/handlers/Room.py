from uuid import uuid4

from dataclasses import dataclass
from typing import Literal
from .User import User
        

@dataclass
class RoomConfig:
    id: int
    reward: int = 100
    speed: Literal[1, 2] = 1
    players_count: Literal[2, 3, 4, 5, 6] = 2
    cards_count: Literal[24, 36, 52] = 36
    game_type: Literal["throw", "translate"] = "throw"
    win_type: Literal["classic", "draw"] = "classic"
    throw_type: Literal["all", "neighborhood"] = "all"


class Room:
    def __init__(self, room_id: str, room_config: RoomConfig, private: bool = False, password: str = None):
        self.id = room_id
        self.config = room_config
        self.state = "waiting"
        self.players = set()
        self.private = private
        self.password = password
        self.auth_keys = set()
        self.recaovery_keys = dict()

    def _add_player(self, player: User):
        self.players.add(player)

    def _remove_player(self, player: User):
        self.players.remove(player)
        
    def _generate_auth_key(self):
        key = uuid4().hex
        self.auth_keys.add(key)
        return key
    
    def _generate_recovery_key(self, player: User):
        key1 = uuid4().hex
        key2 = uuid4().hex
        key3 = uuid4().hex
        self.recovery_keys[player.id] = [key1, key2, key3]
        return key1, key2, key3

    def add_player(self, player: User, password: str = None) -> tuple[bool, str]:
        if self.state != "waiting":
            return False, "Room is already started"
        if self.private and password != self.password:
            return False, "Wrong password"
        if len(self.players) >= self.config.players_count:
            return False, "Room is full"
        
        auth_key = self._generate_auth_key()
        return True, auth_key

    def connect_player(self, player: User, auth_key: str):
        if auth_key not in self.auth_keys:
            return False, "Invalid auth key"
        
        if self.state != "waiting":
            return False, "Room is already started"

        if player.id in self.players:
            return False, "Player already in the room"
        
        self._add_player(player)
        rkeys = self._generate_recovery_key(player)
        return True, rkeys
    
    def disconnect_player(self, player: User):
        if player.id not in self.players:
            return False, "Player not in the room"
        
        self._remove_player(player)
        return True
    
    def reconnect_player(self, player: User, rkey: str):
        if self.recaovery_keys[player.id] and rkey not in self.recovery_keys[player.id]:
            return False, "Invalid recovery key"
        elif not self.recaovery_keys[player.id]:
            return False, "Player lost all tries"
        
        self._add_player(player)
        self._recovery_keys[player.id].remove(rkey)
        return True
    
    
    def __iter__(self):
        return iter(self.players)
