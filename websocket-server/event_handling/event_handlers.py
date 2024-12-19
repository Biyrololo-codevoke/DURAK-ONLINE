import asyncio
import json

from websockets import WebSocketServerProtocol as WebSocket

from websocket_logger import logger

from .data import room_list, Player
from .game import Game


async def handle_room(player: Player, payload: dict):
    event = payload.get("event")
    room = get_room(player.room_id)

    match event:
        case "join_room":
            logger.info(f"player {player.id} join room {player.room_id}")
            room.join_room(player)

        case "accept":
            logger.info(f"player {player.id} accept room {player.room_id}")
            room.do_accept(player)

        case _:
            logger.info(f"player {player.id} call game event {event}")
            route_game_events(payload, room_id, player)


async def handle_list(player: Player, payload: dict):
    event = payload.get("event")

    if not event:
        logger.info(f"player {player.id} call list (no-event)")
        room_list.subscribe(player)
        return

    match event:
        case "join_room":
            logger.info(f"player {player.id} take key")
            room_id   = payload.get("room_id")
            passsword = payload.get("password")  # nullable

            if room_id is None:
                player.send({"status": "error", "message": "room_id is missed"})

            room = room_list.room_list.get(room_id)
            room.take_key(player, passsword)

        case _:
            player.send({"status": "error", "message": f"{event=} not found"})



def route_game_events(payload: dict, room_id: int, key: str):
    event = payload["event"]
    game_model = FastRoom.get_room(room_id)
    game: Game = model_to_room(game_model)
    player = game.get_player(player_id)
    transfered = False

    event_data = {
        "event": event,
        "player": player,
        "game": game,
        "updater": lambda game: FastRoom.update_room(room_id, game),
        "payload": paylaod
    }

    router.route(event, event_data)

    if game.is_end:
        game.is_end = False
        player_taked = False

        if not game.transfered:
            player_taked, cards = game.end()
            logger.info(f"time is end with effect: {'player taked' if player_taked else 'beat cards'}")
        
        if player_taked:
            user.broadcast_room({
                "event": "player_taked",
                "cards_count": player.deck.__len__()
            })

            get_player(game.victim_player.id).send({
                "event": "get_cards",
                "cards": [card.json() for card in cards]
            })

            # take all cards from board
            victim_player = game.get_player(game.victim_player.id)
            for card in cards:
                victim_player.deck.add_card(card)

        elif game.is_bitten:
            for player in filter(lambda player: player.room_id == room_id, player_list):
                player.send({
                    "event": "beat_cards",
                    "cards": [card.json() for card in cards]
                })

        if player_taked:
            del game.throw_players_in_time_id[1]

        if not transfered:
            for _id in game.throw_players_in_time_id:
                _player = game.get_player(_id)
                if game.deck.__len__() == 0:
                    break

                need_cards = 6 - _player.deck.__len__()
                
                if need_cards < 0:
                    continue

                player_give_cards = []  # массив к5оторый я кину игроку

                if game.deck.__len__() >= need_cards:
                    for _ in range(need_cards):
                        player_give_cards.append(game.deck.pop())  # добавляю карту с конца в массив
                else:
                    player_give_cards = game.deck
                    game.deck = []

                for card in player_give_cards:
                    logger.info(f"player[{_id}] get card {str(card)}")
                    _player.deck.add_card(card)

                get_player(_id).send({
                    "event": "surprise",
                    "cards": [card.json() for card in player_give_cards]  # кидлаю массив игроку!
                })
                for player in get_room(room_id):
                    player.send({
                        "event": "give_cards",
                        "player_id": _id,
                        "cards_count": _player.deck.__len__()
                    })

        # check winner
        winners = game.check_winner()
        
        for winner, place, reward in winners:
            for player in get_room(room_id):
                player.send({
                    "event": "player_win",
                    "top": place,
                    "money": reward,
                    "player_id": winner.id
                })
            
        if game.is_total_end():
            looser_id = (set([player.id for player in game.players]) - set(game.rate.values())).pop()
            for player in get_room(room_id):
                player.send({
                    "event": "game_over",
                    "looser_id": looser_id
                })
            make_new_room(room_id, game)
        else:
            game.next()
            for player in get_room(room_id):
                player.send({
                    "event": "next",
                    "walking_player": game.attacker_player.id,
                    "victim_player": game.victim_player.id,
                    "throwing_players": [player.id for player in game.throwing_players],
                    "decKeck": game.deck.__len__(),
                    "type": "basic" if not transfered else "transfer"
                })
            updater(game)
    else:
        pass


def make_new_room(room_id: int, game: Game):
    global room_list

    time.sleep(10)  # TODO: normal timer
    
    config = game.get_config()
    current_db_room = RoomModel.get_by_id(room_id)
    
    players_id = current_db_room.user_ids
    config.update({
        "private": current_db_room.private,
        "password": current_db_room.password,
        "game_state": "open",
        "game_type": config["game_mode"],
        "throw_type": config["throw_mode"],
    })
    del config["game_mode"]
    del config["throw_mode"]
    
    new_db_room = RoomModel(**config)
    new_db_room.game_state = RoomTypes.RoomState.OPEN 
    new_db_room.save()
    room_list.add_room(new_db_room.id, room_count=0)
    
    for player_id in players_id:
        password = new_db_room.password
        _, key = room_list.join_to_room(new_db_room.id, player_id, password)
        send_to_player(player_id, {
            "event": "room_redirect",
            "key": key,
            "new_room_id": new_db_room.id
        })


async def wait_before_new_game():
    logger.info("wait before new game: " + str(int(time.time())))
    await asyncio.sleep(10)
    logger.info("time after waiting: " + str(int(time.time())))
