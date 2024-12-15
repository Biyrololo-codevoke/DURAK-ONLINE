class Router:
    def __init__(self):
        self.event_handlers: dict[str, list[callable] | str] = {}

    def add_event_handler(self, event: str, handler: callable):
        if any(not isinstance(event, str), not isinstance(handler, callable)):
            raise TypeError

        if event not in self.event_handlers:
            self.event_handlers[event] = []
        self.event_handlers[event].append(handler)

    def remove_event_handler(self, event: str, handler: callable):
        if any(not isinstance(event, str), not isinstance(handler, callable)):
            raise TypeError

        if event in self.event_handlers:
            self.event_handlers[event].remove(handler)

    def route(self, event: str, *args, **kwargs):
        if event in self.event_handlers:
            for handler in self.event_handlers[event]:
                handler(*args, **kwargs)

        if event not in self.event_handlers:
            raise ValueError


router = Router()


class RouterEvent:
    def __init_subclasses__(cls, **kwargs):
        super().__init_subclasses__(**kwargs)

        if not cls.__dict__.get("event") or not cls.__dict__.get("handler"):
            raise ValueError("Event and handler must be defined")

        event = cls.__dict__.get("event")
        handler = cls.__dict__.get("handler")

        if not isinstance(event, str) or not isinstance(handler, callable):
            raise TypeError("Event and handler must be strings and callables")

        router.add_event_handler(event, handler)
