from enum import Enum


class Room:
    class CardsCount(Enum):
        SMALL = 24
        MEDIUM = 48
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
