from .router import RouterEvent


class EventName(RouterEvent):
    event = "event_name"

    def handler(self, *args, **kwargs):
        pass
