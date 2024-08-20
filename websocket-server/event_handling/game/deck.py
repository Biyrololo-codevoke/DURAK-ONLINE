import json

from .card import Card
from .game_logger import logger


class PlayerDeck:
    def __init__(self, cards: list[Card] = None):
        self._cards = cards or []
        self.count = cards and len(cards)
        self.diff = None

    def find_card(self, card: Card) -> Card | None:
        for _card in self._cards:
            if _card.value == card.value and _card.suit == card.suit:
                return True
        return False

    def get_card(self, suit: Card.Suites, value: int):
        eligible_cards = list(
            filter(
                lambda card: card.suit == suit and card.value == value,
                self._cards
            )
        )
        if not eligible_cards:
            return None
        else:
            return eligible_cards[0]

    def has_card(self, card: Card) -> bool:
        return bool(self.find_card(card))

    def add_card(self, card: Card) -> None:
        self._cards.append(card)

    def remove_card(self, card: Card) -> None:
        if not self.find_card(card):
            raise ValueError("Player has no card: " + str(card))
        index = -1
        for i, _card in enumerate(self._cards):
            if _card == card:
                index = i
                break
        self._cards.pop(index)

    def diff(self, cards: list[Card]) -> list[Card]:
        return list(filter(lambda card: not self.has_card(card), cards))

    def serialize(self) -> str:
        return json.dumps({
            "cards": [card.serialize() for card in self._cards]
        })
        
    def json(self) -> dict:
        return {
            "cards": [card.json() for card in self._cards]
        }        
    
    @staticmethod
    def deserialize(data):
        cards = []
        for card in data.get("cards"):
            cards.append(
                Card(**card)
            )
        return PlayerDeck(cards)

    def __str__(self):
        return '[' + " ".join([str(card) for card in self._cards]) + ']'
        
    def __len__(self):
        return len(self._cards)
        