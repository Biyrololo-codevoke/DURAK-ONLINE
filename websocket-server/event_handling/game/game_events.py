from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
from collections import deque
from typing import Callable


class GameEventDispatcher:
    def __init__(self):
        self.event_handlers = dict()
        self.events_queue = deque()
        self.workers = ThreadPoolExecutor(max_workers=16)
        
    def register_handler(self, event: str, handler: Callable):
        if self.event_handlers.get(event) is None:
            self.event_handlers[event] = []
        self.event_hanlers[event].append(handler)
        
    def dispatch_event(self, event: GameEvent):
        if event.important:
            self.events_queue.appendleft(event)
        else:
            self.events_queue.append(event)
        self.queue_update()
        
    def queue_update(self):
        while self.events_queue:
            event = self.events_queue.popleft()
            handlers = self.event_handlers.get(event.name)
            if not handlers:
                raise ValueError(f"has no handlers for event: {event}")
            for handler in handlers:
                self.workers.submit(handler, event)


class GameEvent:
    def __init__(self, game_id: int, payload: dict, user_id: int | None = None):
        self.game_id = game_id
        self.payload = payload
        self.user_id = user_id
        self.important = payload.get("important") == True


    def __str__(self) -> str:
        return "<GameEvent %s  game: %d, user id: %d, payload: %s" % (
            id(self), self.game_id, self.user_id, self.payload
        )
