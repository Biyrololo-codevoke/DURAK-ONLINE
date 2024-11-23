from __future__ import annotations
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any
from .card import Card

@dataclass
class GameBoard:
    """Represents the game board where cards are played."""
    
    attack_cards: List[Card] = field(default_factory=list)
    defense_cards: Dict[int, Card] = field(default_factory=dict)
    max_cards: int = 6

    def can_add_attack_card(self, card: Card) -> bool:
        """Check if an attack card can be added to the board."""
        if len(self.attack_cards) >= self.max_cards:
            return False
            
        if not self.attack_cards:
            return True
            
        return card.value in self.get_valid_values()

    def can_add_defense_card(self, card: Card) -> bool:
        """Check if a defense card can be added to the board."""
        if not self.attack_cards:
            return False
            
        undefended_attacks = self.get_undefended_attacks()
        if not undefended_attacks:
            return False
            
        attack_card = undefended_attacks[0]
        return self._can_beat(attack_card, card)

    def add_attack_card(self, card: Card) -> None:
        """Add an attack card to the board."""
        self.attack_cards.append(card)

    def add_defense_card(self, card: Card) -> None:
        """Add a defense card to the board."""
        undefended = self.get_undefended_attacks()
        if undefended:
            self.defense_cards[len(self.defense_cards)] = card

    def get_undefended_attacks(self) -> List[Card]:
        """Get list of attack cards that haven't been defended yet."""
        return self.attack_cards[len(self.defense_cards):]

    def get_valid_values(self) -> List[int]:
        """Get list of valid card values that can be played."""
        values = set()
        for card in self.attack_cards:
            values.add(card.value)
        for card in self.defense_cards.values():
            values.add(card.value)
        return list(values)

    def _can_beat(self, attack_card: Card, defense_card: Card) -> bool:
        """Check if defense card can beat attack card."""
        if defense_card.is_trump and not attack_card.is_trump:
            return True
            
        if attack_card.suit == defense_card.suit:
            return defense_card.value > attack_card.value
            
        return False

    def clear(self) -> None:
        """Clear the board for the next round."""
        self.attack_cards.clear()
        self.defense_cards.clear()

    def to_dict(self) -> Dict[str, Any]:
        """Convert GameBoard to dictionary for serialization."""
        return {
            "attack_cards": [card.to_dict() for card in self.attack_cards],
            "defense_cards": {
                str(pos): card.to_dict() 
                for pos, card in self.defense_cards.items()
            }
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'GameBoard':
        """Create GameBoard instance from dictionary."""
        board = cls()
        board.attack_cards = [Card.from_dict(card_data) 
                            for card_data in data.get("attack_cards", [])]
        board.defense_cards = {
            int(pos): Card.from_dict(card_data)
            for pos, card_data in data.get("defense_cards", {}).items()
        }
        return board
