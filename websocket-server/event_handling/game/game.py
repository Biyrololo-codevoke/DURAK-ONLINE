from __future__ import annotations

import json
import random
from typing import Literal, TYPE_CHECKING
from collections import deque

from .game_board import GameBoard
from .card import Card
from .player import Player


class Game:
    move_id = 0
    
    def __init__(
            self,
            id: int,
            reward: int = 100,
            speed: Literal[1, 2] = 1,
            players_count: Literal[2, 3, 4, 5, 6] = 2,
            deck_size: Literal[24, 36, 52] = 36,
            game_mode: Literal["throw", "translate"] = "throw",
            win_type: Literal["classic", "draw"] = "classic",
            throw_mode: Literal["all", "neighborhood"] = "all"):
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
        self.deck = None
        self.players_deque = None
        
        # for game lite data
        self.passed_players = []
        self.player_taked = False
        self.is_bitten = False
        self.can_throw = False
        
        self.victim_player = None
        self.attacker_player = None
        self.throwing_players = None

        self.place = 1
        self.pl_hst = []


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
        self.choose_first_player()
        
    def choose_first_player(self):
        self.players_deque = deque(self.players)
        self.players_deque.rotate(
            random.randint(0, 999)
        )
        
        self.victim_player = self.players_deque[-1]
        self.attacker_player = self.players_deque[0]

        if self.throw_mode == "all":
            self.throwing_players = self.players
        else:
            self.throwing_players = [self.players_deque[1], self.players_deque[-2]]
        
    def next(self):
        self.players_deque.rotate(1)
        
        self.victim_player = self.players_deque[-1]
        self.attacker_player = self.players_deque[0]
        
        if self.throw_mode == "all":
            self.throwing_players = self.players_deque[1:-1]
        else:
            self.throwing_players = [self.players_deque[1], self.players_deque[-2]]
        
        self.passed_players = []
        self.player_taked = False
        self.is_bitten = False
        
        self.throw_players_in_time = [self.attacker_player, self.victim_player]

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

    def get_player(self, id: int):
        for player in self.players:
            if player and player.id == id:
                return player

    def player_passed(self, player_id):
        self.player_passed.append(player_id)
        self.check_state()
        
    def player_bito(self):
        self.is_bitten = True
        self.check_state()
        
    def player_took(self):
        self.player_taked = True
        self.check_state()
        
    def check_state(self):
        if self.is_bitten or self.player_taked:
            self.can_throw = True
        else:
            self.can_throw = False
    
        if self.is_bitten and len(self.throwing_players) == len(self.player_passed) or \
                self.player_taked and len(self.throwing_players)+1 == len(self.player_passed):
            self.is_end = True
        else:
            self.is_end = False
            
    def end(self):
        cards = self.board.take_all()
        
        if self.is_bitten:
            self.beaten_cards.extend(cards)
            return False, cards
            
        elif self.player_taked:
            for card in cards:
                self.victim_player.deck.add_card(card)
            return True, cards

    def update_pl_hst(self, player):
        if player in self.pl_hst:
           self.pl_hst.remove(player)
        self.pl_hst.append(player)

    def check_winner(self):
        winners = []

        for player in self.pl_hst:
            if player.deck.__len__() == 0 and len(self.deck) == 0:
                winners.append((player, self.place))
                self.place += 1
                
        return winners

    def __str__(self) -> str:
        s = "<GameObject\n"
        s += "   players: " + "; ".join([str(player) for player in self.players]) + "\n"
        if self.last_card:
            s += "   tramp: " + self.last_card.suit + "\n"
        return s

    def serialize(self) -> str:
        return json.dumps({
            "config": {
                "id": self.id,
                "reward": self.reward,
                "speed": self.speed,
                "players_count": self.players_count,
                "deck_size": self.deck_size,
                "game_mode": self.game_mode,
                "win_type": self.win_type,
                "throw_mode": self.throw_mode
            },
            "game": {
                "last_card": self.last_card.serialize(),
                "deck": [card.serialize() for card in self.deck],
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

