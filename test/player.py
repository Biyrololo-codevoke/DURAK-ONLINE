from game_core import Card, set_tramp_suit


def atack(cards: list[Card]) -> list[Card]:
    non_tramp_cards = list(filter(lambda card: not card.is_tramp, cards))
    if non_tramp_cards:
        sorted_cards = sorted(non_tramp_cards, key=lambda card: card.value)
        if len(sorted_cards) > 1:
            return list(filter(lambda card: card.value == sorted_cards[0].value, sorted_cards))
    else:
        sorted_cards = sorted(cards, key=lambda card: card.value)
        return [sorted_cards[0]]
    

def defend(cards: list[Card], deck: list[Card]) -> list[Card] | None:
    used_cards = []

    for card in sorted(cards, key=lambda c: c.value+(50*int(c.is_tramp))):
        card_suit_need = list(
            filter(lambda c: c.suit == card.suit and \
                   c.is_tramp == card.is_tramp and \
                    c.value > card.value, deck)
        )
        if card_suit_need:
            used_cards.append(card_suit_need[0])
            deck.remove(card_suit_need[0])
        else:
            if not card.is_tramp:
                deck_tramp_cards = list(filter(lambda c: c.is_tramp, deck))
                if deck_tramp_cards:
                    used_cards.append(deck_tramp_cards[0])
                    deck.remove(deck_tramp_cards[0])
                else:
                    return None
            else:
                return None
    return used_cards


def test():
    set_tramp_suit(1)

    try:
        assert defend([Card(0, 6)], [Card(0, 8)]) == [Card(0, 8)]
    except AssertionError as e:
        print("!")

test()