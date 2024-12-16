from .router import RouterEvent


class PassEvent(RouterEvent):
    event = "pass"

    def handler(self, payload):
        player = paylaod["player"]
        updater = payload["updater"]
        game = paylaod["game"]

        if (player.id in  game.throwing_players or \
                player.id == game.attacker_player.id) and \
                player.id not in game.passed_players:
            player.send({
                "status": "success",
            })
            player.broadcast_room({
                "event": self.event,
                "player_id": player.id,
            })
            game.passed_players.append(player.id)
            updater(game)
        else:
            player.send({
                "status": "error",
                "message": "You can't pass now"
            })