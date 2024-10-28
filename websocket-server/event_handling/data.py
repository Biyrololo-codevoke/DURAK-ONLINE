import json
import time
import asyncio
from uuid import uuid4

from websockets import WebSocketServerProtocol as WS

from models import RoomModel, UserModel, RoomTypes, Exceptions
from websocket_logger import logger

from .game import Game, Player, Card
from .utils import handle_socket_closing


JWT_SECRET_KEY = "OIDU#H-298ghd-7G@#DF^))GV31286f)D^#FV^2f06f6b-!%R@R^@!1263"
socket_identity = dict()
user_socket = dict()
key_identity = dict()


class RoomListObserver:
    def __init__(self, rooms: dict[int, int] = None, followers: list = None):
        self._rooms = rooms or dict()
        self._rooms.update(
            self.load_from_db()
        )
        self._room_connections = dict()
        
        self.expired_join_keys = []
        self._rooms_join_keys = dict()
        
        self._room_accepts = dict()
        
        self._followers = followers or list()
        self.notify()

    def load_from_db(self) -> dict[int, list[int]]:
        return RoomModel.current_list()

    def add_room(self, room_id: int, *, room_count: int = 1, author_id=None, key=None):
        self._rooms[room_id] = room_count
        self._room_connections[room_id] = []
        self._rooms_join_keys[room_id] = []
        self._room_accepts[room_id] = {
            "accepts": 0,
            "player_ids": [],
            "value": -1
        }

        if author_id and key and key.startswith("athr"):
            self._rooms_join_keys[room_id].append({
                "key": key,
                "player_id": author_id,
                "time": int(round(time.time() * 1000)),
            })

        self.notify()

    @handle_socket_closing
    def join_to_room(self, room_id, player_id, password=None) -> tuple[bool, str]:
        try:
            room = RoomModel.get_by_id(room_id)
            player = UserModel.get_by_id(player_id)
            
            if not room.check_password(password):
                return False, "Incorrect password"
            
            if room.reward > player.money:
                return False, "Not enough money"

            if player_id in room.user_ids:
                return False, "Player already joined to room"

            players_in_room = len(room.user_ids)
            players_in_connection = self._rooms_join_keys.get(room_id)
            player_conn_len = 0 if players_in_connection is None else len(players_in_connection)

            if not room.check_available():
                self._accepts_need = room.players_count
                return False, "Room is full"

            if players_in_room + player_conn_len > room.players_count:
                the_oldest_conn = sorted(
                    self._rooms_join_keys[room_id],
                    key=lambda x: x["time"],
                    reverse=True
                )[0]
                current_time = int(round(time.time() * 1000))

                if current_time - the_oldest_conn["time"] > 15 * 1000:
                    self.expired_join_keys.append(the_oldest_conn["key"])
                else:
                    return False, "Room is full"

            key = uuid4().hex + f"_{player_id}"

            if self._rooms_join_keys.get(room_id) is None:
                self._rooms_join_keys[room_id] = []

            self._rooms_join_keys[room_id].append({
                "key": key,
                "player_id": player_id,
                "time": int(round(time.time() * 1000)),
            })

            return True, key

        except Exceptions.Room.NotFound:
            return False, "Room not found"

    @handle_socket_closing
    def connect_to_room(self, room_id: int, key: str) -> tuple[bool, str]:
        room_connections = self._rooms_join_keys.get(room_id)
        player_connection = list(filter(lambda x: x["key"] == key, room_connections))[0]

        if not player_connection:
            if key in self.expired_join_keys:
                self.expired_join_keys.remove(key)
                return False, "token expired"
            else:
                return False, "key is incorrect"

        try:
            player_id = int(key.split('_')[-1])
            
            room = RoomModel.get_by_id(room_id)             # add to db
            room.add_player(player_id)

            user_socket = key_identity[key]
            self._room_connections[room_id].append(user_socket)        # add socket to room socket group
            
            room_event = {                                   
                "event": "player_connected",
                "player_id": player_id
            }
            send_to_room(room_id, room_event, id(user_socket))

            # update player_count in room_list
            self.update_room(room_id, len(room._user_ids)+1)
            
            self._rooms_join_keys[room_id].remove(          # clear from join keys
                player_connection
            )
            
            if not room.check_available():
                self._room_accepts[room_id]["accepts"] = room.players_count
                self.make_start(room_id)
            
            return True, "successfully connected"

        except Exceptions.Room.NotFound:
            return False, "Room not found"
        
        except Exceptions.Room.IsFull:
            return False, "Room is full"
        
    def make_start(self, room_id: int):
        self._room_accepts[room_id]['value'] = 0
        send_to_room(room_id, {
            "event": "make_start"
        })
        self.remove_room(room_id)
        
    @handle_socket_closing
    def accept_start(self, room_id: int, key: int):
        player_id = int(key.split('_')[-1])
        player_socket = key_identity[key]
        user_socket[player_id] = player_socket

        if not self._room_accepts.get(room_id):
            status, message =  False, "room not found"
        
        elif player_id in self._room_accepts[room_id]["player_ids"]:
            status, message =  False, "already accepted"
            
        elif self._room_accepts[room_id]["value"] == -1:
            status, message = False, "room isn't full"
        
        else:
            self._room_accepts[room_id]["value"] += 1
            self._room_accepts[room_id]["player_ids"].append(player_id)
            send_to_room(room_id, {
                "event": "accept",
                "player_id": player_id
            }, id(player_socket))
            status, message = True, "wrong answer | time limit error | memory error | accepted"

        if self._room_accepts[room_id]["value"] == self._room_accepts[room_id]["accepts"]:
            send_to_room(room_id, {
                "event": "start_game",
                "message": "huy!"*9
            })
            self.start_game(room_id)

        return status, message
    
    def start_game(self, room_id: int):
        room = RoomModel.get_by_id(room_id)
        game = Game(
            id            = room.id,
            reward        = room.reward,
            speed         = room.speed,
            players_count = room.players_count,
            deck_size     = room.cards_count,
            game_mode     = room.game_type,
            win_type      = room.win_type,
            throw_mode    = room.throw_type
        )

        for player_id in room.user_ids:
            player = Player(player_id)
            game.join_player(player)

        room.game_state = "in_game"
        room.game_obj = game.serialize()
        room.save()
        
        send_to_room(room_id, {
            "event": "game_init",
            "last_card": game.last_card.json()
        })
        
        for player in game.players:
            payload = {
                "event": "init_deck",
                "deck": player.deck.json()
            }
            send_to_player(player.id, payload)
            
        send_to_room(room_id, {
            "event": "next",
            "walking_player": game.attacker_player.id,
            "victim_player": game.victim_player.id,
            "throwing_players": [player.id for player in game.throwing_players]
        })

    def update_room(self, room_id: int, room_count: int):
        self._rooms[room_id] = room_count
        self.notify()

    def remove_room(self, room_id):
        del self._rooms[room_id]
        self.notify()

    def get_rooms(self) -> dict[int, int]:
        return self._rooms
    
    def get_room_connections(self, room_id) -> list[WS]:
        return self._room_connections[room_id]
    
    def subscribe(self, follower):
        self._followers.append(follower)

    def notify(self):
        tasks = []
        data = self.get_rooms()
        
        for follower in self._followers:
            tasks.append(
                send_data(follower, data)
            )
        asyncio.gather(*tasks)


