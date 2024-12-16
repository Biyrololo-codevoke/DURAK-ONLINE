from .router import RouterEvent


class TakeEvent(RouterEvent):
    event = "take"

    def handler(self, event):
        game = event["game"]
        player = event["player"]
        updater = event["updater"]

        if player.id == game.victim_player.id:
            player.send({
                "status": "success"
            })
            player.broadcast_room({
                "event": self.event,
                "player_id": player.id
            })
            game.player_took()
        else:
            player.send({
                "status": "error",
                "message": "You are not the victim"
            })
        updater(game)
