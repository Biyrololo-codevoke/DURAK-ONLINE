from __future__ import annotations
import random
from typing import TypeAlias, Literal, get_args, Dict, Any
from dataclasses import dataclass

@dataclass
class Card:
    """Represents a playing card in the game."""
    
    Suites: TypeAlias = Literal["♠️", "♥️", "♣️", "♦️"]
    Deck_sizes: TypeAlias = Literal[52, 36, 24]
    Ranks: TypeAlias = Literal["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]

    suit: Suites
    rank: Ranks
    is_trump: bool = False

    @classmethod
    def make_deck(cls, size: Deck_sizes = 52) -> list[Card]:
        """Create a new shuffled deck of cards."""
        deck_min_card_value = {52: 2, 36: 6, 24: 9}[size]
        card_list = []

        for suit in get_args(cls.Suites):
            for value in range(deck_min_card_value, 15):
                rank = {2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "10", 11: "J", 12: "Q", 13: "K", 14: "A"}.get(value)
                card_list.append(Card(suit, rank))
        random.shuffle(card_list)

        # Set trump suit based on first card
        for card in card_list:
            card.is_trump = (card.suit == card_list[0].suit)

        return card_list

    def __str__(self) -> str:
        """String representation of the card."""
        return f"{self.rank}{self.suit}{'!' if self.is_trump else '.'}"

    def __gt__(self, other: Card) -> bool:
        """Compare cards for game logic."""
        if self.is_trump:
            if other.is_trump:
                ranks = get_args(self.Ranks)
                return ranks.index(self.rank) > ranks.index(other.rank)
            return True
        if other.is_trump:
            return False
        if self.suit == other.suit:
            ranks = get_args(self.Ranks)
            return ranks.index(self.rank) > ranks.index(other.rank)
        return False

    def to_dict(self) -> Dict[str, Any]:
        """Convert Card to dictionary for serialization."""
        return {
            "suit": self.suit,
            "rank": self.rank,
            "is_trump": self.is_trump
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Card':
        """Create Card instance from dictionary."""
        return cls(
            suit=data["suit"],
            rank=data["rank"],
            is_trump=data.get("is_trump", False)
        )
