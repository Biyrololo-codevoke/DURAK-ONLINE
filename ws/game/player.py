from __future__ import annotations
from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from .card import Card

@dataclass
class Player:
    """Represents a player in the game."""
    
    id: str
    name: str
    cards: List[Card] = field(default_factory=list)
    is_connected: bool = True
    is_ready: bool = False
    is_loser: bool = False
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert player state to dictionary format for serialization."""
        return {
            "id": self.id,
            "name": self.name,
            "cards_count": len(self.cards),
            "cards": [card.to_dict() for card in self.cards],
            "is_connected": self.is_connected,
            "is_ready": self.is_ready,
            "is_loser": self.is_loser
        }
        
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Player':
        """Create Player instance from dictionary."""
        player = cls(id=data["id"], name=data.get("name", ""))
        player.cards = [Card.from_dict(card_data) for card_data in data.get("cards", [])]
        player.is_connected = data.get("is_connected", True)
        player.is_ready = data.get("is_ready", False)
        player.is_loser = data.get("is_loser", False)
        return player

    def can_beat_card(self, attack_card: Card, defense_card: Card) -> bool:
        """Check if player can beat attack card with defense card."""
        if defense_card not in self.cards:
            return False
            
        if defense_card.is_trump and not attack_card.is_trump:
            return True
            
        if attack_card.suit == defense_card.suit:
            return defense_card.value > attack_card.value
            
        return False

    def get_possible_cards(self, board_values: List[int]) -> List[Card]:
        """Get list of cards that player can use for attack."""
        if not board_values:
            return self.cards
            
        return [card for card in self.cards if card.value in board_values]
