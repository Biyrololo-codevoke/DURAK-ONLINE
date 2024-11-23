from dataclasses import dataclass, field
from collections import deque
from typing import Optional, List, Dict, Any
from .card import Card
from .player import Player
from .game_board import GameBoard

@dataclass
class GameState:
    """Represents the current state of a game session."""
    # Game components
    deck: List[Card] = field(default_factory=list)
    board: GameBoard = field(default_factory=GameBoard)
    players: List[Optional[Player]] = field(default_factory=list)
    players_deque: deque = field(default_factory=deque)
    
    # Current game state
    last_card: Optional[Card] = None
    trump_suit: Optional[str] = None
    beaten_cards: List[Card] = field(default_factory=list)
    
    # Player states
    passed_players: List[Player] = field(default_factory=list)
    victim_player: Optional[Player] = None
    attacker_player: Optional[Player] = None
    throwing_players: List[Player] = field(default_factory=list)
    
    # Game progress
    player_taked: bool = False
    is_bitten: bool = False
    can_throw: bool = False
    is_end: bool = False
    place: int = 1
    
    # Game history
    player_history: List[str] = field(default_factory=list)
    rate: dict = field(default_factory=dict)
    
    # Reconnect tracking
    reconnect_counts: dict = field(default_factory=dict)
    disconnected_players: set = field(default_factory=set)
    
    def initialize_players(self, count: int) -> None:
        """Initialize the players list with the specified count."""
        self.players = [None] * count
        
    def set_trump_card(self, card: Card) -> None:
        """Set the trump card and mark all cards of that suit as trump."""
        self.last_card = card
        self.trump_suit = card.suit
        for card in filter(lambda c: c.suit == self.trump_suit, self.deck):
            card.is_trump = True

    def register_disconnect(self, player_id: str) -> bool:
        """
        Register a player disconnect. Returns True if player should be eliminated.
        """
        self.disconnected_players.add(player_id)
        if player_id not in self.reconnect_counts:
            self.reconnect_counts[player_id] = 0
        self.reconnect_counts[player_id] += 1
        return self.reconnect_counts[player_id] > 3
        
    def register_reconnect(self, player_id: str) -> None:
        """
        Register a player reconnect.
        """
        if player_id in self.disconnected_players:
            self.disconnected_players.remove(player_id)
            
    def is_player_disconnected(self, player_id: str) -> bool:
        """
        Check if a player is currently disconnected.
        """
        return player_id in self.disconnected_players

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'GameState':
        """Create GameState instance from dictionary."""
        state = cls()
        
        # Restore basic properties
        state.trump_suit = data.get("trump_suit")
        state.can_throw = data.get("can_throw", True)
        state.is_bitten = data.get("is_bitten", False)
        state.player_taked = data.get("player_taked", False)
        state.is_end = data.get("is_end", False)
        state.timeout_player_id = data.get("timeout_player_id")
        
        # Restore players
        state.players = [Player.from_dict(p) for p in data.get("players", [])]
        if data.get("players_deque"):
            state.players_deque = deque([next(p for p in state.players if p.id == pid) 
                                      for pid in data["players_deque"]])
        
        # Restore board state
        if "board" in data:
            state.board = GameBoard.from_dict(data["board"])
        
        # Restore deck
        state.deck = [Card.from_dict(c) for c in data.get("deck", [])]
        
        # Restore player references
        if "attacker_player_id" in data:
            state.attacker_player = next((p for p in state.players 
                                        if p.id == data["attacker_player_id"]), None)
        if "victim_player_id" in data:
            state.victim_player = next((p for p in state.players 
                                      if p.id == data["victim_player_id"]), None)
        
        # Restore sets and lists
        state.throwing_players = [next(p for p in state.players if p.id == pid) 
                                for pid in data.get("throwing_players", [])]
        state.passed_players = set(data.get("passed_players", []))
        state.reconnect_counts = data.get("reconnect_counts", {})
        state.disconnected_players = set(data.get("disconnected_players", []))
        
        return state
        
    def to_dict(self) -> Dict[str, Any]:
        """Convert GameState to dictionary for serialization."""
        return {
            "trump_suit": self.trump_suit,
            "can_throw": self.can_throw,
            "is_bitten": self.is_bitten,
            "player_taked": self.player_taked,
            "is_end": self.is_end,
            "timeout_player_id": self.timeout_player_id,
            "players": [p.to_dict() for p in self.players],
            "players_deque": [p.id for p in self.players_deque] if self.players_deque else None,
            "board": self.board.to_dict(),
            "deck": [c.to_dict() for c in self.deck],
            "attacker_player_id": self.attacker_player.id if self.attacker_player else None,
            "victim_player_id": self.victim_player.id if self.victim_player else None,
            "throwing_players": [p.id for p in self.throwing_players],
            "passed_players": list(self.passed_players),
            "reconnect_counts": self.reconnect_counts,
            "disconnected_players": list(self.disconnected_players)
        }
