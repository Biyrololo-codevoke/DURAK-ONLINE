from __future__ import annotations

import json
from typing import TYPE_CHECKING

from deck import PlayerDeck
from card import Card

if TYPE_CHECKING:
    from game import Game


class Player:
    def __init__(self, user_id: int):
        self.id = user_id
        self.deck = PlayerDeck()
        
    def set_game(self, game: 'Game'):
        self.game = game
        
    def make_move(self, card_suit: Card.Suites, card_value: int):
        card = self.deck.get_card(card_suit, card_value)
        self.player_deck.remove(card)
    
    def __str__(self):
        return "<Player id=%d>" % self.id

    def serialize(self) -> str:
        return json.dumps({
            "user_id": self.user_id
        })
    
    @staticmethod
    def deserialize(raw_data) -> Player:
        data = json.loads(raw_data)
        return Player(user_id=data.get("user_id"))
