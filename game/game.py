from __future__ import annotations

import json
from typing import Literal, TYPE_CHECKING

from game_board import GameBoard
from card import Card

if TYPE_CHECKING:
    from player import Player


class Game:
    move_id = 0
    
    def __init__(
            self,
            id: int,
            reward: int = 100,
            speed: Literal[1, 2] = 1,
            players_count: Literal[2, 3, 4, 5, 6] = 2,
            deck_size: Literal[52, 44, 36] = 36,
            game_mode: Literal["throw", "transfer"] = "throw",
            win_type: Literal["classic", "draw"] = "classic",
            throw_mode: Literal["all", "neighbors"] = "all"):
        self.players = [None] * players_count
        self.last_card = None
        
        self.id = id
        self.reward = reward
        self.speed = speed
        self.players_count = players_count
        self.deck_size = deck_size
        self.game_mode = game_mode
        self.win_type = win_type
        self.throw_mode = throw_mode

    def make_game(self):
        self.beaten_cards = []
        self.board = GameBoard()
        
        # creating game deck by deck_size
        self.deck = Card.make_deck(self.deck_size)
        self.last_card = self.deck[0]
        self.trump_suit = self.last_card.suit
        
        for card in filter(lambda card: card.suit == self.trump_suit, self.deck):
            card.is_trump = True

        self.deal_cards()

    def deal_cards(self):
        for _ in range(6):
            for player in self.players:
                card = self.deck.pop()
                player.deck.add_card(card)

    def join_player(self, player: 'Player'):
        len_pl = len([x for x in self.players if x is not None])
        if len_pl < self.players_count:
            # try-except for code cleaning. 
            # if players < count, then in array will be guaranteed 
            # to be at list 1 None elem
            try:  
                free_place = self.players.index(None)
                self.players[free_place] = player
                player.set_game(self)
            except ValueError:
                raise ValueError("room is full")
        else:
            raise ValueError("room is full")
        
        if all(self.players):
            self.make_game()

    def __str__(self) -> str:
        s = "<GameObject\n"
        s += "   players: " + "; ".join([str(player) for player in self.players]) + "\n"
        if self.last_card:
            s += "   tramp: " + self.last_card.suit + "\n"
        return s

    def serialize(self) -> str:
        return json.dumps({
            "config": {
                "reward": self.reward,
                "speed": self.speed,
                "players_count": self.players_count,
                "desk_size": self.deck_size,
                "game_mode": self.game_mode,
                "win_type": self.win_type,
                "throw_mode": self.throw_mode
            },
            "game": {
                "last_card": self.last_card.__str__(),
                "deck": self.deck.serialize,
                "beaten_cards": [card.serialize() for card in self.beaten_cards],
                "board": self.board.serialize(),
                "trump_suit": self.trump_suit
            },
            "payload": {
                "players": [player.serialize() for player in self.players]
            }
        })
        
    @staticmethod
    def deserialize(raw_data: str) -> Game:
        data = json.loads(raw_data)
        config = data.get("config")
        
        game = Game(**config)
        
        game_data = data.get("game")
        game.last_card = Card.deserialize(game_data.get("last_card"))
        game.deck = [Card.deserialize(card) for card in game_data.get("deck")]
        game.beaten_cards = [Card.deserialize(card) for card in game_data.get("beaten_cards")]
        game.board = GameBoard.deserialize(game_data.get("board"))
        game.trump_suit = game_data.get("trump_suit")
        
        players_data = data.get("payload").get("players")
        game.players = [
            Player.deserialize(player)
            for player in players_data
        ]
        
        return game

