from .data import Player


def handle_disconnect(player: Player):
    if player.type == "ROOM":
        player.broadcast_room("player_disconnect", {"id": player.id})
