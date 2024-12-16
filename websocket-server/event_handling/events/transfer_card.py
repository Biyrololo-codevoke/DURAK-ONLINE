from .router import RouterEvent
from ..game import Card


class TransferCardEvent(RouterEvent):
    event = "transfer_card"

    def handler(self, event):
        game = event["game"]
        player = event["player"]
        payload = event["payload"]
        card_str = payload["card"]
        updater = event["updater"]

        card = Card(
            suit = card_str["suit"],
            value = card_str["value"],
            is_trump = card_str["suit"] == game.trump_suit,
        )

        status, reason = game.board.can_transfer(card)

        player.send({
            "status": "success" if status else "error",
            "message": reason
        })

        if status:
            game.is_end = True
            game.transfered = True
            game.throw_players_in_time_id.append(player.id)
            game.update_pl_hst(player.id)

            player.deck.remove_card(card)

            new_victim_player = game.players_deque[-2]
            player.broadcast_room({
                "event": self.event,
                "card": card_str,
                "player": player.id,
                "target": new_victim_player.id
            })
            updater(game)