from .data import Player, room_list


def handle_disconnect(player: Player):
    if player.type == "ROOM":
        player.broadcast_room("player_disconnect", {"id": player.id})
    else:
        room_list.unsubscribe(player)
