from .router import RouterEvent


class BitoEvent(RouterEvent):
    event = "bito"

    def handler(self, payload):
        player = payload["player"]
        game = payload["game"]
        updater: callable = payload["updater"]

        if player.id == game.attacker_player.id:
            player.send({
                "status": "success"
            })
            player.broadcast_room({
                "event": self.event,
                "player_id": player.id
            })
            game.player_bito()
        else:
            player.send({
                "status": "error",
                "message": "You are not the attacker"
            })
        