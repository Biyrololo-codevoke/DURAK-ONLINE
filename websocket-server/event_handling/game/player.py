from __future__ import annotations

import json
from typing import TYPE_CHECKING

from .deck import PlayerDeck
from .card import Card
from .game_logger import logger

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
        return f"player [{self.id}] {str(self.deck)}"

    def serialize(self) -> str:
        return json.dumps({
            "user_id": self.id,
            "deck": self.deck.json()
        })
        
    def has_card(self, card: Card) -> bool:
        logger.info(f"try to find card {str(card)} in deck:{self.deck}")
        return self.deck.has_card(card)
    
    @staticmethod
    def deserialize(raw_data, game) -> Player:
        data = json.loads(raw_data)
        new_player = Player(data.get("user_id"))
        new_player.deck = PlayerDeck.deserialize(data.get("deck"))
        new_player.set_game(game)

        return new_player
