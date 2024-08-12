up_slots = [None, None, None, None, None, None]
down_slots = [None, None, None, None, None, None]

card_deck = []


class Card:
    def __init__(this, suit, value, is_trump=False):
        this.suit = suit
        this.value = value
        this.is_trump = is_trump
        

def is_card_beat(beat_card: Card, victim_card: Card) -> bool:
    if victim_card.is_trump and not beat_card.is_trump:
        return False
    
    if not victim_card.is_trump and beat_card.is_trump:
        return True
    
    return beat_card.value > victim_card.is_trump
    