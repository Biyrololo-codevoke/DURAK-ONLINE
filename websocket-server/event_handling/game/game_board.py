from __future__ import annotations

from typing import List, Dict, Literal
import json

from card import Card


class GameBoard:
    """
    Represents the game board, which is a list of slots.
    Each slot is a dictionary with two keys: "down" and "up".
    The "down" card is the bottom card in the slot, and the "up" card is the top one.
    If a slot is empty, it doesn't have either "down" or "up" key.
    """
    SLOTS_COUNT: int = 6

    def __init__(self) -> None:
        """
        Initializes the game board with an empty list of slots.
        """
        self.slots: Dict[int, Dict[Literal["down", "up"], Card]] = {}

    def add_card(self, card: Card, slot_id: int) -> bool:
        """
        Adds a card to a slot on the game board.

        Args:
            card (Card): The card to add.
            slot (int): The slot to add the card to.

        Returns:
            bool: True if the card was added successfully, False otherwise.
        """
        if slot_id in list(range(0, self.SLOTS_COUNT)) \
                and self.slots.get(slot_id) is None:
            self.slots[slot_id]["down"] = card
            return True
        return False

    def beat_card(self, beat_card: Card, slot_id: int) -> bool:
        """
        Tries to beat a card on the game board.

        Args:
            beat_card (Card): The card to beat.
            slot (int): The slot to beat the card in.

        Returns:
            bool: True if the card was beaten successfully, False otherwise.
        """
        if self.slots.get(slot_id) is None:
            return False

        if beat_card > self.slots[slot_id]["down"]:
            self.slots[slot_id]["up"] = beat_card
            return True
        return False

    def take_all(self) -> List[Card]:
        """
        Takes all the cards from the game board.

        Returns:
            List[Card]: A list of all the cards on the game board.
        """
        card_list: List[Card] = [self.slots.values()]
        self.slots = {}
        return card_list

    def __str__(self) -> str:
        """
        Returns a string representation of the game board.

        Returns:
            str: The string representation of the game board.
        """
        s = f"<GameBoard {id(self)}:"
        for slot_cards in self.slots:
            s.append(f"[{slot_cards.get('up')} -> {slot_cards.get('down')}]")

        return s

    def serialize(self) -> str:
        """
        Serializes the game board to a JSON string.

        Returns:
            str: The serialized game board.
        """
        return json.dumps(
            [
                {
                    "down": slot["down"].serialize() if slot.get("down") else None,  # noqa E501
                    "up": slot["up"].serialize() if slot.get("up") else None
                }
                for slot in self.slots.values()
            ]
        )

    @staticmethod
    def deserialize(raw_data: str) -> GameBoard:
        """
        Deserializes a game board from a JSON string.

        Args:
            raw_data (str): The serialized game board.

        Returns:
            GameBoard: The deserialized game board.
        """
        slots = json.loads(raw_data)
        new_game_board = GameBoard()
        new_game_board.slots = [
            {
                "down": Card.deserialize(card["down"])
                for card in slot
                if "down" in card
            }
            for slot in slots
        ]
        return new_game_board
