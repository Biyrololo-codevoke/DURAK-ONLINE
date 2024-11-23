import tornado.ioloop
import tornado.web
import tornado.websocket
import tornado.httpserver
from typing import Optional
from tornado.websocket import WebSocketHandler
from ..websocket_logger import logger
from ..utils.authorization import User
from ..models import RoomModel
from ..game import Card, GameManager, GameState

class WebSocketHandler(tornado.websocket.WebSocketHandler):
    path = r"/room/([0-9]+)"

    def open(self):
        user = User(self)
        users.append(user)
        self.user = user
        self.write_message({
            "status": "success",
            "message": "successfully connected. now please authorize yourself by access_token"
        })

    async def on_open(self):
        """Handle WebSocket connection open."""
        if not hasattr(self, 'user') or not self.user:
            return
            
        # Get all rooms where user is a player
        rooms = RoomModel.get_rooms_for_player(self.user.user_id)
        
        for room in rooms:
            if room.game:
                # Handle reconnect in game logic
                room.game.handle_reconnect(self.user.user_id)
                
                # Notify other players
                broadcast_to_room(room.id, {
                    "event": "player_reconnected",
                    "player_id": self.user.user_id
                })
                
                # Send current game state to reconnected player
                self.user.send({
                    "event": "game_state",
                    "state": room.game.get_game_state()
                })
                
                # Save room state
                room.save()

    def on_message(self, message: dict):
        event = message.get("event")
        handle_room_event(event, message, self.user)

    async def on_close(self):
        """Handle WebSocket connection close."""
        if not hasattr(self, 'user') or not self.user:
            return
            
        # Get all rooms where user is a player
        rooms = RoomModel.get_rooms_for_player(self.user.user_id)
        
        for room in rooms:
            if room.game:
                # Handle disconnect in game logic
                game_over_event = room.game.handle_disconnect(self.user.user_id)
                
                if game_over_event:
                    # Player exceeded reconnect limit
                    broadcast_to_room(room.id, game_over_event)
                else:
                    # Normal disconnect, notify other players
                    broadcast_to_room(room.id, {
                        "event": "player_disconnected",
                        "player_id": self.user.user_id
                    })
                
                # Save room state
                room.save()

    def check_origin(self, origin):
        logger.info("origin: " + origin)
        return True


async def handle_game_timeout(room_id: int, player_id: int):
    """Handle game timeout event."""
    room = RoomModel.get_by_id(room_id)
    if not room or not room.game:
        return
        
    # End the game and mark the player as loser
    room.game.state.is_end = True
    room.game.state.timeout_player_id = player_id
    
    # Send timeout notification to all players
    broadcast_to_room(room_id, {
        "event": "game_over",
        "reason": "timeout",
        "loser_id": player_id,
        "message": f"Player {player_id} took too long to make a move"
    })
    
    # Update room state
    room.status = "finished"
    room.save()


def broadcast_to_room(room_id: int, message: dict, exclude_user_id: Optional[int] = None):
    """Send message to all users in the room except excluded user."""
    room = RoomModel.get_by_id(room_id)
    if not room:
        return

    for player in room.players:
        if player.id != exclude_user_id:
            player.send(message)


