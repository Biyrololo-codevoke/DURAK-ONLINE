from __future__ import annotations

import json
import random
from typing import Literal, TYPE_CHECKING
from collections import deque

from .game_board import GameBoard
from .card import Card
from .player import Player
from .game_logger import logger


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

        # config
        self.id = id
        self.reward = reward
        self.speed = speed
        self.players_count = players_count
        self.deck_size = deck_size
        self.game_mode = game_mode
        self.win_type = win_type
        self.throw_mode = throw_mode
        
        # payload
        self.deck = None
        self.players_deque = None
        self.players = [None] * players_count
        self.last_card = None
        
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
        
        self.can_throw = False
        self.is_end = False
        self.is_bitten = False
        self.player_taked = False
        self.passed_players = []
        self.victim_player = None
        self.attacker_player = None
        self.throwing_players = []
        self.pl_hst = []
        self.place = 1
        self.rate = {}
        
    def get_config(self):
        return {
            "reward": self.reward,
            "players_count": self.players_count,
            "cards_count": self.deck_size,
            "speed": self.speed,
            "game_mode": self.game_mode,
            "throw_mode": self.throw_mode,
            "win_type": self.win_type,
        }

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
        self.next()
        
    def choose_first_player(self):
        self.players_deque = deque(self.players)
        self.players_deque.rotate(
            random.randint(0, 999)
        )
        
    def next(self):
        self.players_deque.rotate(1)
        
        if self.player_taked and self.players_count == 2:
            self.players_deque.rotate(1)
        
        self.victim_player = self.players_deque[-1]
        self.attacker_player = self.players_deque[0]
        
        if self.throw_mode == "all":
            self.throwing_players = list(self.players_deque)
        else:
            self.throwing_players = list(self.players_deque)[1:-2]
 
        if self.victim_player in self.throwing_players:
            self.throwing_players.remove(self.victim_player)

        if self.attacker_player in self.throwing_players:
            self.throwing_players.remove(self.attacker_player)
        
        self.passed_players = []
        self.throw_players_in_time_id = [self.attacker_player.id, self.victim_player.id]
        self.player_taked = False
        self.is_bitten = False
        self.can_throw = False
        self.is_end = False
        self.pl_hst = [self.attacker_player]

    def deal_cards(self):
        for _ in range(6):
            for player in self.players:
                card = self.deck.pop()
                player.deck.add_card(card)

    def join_player(self, player: 'Player'):
        len_pl = len([x for x in self.players if x is not None])
        if len_pl < self.players_count:
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

    def get_player(self, _id: int):
        for player in self.players:
            if player:
                if int(player.id) == int(_id):
                    return player
                else:
                    logger.info(f"{player.id} != {_id}")

    def player_passed(self, player_id):
        self.passed_players.append(player_id)
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
    
        if (self.is_bitten and len(self.throwing_players) == len(self.passed_players)) or \
                (self.is_bitten and len(self.throwing_players) == 1) or \
                    (self.player_taked and len(self.throwing_players)+1 == len(self.passed_players)):
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
        else:
            logger.info(f"ПИЗДЕЦ! {self.is_bitten=}; {self.player_taked=};")
            return False, cards

    def update_pl_hst(self, player):
        if player in self.pl_hst:
           self.pl_hst.remove(player)
        self.pl_hst.append(player)

    def check_winner(self):
        winners = []

        for player in self.pl_hst:
            if player.deck.__len__() == 0 and len(self.deck) == 0:
                winners.append((player, self.place, self.calc_rewards(self.place)))
                self.rate[self.place] = player.id
                self.remove_player_from_deque(player.id)
                self.place += 1

        return winners
    
    def remove_player_from_deque(self, player_id):
        self.player_queue = deque(
            [player 
             for player in self.players_deque 
             if player.id != player_id
             ]
        )
    
    def calc_rewards(self, place: int):
        reward_coef = {
            6: { 1: 0.38, 2: 0.21, 3: 0.16, 4: 0.12, 5: 0.03 },
            5: { 1: 0.40, 2: 0.25, 3: 0.18, 4: 0.7 },
            4: { 1: 0.48, 2: 0.28, 3: 0.14 },
            3: { 1: 0.60, 2: 0.30 },
            2: { 1: 0.90 }
        }
        return int(self.reward * reward_coef[self.players_count][place])
    
    def is_total_end(self):
        return self.place == self.players_count

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
                "players": [player.serialize() for player in self.players],
                "player_deque": [player.serialize() for player in list(self.players_deque)]
            },
            "state": {
                "can_throw": self.can_throw,
                "is_end": self.is_end,
                "is_bitten": self.is_bitten,
                "player_taked": self.player_taked,
                "passed_players": self.passed_players,
                "victim_player": self.victim_player.serialize(),
                "attacker_player": self.attacker_player.serialize(),
                "throw_players_in_time_id": self.throw_players_in_time_id,
                "throwing_players": [player.serialize() for player in self.throwing_players],
                "passed_players": self.passed_players,
                "pl_hst": [player.serialize() for player in self.pl_hst],
                "place": self.place,
                "rate": self.rate
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
        
        # payload
        payload = data.get("payload")
        
        players_data = payload.get("players")
        game.players = [
            Player.deserialize(player, game)
            for player in players_data
        ]
        
        game.players_deque = deque([
            Player.deserialize(player, game)
            for player in payload.get("player_deque")
        ]) if payload.get("player_deque") else deque(game.players)
        
        # states
        states = data.get("state")
        
        game.place = states.get("place", 1)
        game.can_throw = states.get("can_throw", False)
        game.is_end = states.get("is_end", False)
        game.is_bitten = states.get("is_bitten", False)
        game.player_taked = states.get("player_taked", False)
        game.passed_players = states.get("passed_players", [])
        game.victim_player = Player.deserialize(states.get("victim_player"), game) if states.get("victim_player") else None
        game.attacker_player = Player.deserialize(states.get("attacker_player"), game) if states.get("attacker_player") else None
        game.throwing_players = [
            Player.deserialize(player, game) 
            for player in states.get("throwing_players", [])
        ] if states.get("throwing_players") else []
        game.throw_players_in_time_id = states.get("throw_players_in_time_id", [])
        
        game.passed_players = states.get("passed_players", [])
        game.pl_hst = [
            Player.deserialize(player, game) 
            for player in states.get("pl_hst", [])
        ] if states.get("pl_hst") else []
        game.rate = states.get("rate")
        
        return game
