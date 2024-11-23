import asyncio
from typing import Optional, Callable
from ..websocket_logger import logger

class GameTimer:
    """Manages game turn timers."""
    
    def __init__(self, timeout: int = 30):
        self.timeout = timeout  # seconds
        self.current_timer: Optional[asyncio.Task] = None
        
    async def start_turn_timer(self, room_id: int, player_id: int, on_timeout: Callable):
        """Start a new turn timer."""
        # Cancel existing timer if any
        self.cancel_timer()
        
        # Create new timer
        self.current_timer = asyncio.create_task(
            self._timer_countdown(room_id, player_id, on_timeout)
        )
        
    def cancel_timer(self):
        """Cancel current timer if exists."""
        if self.current_timer and not self.current_timer.done():
            self.current_timer.cancel()
            self.current_timer = None
            
    async def _timer_countdown(self, room_id: int, player_id: int, on_timeout: Callable):
        """Countdown timer implementation."""
        try:
            await asyncio.sleep(self.timeout)
            logger.info(f"Timer expired for player {player_id} in room {room_id}")
            await on_timeout(room_id, player_id)
        except asyncio.CancelledError:
            logger.info(f"Timer cancelled for player {player_id} in room {room_id}")
        except Exception as e:
            logger.error(f"Timer error: {str(e)}")
            
    def reset_timer(self, room_id: int, player_id: int, on_timeout: Callable):
        """Reset the timer for the current turn."""
        asyncio.create_task(self.start_turn_timer(room_id, player_id, on_timeout))
