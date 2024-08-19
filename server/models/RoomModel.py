from __future__ import annotations

from .UserModel import UserModel
from .db import db, BaseModel, retry_on_exception
from .enum_types import Room


class RoomExceptions:
    class NotFound(Exception):
        pass

    class IsFull(Exception):
        pass


class RoomModel(BaseModel):  # type: ignore
    __tablename__ = "room"

    id = db.Column(db.Integer, primary_key=True)
    reward = db.Column(db.Integer, default=100)
    _players_count = db.Column(db.Integer, default=2)
    _cards_count = db.Column(db.Enum(Room.CardsCount), default=Room.CardsCount.SMALL)
    _speed = db.Column(db.Enum(Room.Speed), default=Room.Speed.MEDIUM)
    _game_type = db.Column(db.Enum(Room.GameType), default=Room.GameType.THROW)
    _throw_type = db.Column(db.Enum(Room.ThrowType), default=Room.ThrowType.ALL)
    _win_type = db.Column(db.Enum(Room.WinType), default=Room.WinType.CLASSIC)
    _game_state = db.Column(db.Enum(Room.RoomState), default=Room.RoomState.OPEN, nullable=True)
    private = db.Column(db.Boolean, default=False)
    password = db.Column(db.String, nullable=True)
    game_obj = db.Column(db.String, nullable=True)
    _user_ids = db.Column(db.ARRAY(db.Integer), default=[])  # user ids

    def json(self) -> dict[str, int | bool | str]:
        return {
            "id": self.id,
            "name": self.name,
            "reward": self.reward,
            "players_count": self.players_count,
            "cards_count": self.cards_count,
            "speed": self.speed,
            "game_type": self.game_type,
            "throw_type": self.throw_type,
            "game_state": self._game_state.value,
            "win_type": self.win_type,
            "private": self.private,
            "user_ids": self.user_ids,
        }

    @classmethod
    @retry_on_exception(max_retries=1, delay=0.01)
    def get_by_id(cls, room_id: int) -> RoomModel:  # type: ignore
        room = cls.query.filter_by(id=room_id).first()
        if not room:
            raise RoomExceptions.NotFound
        return room

    @retry_on_exception(max_retries=3, delay=0.05)
    def add_player(self, user_id: int) -> None:
        if self.user_ids is None:
            self.user_ids = []

        if len(self.user_ids) >= self._players_count:
            raise RoomExceptions.IsFull

        self.user_ids.append(user_id)

    @retry_on_exception(max_retries=1, delay=0.01)
    def check_password(self, password: str) -> bool:
        return self.password == password

    @property
    def name(self) -> str:
        names = []
        if not self.user_ids:
            return None

        for user_id in self.user_ids:
            user_by_id = UserModel.get_by_id(user_id)
            names.append(user_by_id.username)
        return ", ".join(names)

    @property
    @retry_on_exception(max_retries=1, delay=0.01)
    def user_ids(self) -> list[int]:
        return self._user_ids

    @user_ids.setter
    def user_ids(self, value: list[int]) -> None:
        for user_id in value:
            user = UserModel.get_by_id(user_id)
            if not user:
                raise ValueError(f"User with id {user_id} not found")
        self._user_ids = value

    @property
    @retry_on_exception(max_retries=1, delay=0.01)
    def players_count(self) -> int:
        return self._players_count

    @players_count.setter
    def players_count(self, value: int) -> None:
        if not (2 <= value <= 6):
            raise ValueError("players count must be in range [2, 6]")
        self._players_count = value

    @property
    @retry_on_exception(max_retries=1, delay=0.01)
    def cards_count(self) -> int:
        return self._cards_count.value

    @cards_count.setter
    def cards_count(self, value: Room.CardsCount) -> None:
        self._cards_count = Room.CardsCount(value)

    @property
    @retry_on_exception(max_retries=1, delay=0.01)
    def speed(self) -> int:
        return self._speed.value

    @speed.setter
    def speed(self, value: Room.Speed) -> None:
        self._speed = Room.Speed(value)

    @property
    @retry_on_exception(max_retries=1, delay=0.01)
    def game_type(self) -> str:
        return self._game_type.value

    @game_type.setter
    def game_type(self, value: Room.GameType) -> None:
        self._game_type = Room.GameType(value)

    @property
    @retry_on_exception(max_retries=1, delay=0.01)
    def throw_type(self) -> str:
        return self._throw_type.value

    @throw_type.setter
    def throw_type(self, value: Room.ThrowType) -> None:
        self._throw_type = Room.ThrowType(value)

    @property
    @retry_on_exception(max_retries=1, delay=0.01)
    def win_type(self) -> str:
        return self._win_type.value

    @win_type.setter
    def win_type(self, value: Room.WinType) -> None:
        self._win_type = Room.WinType(value)