async def send_data(socket, payload):
    serialized = json.dumps(payload)
    await socket.send(serialized)


def send_to_room(room_id: int, payload: dict, socket_id: int = None):
    from .event_handlers import send_to_room as _send
    asyncio.create_task(
        _send(room_id, payload, socket_id)
    )


def send_to_player(player_id: int, payload: dict):
    from .event_handlers import send_to_user as _send_y
    asyncio.create_task(
        _send_y(player_id, payload)
    )


@handle_socket_closing
def route_game_events(payload: dict, room_id: int, key: str):
    event = payload["event"]
    room = RoomModel.get_by_id(room_id)

    if not room:
        send_to_player(player_id, {
            "status": "error",
            "message": "Room not found"
        })

    serialized_game = room.game_obj
    game = Game.deserialize(serialized_game)
    player_id = int(key.split('_')[-1])
    socket_id = id(key_identity[key])

    player = game.get_player(player_id)
    
    transfered = False

    match event:
        case "place_card":
            slot = payload["slot"]
            card = Card(
                suit = payload["card"]["suit"],
                value = payload["card"]["value"],
                is_trump = payload["card"]["suit"] == game.trump_suit
            )
            logger.info(f"player[{player_id}] place card {str(card)}")
            logger.info(f"player[{player.id}] deck: {str(player.deck)}")
            logger.info(str(game.board))
            if not player.has_card(card):
                send_to_player(player_id, {
                    "status": "error",
                    "message": "карты нету такой!"
                })
                return
            
            available_cards_count = len(game.victim_player.deck)
            if available_cards_count == 0:
                send_to_player(player_id, {
                    "status": "error",
                    "message": "ТЫ ЕБЛАН? ЧЕЛУ НЕЧЕМ ОТБИТЬСЯ"
                })
                return

            status = game.board.add_card(card, slot)
            if not status:
                status2 = game.board.beat_card(card, slot)
                if not status2:
                    send_to_player(player_id, {
                        "status": "error",
                        "message": "слот занят бля"
                    })
                    return
                else:
                    player.deck.remove_card(card)
                    send_to_player(player_id, {
                        "status": "success"
                    })
                    send_to_room(room_id, {
                        "event": "card_beat",
                        "card": card.json(),
                        "slot": slot,
                        "player_id": player_id
                    }, socket_id)
                    game.update_pl_hst(player)
            else:
                player.deck.remove_card(card)
                payload["player_id"] = player_id
                send_to_room(room_id, payload, socket_id)
                game.update_pl_hst(player)
            s_game = game.serialize()
            room.game_obj = s_game
            room.save()

        case "pass":
            logger.info(f"player[{player_id}] pass")
            if player_id in [*[player.id for player in game.throwing_players], game.attacker_player.id] and player_id not in game.passed_players:
                send_to_player(player_id, {
                    "status": "success"
                })
                send_to_room(room_id, {
                    "event": "pass",
                    "player_id": player_id
                }, socket_id)
                game.player_passed(player_id)
                s_game = game.serialize()
                room.game_obj = s_game
                room.save()
            else:
                send_to_player(player_id, {
                    "status": "error",
                    "message": "не время пасовать"
                })
                
        case "bito":
            logger.info(f"player[{player_id}] bito")
            if player_id == game.attacker_player.id:
                send_to_player(player_id, {
                    "status": "success"
                })
                send_to_room(room_id, {
                    "event": "bito",
                    "player_id": player_id
                }, socket_id)
                game.player_bito()
                s_game = game.serialize()
                room.game_obj = s_game
                room.save()
            else:
                send_to_player(player_id, {
                    "status": "error",
                    "message": "нельзя щас тыкать бито"
                })
        
        case "take":
            logger.info(f"player[{player_id}] take")
            if player_id == game.victim_player.id:
                send_to_player(player_id, {
                    "status": "success"
                })
                send_to_room(room_id, {
                    "event": "take",
                    "player_id": player_id
                }, socket_id)
                game.player_took()
            else:
                send_to_player(player_id, {
                    "status": "error",
                    "message": "Invalid move"
                })
            s_game = game.serialize()
            room.game_obj = s_game
            room.save()

        case "throw_card":
            if not game.board.has_free_slot():
                send_to_player(player_id, {
                    "status": "error",
                    "message": "Invalid move"
                })
                return
            card = Card(
                suit = payload["card"]["suit"],
                value = payload["card"]["value"],
                is_trump = payload["card"]["suit"] == game.trump_suit
            )
            logger.info(f"player[{player_id}] throw card {str(card)}")

            if player_id in game.throwing_players and game.can_throw and player.has_card(card):
                send_to_player(player_id, {
                    "status": "success"
                })
                player.deck.remove_card(card)
                send_to_room(room_id, {
                    "event": "throw_card",
                    "card": payload["card"],
                    "player_id": player_id
                }, socket_id)
                game.update_pl_hst(player)
                game.player_throws_card(payload["card"])
                game.throw_players_in_time_id.append(player.id)

            else:
                send_to_player(player_id, {
                    "status": "error",
                    "message": "Invalid move"
                })
            s_game = game.serialize()
            room.game_obj = s_game
            room.save()
 
        case "transfer_card":
            card = Card(
                suit = payload["card"]["suit"],
                value = payload["card"]["value"],
                is_trump = payload["card"]["suit"] == game.trump_suit
            )
            logger.info(f"player[{player_id}] transfer card {str(card)}")
            status, reason = game.board.can_transfer(card)

            send_to_player(player_id, {
                "status": "success" if status else "error",
                "message": reason
            })
            
            if status:
                game.is_end = True
                transfered = True
                # update move state
                game.throw_players_in_time_id.append(player_id)
                game.update_pl_hst(player)
                # remove card and send event
                player.deck.remove_card(card)
                
                new_victim_player = game.players_deque[-2]
                send_to_room(room_id, {
                    "event": "transfer_card",
                    "card": payload["card"],
                    "player_id": player_id,
                    "target": new_victim_player.id
                }, socket_id)
                
                s_game = game.serialize()
                room.game_obj = s_game
                room.save()
            
        case "loose_on_time":
            logger.info(f"player[{player_id}] loose on time")

            game.is_end = False

            each_reward = int(room.reward / (game.players_count - 1))

            place_ = 0
            for player in game.players:
                if player.id == player_id:
                    continue
                send_to_room(room_id, {
                    "event": "player_win",
                    "top": place_,
                    "money": each_reward,
                    "player_id": player.id
                })
                place_ += 1

            send_to_room(room_id, {
                "event": "game_over",
                "looser_id": player_id
            })
            
            make_new_room(room_id, game)

        case _:
            send_to_player(player_id, {
                "status": "error",
                "message": "Unknown event"
            })

    if game.is_end:
        game.is_end = False
        player_taked = False

        if not transfered:
            player_taked, cards = game.end()
            logger.info(f"time is end with effect: {'player taked' if player_taked else 'beat cards'}")
        
        if player_taked:
            send_to_room(room_id, {
                "event": "player_taked",
                "cards_count": player.deck.__len__()
            })
            send_to_player(game.victim_player.id, {
                "event": "get_cards",
                "cards": [card.json() for card in cards]
            })
            # take all cards from board
            victim_player = game.get_player(game.victim_player.id)
            for card in cards:
                victim_player.deck.add_card(card)

        elif game.is_bitten:
            send_to_room(room_id, {
                "event": "beat_cards",
                "cards": [card.json() for card in cards]
            })
        
        # give cards for players
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
                
                send_to_player(_id, {
                    "event": "surprise",
                    "cards": [card.json() for card in player_give_cards]  # кидлаю массив игроку!
                })
                send_to_room(room_id, {
                    "event": "give_cards",
                    "player_id": _id,
                    "cards_count": _player.deck.__len__()
                })
        
        # check winner
        winners = game.check_winner()
        
        for winner, place, reward in winners:
            send_to_room(room_id, {
                "event": "player_win",
                "top": place,
                "money": reward,
                "player_id": winner.id
            })
            
        if game.is_total_end():
            send_to_room(room_id, {
                "event": "game_over",
                "looser_id": (set([player.id for player in game.players]) - set(game.rate.values())).pop()
            })
            make_new_room(room_id, game)
        else:
            game.next()
            send_to_room(room_id, {
                "event": "next",
                "walking_player": game.attacker_player.id,
                "victim_player": game.victim_player.id,
                "throwing_players": [player.id for player in game.throwing_players],
                "decKeck": game.deck.__len__(),
                "type": "basic" if not transfered else "transfer"
            })
            logger.info("next time")
            s_game = game.serialize()
            room.game_obj = s_game
            room.save()
    else:
        pass


def make_new_room(room_id: int, game: Game):
    global room_list

    asyncio.create_task(wait_before_new_game())
    
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


room_list = RoomListObserver()
