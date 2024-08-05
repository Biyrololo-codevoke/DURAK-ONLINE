from __future__ import annotations

from typing import List, Dict, Literal
import json

from .card import Card


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
        self.slots_down: list[int | None] = [None] * self.SLOTS_COUNT
        self.slots_up: list[int | None] = [None] * self.SLOTS_COUNT

    def add_card(self, card: Card, slot_id: int) -> bool:
        """
        Adds a card to a slot on the game board.

        Args:
            card (Card): The card to add.
            slot (int): The slot to add the card to.

        Returns:
            bool: True if the card was added successfully, False otherwise.
        """
        if self.slots_down[slot_id] is not None:
            return False
        else:
            self.slots_down[slot_id] = card
            return True

    def beat_card(self, beat_card: Card, slot_id: int) -> bool:
        """
        Tries to beat a card on the game board.

        Args:
            beat_card (Card): The card to beat.
            slot (int): The slot to beat the card in.

        Returns:
            bool: True if the card was beaten successfully, False otherwise.
        """
        if self.slots_up[slot_id] is not None:
            return False
        else:
            if self.slots_down[slot_id] is None:
                return False
            else:
                self.slots_down[slot_id] = beat_card
                return True

    def take_all(self) -> List[Card]:
        """
        Takes all the cards from the game board.

        Returns:
            List[Card]: A list of all the cards on the game board.
        """
        cards = [x for x in [*self.slots_down, *self.slots_up] if x is not None]

        self.slots_down: list[int | None] = [None] * self.SLOTS_COUNT
        self.slots_up: list[int | None] = [None] * self.SLOTS_COUNT

        return cards
    
    def has_free_slot(self) -> bool:
        """
        Checks if there is a free slot on the game board.

        Returns:
            bool: True if there is a free slot, False otherwise.
        """
        return None in self.slots_down

    def __str__(self) -> str:
        """
        Returns a string representation of the game board.

        Returns:
            str: The string representation of the game board.
        """
        
        s = f"""
            [{self.slots_up[0] or 'x'} / {self.slots_down[0] or 'x'}] [{self.slots_up[1] or 'x'} / {self.slots_down[1] or 'x'}] [{self.slots_up[2] or 'x'} / {self.slots_down[2] or 'x'}]
            [{self.slots_up[3] or 'x'} / {self.slots_down[3] or 'x'}] [{self.slots_up[4] or 'x'} / {self.slots_down[4] or 'x'}] [{self.slots_up[5] or 'x'} / {self.slots_down[5] or 'x'}]
        """
        
        return s

    def serialize(self) -> str:
        """
        Serializes the game board to a JSON string.

        Returns:
            str: The serialized game board.
        """
        up_arr = []
        dw_arr = []
        
        for down_card in self.slots_down:
            if down_card is None:
                dw_arr.append(None)
            else:
                dw_arr.append(down_card.serialize())
        
        for up_card in self.slots_up:
            if up_card is None:
                up_arr.append(None)
            else:
                up_arr.append(up_card.serialize())
        
        return json.dumps({
            "down": dw_arr,
            "up": up_arr
        })
        

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

        new_game_board.slots_down = [None] * GameBoard.SLOTS_COUNT
        new_game_board.slots_up = [None] * GameBoard.SLOTS_COUNT
        
        for i in range(len(slots["down"])):
            if slots["down"][i]:
                new_game_board.slots_down[i] = Card.deserialize(slots["down"][i])
            else:
                new_game_board.slots_down[i] = None
        
        for i in range(len(slots["up"])):
            if slots["up"][i]:
                new_game_board.slots_up[i] = Card.deserialize(slots["up"][i])
            else:
                new_game_board.slots_up[i] = None
        
        return new_game_board