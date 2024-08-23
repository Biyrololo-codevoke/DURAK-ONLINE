from enum import Enum


class RoomTypes:
    class CardsCount(Enum):
        SMALL = 24
        MEDIUM = 36
        LARGE = 52

    class Speed(Enum):
        MEDIUM = 1
        FAST = 2

    class GameType(Enum):
        THROW = "throw"  # подкидной
        TRANSLATE = "translate"  # переводной

    class ThrowType(Enum):
        ALL = "all"  # все
        NEIGHBOURHOOD = "neighborhood"  # соседи

    class WinType(Enum):
        CLASSIC = "classic"  # классический
        DRAW = "draw"  # ничья
        
    class RoomState(Enum):
        OPEN = "open"
        IN_GAME = "in_game"
