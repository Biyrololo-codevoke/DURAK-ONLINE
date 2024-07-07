from card import Card


class PlayerDeck:
    def __init__(self, cards: list[Card] = None):
        self._cards = cards or []
        self.count = cards and len(cards)

    def find_card(self, card: Card) -> Card | None:
        index = self._cards.find(card)
        if index == -1:
            return None
        else:
            return self._cards[index]

    def get_card(self, suit: Card.Suites, value: int):
        eligible_cards = list(
            filter(
                lambda card: card.suit == suit and card.value == value,
                self._cards
            )
        )
        if not eligible_cards:
            return None
        else:
            return eligible_cards[0]

    def add_card(self, card: Card) -> None:
        self._cards.append(card)

    def remove_card(self, card: Card) -> None:
            if not self.find_card(card):
                raise ValueError("Player has no card: " + str(card))
            self._cards.remove(card)
            
    def __str__(self):
        return ", ".join([str(card) for card in self._cards])
