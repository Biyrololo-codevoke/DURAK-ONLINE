from .router import RouterEvent
from ..game import Card


class PlaceCardEvent(RouterEvent):
    event = "place_card"

    def handler(self, event):
        game        = event["game"]
        player      = event["player"]
        game_player = game.get_player(player.id)
        payload     = event["payload"]
        card_str    = payload["card"]
        slot        = payload["slot"]

        card = Card(
            suit = card_str["suit"],
            value = card_str["value"],
            is_trump = card_str["suit"] == game.trump_suit,
        )

        if not game_player.has_card(card):
            player.send({
                "status": "error",
                "message": "You don't have that card in your hand",
            })
            return

        if len(game.victim_player.deck) == 0:
            player.send({
                "status": "error",
                "message": "There are no cards left in the deck. Victim can not be placed",
            })
            return

        status = game.board.add_card(card, slot)
        if not status:
            # try to beat card
            is_beaten = game.board.beat_card(card, slot)

            if not is_beaten:
                player.send({
                    "status": "error",
                    "message": "Slot is not empty",
                })
                return
            else:
                player.deck.remove(card)
                player.send({
                    "status": "success",
                    "message": "Card was beaten",
                })
                game.update_pl_hst(game_player)
        else:
            player.deck.remove(card)
            payload["player_id"] = player.id
            player.broadcast_room(paylaod)
            player.send({
                "status": "success",
                "message": "Card was placed",
            })
            game.update_pl_hst(game_player)
        updater(game)