from __future__ import annotations
from typing import Type

from sqlalchemy import Column, Integer, String, Boolean, Enum, ARRAY
from sqlalchemy.orm.exc import NoResultFound

from .user_model import UserModel
from .enum_types import RoomTypes
from .db import retry_on_exception, BaseModel, session


class RoomExceptions:
    class NotFound(Exception):
        pass

    class IsFull(Exception):
        pass


class RoomModel(BaseModel):
    __tablename__ = "room"

    id = Column(Integer, primary_key=True)
    reward = Column(Integer, default=100)
    _players_count = Column(Integer, default=2)
    _cards_count = Column(Enum(RoomTypes.CardsCount), default=RoomTypes.CardsCount.SMALL)
    _speed = Column(Enum(RoomTypes.Speed), default=RoomTypes.Speed.MEDIUM)
    _game_type = Column(Enum(RoomTypes.GameType), default=RoomTypes.GameType.THROW)
    _throw_type = Column(Enum(RoomTypes.ThrowType), default=RoomTypes.ThrowType.ALL)
    _win_type = Column(Enum(RoomTypes.WinType), default=RoomTypes.WinType.CLASSIC)
    _game_state = Column(Enum(RoomTypes.RoomState), default=RoomTypes.RoomState, nullable=True)
    private = Column(Boolean, default=False)
    password = Column(String, nullable=True)
    game_obj = Column(String, nullable=True)
    _user_ids = Column(ARRAY(Integer), default=[])
    
    @classmethod
    def current_list(cls) -> dict[int, list[int]]:
        data = dict()

        for room in session.query(cls).filter_by(game_state=RoomTypes.RoomState.OPEN).all():
            data[room.id] = room.user_ids

        return data

    @classmethod
    def get_by_id(cls, room_id: int) -> Type[RoomModel]:
        try:
            return session.query(cls).filter_by(id=room_id).one()
        except NoResultFound as e:
            raise RoomExceptions.NotFound from e

    def add_player(self, user_id: int) -> None:
        if self.user_ids is None:
            self.user_ids = []

        if not self.check_available():
            raise RoomExceptions.IsFull

        new_user_ids = self.user_ids + [user_id]
        self.user_ids = new_user_ids
        self.save()

    def check_password(self, password: str) -> bool:
        return self.password == password

    def check_available(self) -> bool:
        return len(self.user_ids) < self._players_count

    @property
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
    def players_count(self) -> int:
        return self._players_count

    @players_count.setter
    def players_count(self, value: int) -> None:
        if not (2 <= value <= 6):
            raise ValueError("players count must be in range [2, 6]")
        self._players_count = value

    @property
    def cards_count(self) -> int:
        return self._cards_count.value

    @cards_count.setter
    def cards_count(self, value: RoomTypes.CardsCount) -> None:
        self._cards_count = RoomTypes.CardsCount(value)

    @property
    def speed(self) -> int:
        return self._speed.value

    @speed.setter
    def speed(self, value: RoomTypes.Speed) -> None:
        self._speed = RoomTypes.Speed(value)

    @property
    def game_type(self) -> str:
        return self._game_type.value

    @game_type.setter
    def game_type(self, value: RoomTypes.GameType) -> None:
        self._game_type = RoomTypes.GameType(value)
        
    @property
    def game_state(self) -> str:
        return self._game_state.value
    
    @game_state.setter
    def game_state(self, value: RoomTypes.RoomState) -> None:
        self._game_state = RoomTypes.RoomState(value)
        self.save()

    @property
    def throw_type(self) -> str:
        return self._throw_type.value

    @throw_type.setter
    def throw_type(self, value: RoomTypes.ThrowType) -> None:
        self._throw_type = RoomTypes.ThrowType(value)

    @property
    def win_type(self) -> str:
        return self._win_type.value

    @win_type.setter
    def win_type(self, value: RoomTypes.WinType) -> None:
        self._win_type = RoomTypes.WinType(value)
