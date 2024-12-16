from .router import RouterEvent
from ..game import Card


class ThrowCard(RouterEvent):
    event = "throw_card"

    def handler(self, event):
        game = event["game"]
        player = event["player"]
        game_player = game.get_player(player.id)
        payload = event["payload"]
        card_str = payload["card"]
        updater = event["updater"]

        if not game.board.has_free_slot():
            player.send({
                "status": "error",
                "message": "Board is full"
            })
            return
        
        card = Card(
            suit = card_str["suit"],
            value = card_str["value"],
            is_trump = card_str["suit"] == game.trump_suit
        )

        if player.id in game.throwing_players \
                and game.can_throw \
                and player.has_card(card):
            player.send({
                "status": "success",
                "message": "Card thrown"
            })
            player.deck.remove_card(card)
            player.broadcast_room({
                "event": self.event,
                "player_id": player.id,
                "card": card_str
            })
            game.update_pl_hst(game_player)
            game.player_throws_card(card_str)  # TODO: find wtf is it
            game.throw_players_in_time_id.append(player.id)
            updater(game)
        else:
            player.send({
                "status": "error",
                "message": "You can't throw this card"
            })
