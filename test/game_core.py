from __future__ import annotations

tramp_suit = None
suites = ["♠️", "♥️", "♣️", "♦️"]

def set_tramp_suit(suit):
    global tramp_suit
    tramp_suit = suit


class Card:
    def __init__(self, suit, value):
        self.suit = suit
        self.value = value
        self.is_tramp = suit == tramp_suit

    def __repr__(self) -> str:
        return f"<Card object suit={self.suit} value={self.value}>"
    
    def __eq__(self, value: Card) -> bool:
        return self.suit == value.suit and self.value == value.value and self.is_tramp == value.is_tramp