def handle_room_event(event: str, message: dict, user: User):
    if event != "auth" and not user.auth:
        user.send({
            "status": "error",
            "message": "unauthorized"
        })
        return

    match event:
        case "auth":
            access_token = message.get("access_token")
            if not access_token:
                user.send({
                    "status": "error",
                    "message": "has no token"
                })
            else:
                status, text = user.authorize(access_token)
                user.send({
                    "status": "success" if status else "error",
                    "message": text
                })
                follow(user)

        case "join_room":
            room_id = message.get("room_id")
            if not room_id:
                user.send({
                    "status": "error",
                    "message": "has no room_id"
                })
            else:
                status, text = join_to_room(room_id, user.user_id)
                user.send({
                    "status": "success" if status else "error",
                    "message": text
                })

        case "leave_room":
            room_id = message.get("room_id")
            if not room_id:
                user.send({
                    "status": "error",
                    "message": "has no room_id"
                })
            else:
                status, text = join_to_room(room_id, user.user_id)
                user.send({
                    "status": "success" if status else "error",
                    "message": text
                })

        # Игровые события
        case "place_card":
            room_id = message.get("room_id")
            if not room_id:
                user.send({
                    "status": "error",
                    "message": "room_id not provided"
                })
                return

            room = RoomModel.get_by_id(room_id)
            if not room or not room.game:
                user.send({
                    "status": "error",
                    "message": "game not found"
                })
                return

            # Check if it's player's turn
            if user.user_id != room.game.state.victim_player.id and user.user_id != room.game.state.attacker_player.id:
                user.send({
                    "status": "error",
                    "message": "not your turn"
                })
                return

            card_data = message.get("card")
            slot = message.get("slot")
            if not card_data or slot is None:
                user.send({
                    "status": "error",
                    "message": "invalid card data"
                })
                return

            card = Card(
                suit=card_data["suit"],
                value=card_data["value"],
                is_trump=(card_data["suit"] == room.game.state.trump_suit)
            )

            # Make move and reset timer
            if not room.game.make_move(user, card):
                user.send({
                    "status": "error",
                    "message": "invalid move"
                })
                return

            user.send({"status": "success"})
            broadcast_to_room(room_id, {
                "event": "card_placed",
                "card": card.to_dict(),
                "slot": slot,
                "player_id": user.user_id
            })

        case "pass":
            room_id = message.get("room_id")
            if not room_id:
                user.send({
                    "status": "error",
                    "message": "room_id not provided"
                })
                return

            room = RoomModel.get_by_id(room_id)
            if not room or not room.game:
                user.send({
                    "status": "error",
                    "message": "game not found"
                })
                return

            if user.user_id not in [p.id for p in room.game.state.throwing_players]:
                user.send({
                    "status": "error",
                    "message": "not your turn to pass"
                })
                return

            user.send({"status": "success"})
            broadcast_to_room(room_id, {
                "event": "player_passed",
                "player_id": user.user_id
            })

        case "take":
            room_id = message.get("room_id")
            if not room_id:
                user.send({
                    "status": "error",
                    "message": "room_id not provided"
                })
                return

            room = RoomModel.get_by_id(room_id)
            if not room or not room.game:
                user.send({
                    "status": "error",
                    "message": "game not found"
                })
                return

            # Check if it's the defender's turn
            if user.user_id != room.game.state.victim_player.id:
                user.send({
                    "status": "error",
                    "message": "not your turn to take"
                })
                return

            # Process taking cards
            if not room.game.handle_take_cards(user):
                user.send({
                    "status": "error",
                    "message": "cannot take cards now"
                })
                return

            user.send({"status": "success"})
            
            # Broadcast the take action and next turn
            broadcast_to_room(room_id, {
                "event": "cards_taken",
                "player_id": user.user_id,
                "next_attacker": room.game.state.attacker_player.id,
                "next_defender": room.game.state.victim_player.id
            })

            # Save game state
            room.save()

        case "throw_card":
            room_id = message.get("room_id")
            if not room_id:
                user.send({
                    "status": "error",
                    "message": "room_id not provided"
                })
                return

            room = RoomModel.get_by_id(room_id)
            if not room or not room.game:
                user.send({
                    "status": "error",
                    "message": "game not found"
                })
                return

            card_data = message.get("card")
            if not card_data:
                user.send({
                    "status": "error",
                    "message": "invalid card data"
                })
                return

            card = Card(
                suit=card_data["suit"],
                value=card_data["value"],
                is_trump=(card_data["suit"] == room.game.state.trump_suit)
            )

            if not room.game.state.can_throw or user.user_id not in [p.id for p in room.game.state.throwing_players]:
                user.send({
                    "status": "error",
                    "message": "cannot throw card now"
                })
                return

            user.send({"status": "success"})
            broadcast_to_room(room_id, {
                "event": "card_thrown",
                "card": card.to_dict(),
                "player_id": user.user_id
            })

        case _:
            logger.error(f"unknown event: {event}")
            user.send({
                "status": "error",
                "message": f"unknown event: {event}"
            })