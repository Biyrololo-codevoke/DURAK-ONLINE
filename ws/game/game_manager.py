import random
from typing import List, Optional
from .game_state import GameState
from .game_config import GameConfig
from .card import Card
from .player import Player
from .game_timer import GameTimer
from collections import deque
from ..models.mongodb import mongodb

class GameManager:
    """Manages game flow and operations."""
    
    def __init__(self, config: GameConfig):
        self.config = config
        self.state = GameState()
        self.state.initialize_players(config.players_count)
        self.move_id = 0
        self.timer = GameTimer()

    async def save_state(self):
        """Save current game state to MongoDB."""
        game_state = self.get_game_state()
        await mongodb.save_game_state(self.config.id, game_state)

    @classmethod
    async def load_from_mongodb(cls, config_id: str) -> Optional['GameManager']:
        """Load game state from MongoDB and create GameManager instance."""
        game_state = await mongodb.load_game_state(config_id)
        if game_state:
            manager = cls(GameConfig(config_id))
            manager.state = GameState.from_dict(game_state)
            manager.move_id = game_state.get("move_id", 0)
            return manager
        return None

    def start_game(self) -> None:
        """Initialize and start a new game."""
        self._initialize_deck()
        self._deal_initial_cards()
        self._choose_first_player()
        self._setup_next_round()

    def _initialize_deck(self) -> None:
        """Create and initialize the game deck."""
        self.state.deck = Card.make_deck(self.config.deck_size)
        self.state.set_trump_card(self.state.deck[0])

    def _deal_initial_cards(self) -> None:
        """Deal initial cards to all players."""
        cards_per_player = 6
        for player in self.state.players:
            if player:
                player.cards.extend(self.state.deck[1:cards_per_player + 1])
                self.state.deck = self.state.deck[cards_per_player + 1:]

    def _choose_first_player(self) -> None:
        """Randomly select the first player."""
        self.state.players_deque = deque(self.state.players)
        self.state.players_deque.rotate(random.randint(0, len(self.state.players) - 1))

    def _setup_next_round(self) -> None:
        """Setup the game state for the next round."""
        self.state.board.clear()
        self.state.passed_players.clear()
        self.state.player_taked = False
        self.state.is_bitten = False
        
        # Set new attacker and victim
        self.state.attacker_player = self.state.players_deque[0]
        self.state.victim_player = self.state.players_deque[1]
        self.state.throwing_players = [self.state.attacker_player]
        self.state.can_throw = True
        self.move_id += 1
        
        # Deal cards if needed
        self._deal_cards()
        
        # Start timer for the victim player
        self.timer.reset_timer(
            self.config.id,
            self.state.victim_player.id,
            self.handle_timeout
        )

    async def handle_timeout(self, room_id: int, player_id: int):
        """Handle player timeout."""
        self.state.is_end = True
        self.state.timeout_player_id = player_id
        await self.save_state()
        return {
            "event": "game_over",
            "reason": "timeout",
            "loser_id": player_id
        }

    def make_move(self, player: Player, card: Card) -> bool:
        """Process a player's move."""
        if not self._is_valid_move(player, card):
            return False

        # Reset timer for the next player
        next_player = self.state.victim_player if self._is_attack_move(player) else self._get_next_attacker()
        self.timer.reset_timer(
            self.config.id,
            next_player.id,
            self.handle_timeout
        )

        if self._is_attack_move(player):
            return self._process_attack(player, card)
        else:
            return self._process_defense(player, card)

    def _is_valid_move(self, player: Player, card: Card) -> bool:
        """Check if the move is valid according to game rules."""
        if card not in player.cards:
            return False
        if player not in [self.state.attacker_player, self.state.victim_player]:
            return False
        return True

    def _is_attack_move(self, player: Player) -> bool:
        """Determine if the current move is an attack."""
        return player == self.state.attacker_player

    def _process_attack(self, player: Player, card: Card) -> bool:
        """Process an attack move."""
        if not self.state.board.can_add_attack_card(card):
            return False
        
        self.state.board.add_attack_card(card)
        player.cards.remove(card)
        await self.save_state()
        return True

    def _process_defense(self, player: Player, card: Card) -> bool:
        """Process a defense move."""
        if not self.state.board.can_add_defense_card(card):
            return False
        
        self.state.board.add_defense_card(card)
        player.cards.remove(card)
        self.state.is_bitten = True
        await self.save_state()
        return True

    def _get_next_attacker(self) -> Player:
        """Get the next attacking player."""
        current_idx = self.state.players_deque.index(self.state.attacker_player)
        return self.state.players_deque[(current_idx + 1) % len(self.state.players_deque)]

    def end_round(self) -> None:
        """End the current round and prepare for the next one."""
        self._deal_cards()
        self._update_player_order()
        self._setup_next_round()

    def _deal_cards(self) -> None:
        """Deal cards to players who need them."""
        for player in self.state.players:
            while len(player.cards) < 6 and self.state.deck:
                player.cards.append(self.state.deck.pop(0))

    def _update_player_order(self) -> None:
        """Update the order of players for the next round."""
        if self.state.is_bitten:
            self.state.players_deque.rotate(-1)
        else:
            self.state.players_deque.rotate(-2)

    def handle_take_cards(self, player: Player) -> bool:
        """Handle player taking cards from the board."""
        if player.id != self.state.victim_player.id:
            return False
            
        # Add all cards from board to player's hand
        for card in self.state.board.attack_cards:
            player.cards.append(card)
        for card in self.state.board.defense_cards.values():
            player.cards.append(card)
            
        # Clear the board
        self.state.board.clear()
        
        # Mark that player took cards
        self.state.player_taked = True
        
        # Skip player's next turn by rotating deque twice
        self.state.players_deque.rotate(-2)
        
        # Setup next round
        self._setup_next_round()
        
        await self.save_state()
        return True

    def get_game_state(self) -> dict:
        """Return the current game state in a format suitable for clients."""
        return {
            "move_id": self.move_id,
            "trump_suit": self.state.trump_suit,
            "deck_size": len(self.state.deck),
            "board": self.state.board.to_dict(),
            "players": [p.to_dict() if p else None for p in self.state.players],
            "current_attacker": self.state.attacker_player.id if self.state.attacker_player else None,
            "current_defender": self.state.victim_player.id if self.state.victim_player else None,
            "can_throw": self.state.can_throw,
            "is_end": self.state.is_end
        }

    async def handle_disconnect(self, player_id: str) -> Optional[dict]:
        """
        Handle player disconnect. Returns game over event if player should be eliminated.
        """
        should_eliminate = self.state.register_disconnect(player_id)
        
        if should_eliminate:
            # Find the player object
            player = next((p for p in self.state.players if p.id == player_id), None)
            if player:
                player.is_loser = True
                
            # If it was this player's turn, move to next player
            if (self.state.victim_player and self.state.victim_player.id == player_id) or \
               (self.state.attacker_player and self.state.attacker_player.id == player_id):
                self._setup_next_round()
                
            await self.save_state()
            return {
                "event": "game_over",
                "reason": "disconnect_limit",
                "eliminated_player": player_id
            }
        return None
        
    async def handle_reconnect(self, player_id: str) -> None:
        """
        Handle player reconnect.
        """
        self.state.register_reconnect(player_id)
        await self.save_state()
