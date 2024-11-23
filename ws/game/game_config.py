from dataclasses import dataclass
from typing import Literal

@dataclass
class GameConfig:
    """Configuration settings for a game session."""
    id: int
    reward: int = 100
    speed: Literal[1, 2] = 1
    players_count: Literal[2, 3, 4, 5, 6] = 2
    deck_size: Literal[24, 36, 52] = 36
    game_mode: Literal["throw", "translate"] = "throw"
    win_type: Literal["classic", "draw"] = "classic"
    throw_mode: Literal["all", "neighborhood"] = "all"

    def to_dict(self) -> dict:
        """Convert config to dictionary format."""
        return {
            "reward": self.reward,
            "players_count": self.players_count,
            "cards_count": self.deck_size,
            "speed": self.speed,
            "game_mode": self.game_mode,
            "throw_mode": self.throw_mode,
            "win_type": self.win_type,
        }
