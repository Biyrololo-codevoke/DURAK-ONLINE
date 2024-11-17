from __future__ import annotations

import json
import random
from typing import TypeAlias, Literal, get_args


class Card:
    Suites: TypeAlias = Literal["♠️", "♥️", "♣️", "♦️"]
    Deck_sizes: TypeAlias = Literal[52, 36, 24]

    def __init__(self, suit: Suites, value: int, is_trump=False):
        self.suit: Card.Suites = suit
        self.value: int = value
        self.is_trump: bool = is_trump

    @classmethod
    def make_deck(cls, size: Deck_sizes = 52) -> list[Card]:
        deck_min_card_value = {52: 2, 36: 6, 24: 9}[size]
        card_list = []

        for suit in get_args(cls.Suites):
            for value in range(deck_min_card_value, 15):
                card_list.append(Card(suit, value))
        random.shuffle(card_list)

        for card in card_list:
            card.is_trump = (card.suit == card_list[0].suit)

        return card_list

    def __str__(self) -> str:
        if 2 <= self.value <= 10:
            return str(self.value) + self.suit + ("!" if self.is_trump else ".")

        str_value = ["10", "Q", "V", "K", "T"][self.value-10]
        return str_value + self.suit + ("!" if self.is_trump else ".")

    def __gt__(self, other: Card) -> bool:
        if self.is_trump:
            if other.is_trump:
                return self.value > other.value
            else:
                return True
        else:
            if other.is_trump:
                return False
            else:
                return self.value > other.value

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Card):
            return NotImplemented
        return (other.suit == self.suit) and (other.value == self.value)

    @property
    def is_trump(self) -> bool:
        return self._is_trump

    @is_trump.setter
    def is_trump(self, trump: bool) -> None:
        self._is_trump = trump

    @property
    def suit(self) -> Suites:
        return self._suit

    @suit.setter
    def suit(self, suit: Suites) -> None:
        if suit in get_args(self.Suites):
            self._suit = suit
        else:
            raise ValueError("Suit must be " + str(self.Suites) + " type")

    @property
    def value(self) -> int:
        return self._value

    @value.setter
    def value(self, value: int) -> None:
        if 2 <= value <= 14:
            self._value = value
        else:
            raise ValueError("value must be Int[2, 14] type")

    def serialize(self) -> str:
        return json.dumps(self.json())
        
    def json(self) -> str:
        return {
            "suit": self.suit,
            "value": self.value,
            "is_trump": self.is_trump
        }

    @staticmethod
    def deserialize(raw_data) -> Card:
        card_data = json.loads(raw_data)
        
        return Card(
            suit=card_data.get("suit"),
            value=card_data.get("value"),
            is_trump=card_data.get("is_trump")
        )
