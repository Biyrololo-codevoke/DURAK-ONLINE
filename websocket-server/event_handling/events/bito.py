from .router import RouterEvent


class BitoEvent(RouterEvent):
    event = "bito"

    def handler(self, *args, **kwargs):
        pass
