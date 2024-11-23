from uuid import uuid4

from .User import User
from .Room import Room


users: set[User] = set()
rooms: set[Room] = dict()
update_followers: set[User] = set()


def get_user_by_id(_id) -> User | None:
    global users
    
    for user in users:
        if user.auth and user.user_id == _id:
            if not user.is_ws_active:
                users.remove(user)
                return None
            else:
                return user


def get_room_by_id(_id) -> Room | None:
    global rooms
    for room in rooms:
        if room.id == _id:
            return room


def send_to_user(user_id: int, message: dict) -> bool:
    global users

    user = get_user_by_id(user_id)
    if user:
        user.send(message)
        return True
    else:
        return False
        

def send_to_room(room_id: int, message: dict) -> bool:
    global room_players

    room = get_room_by_id(room_id)
    if room:
        for user in room[room_id]:
            if user.is_ws_active:
                user.send(message)
            else:
                room[room_id].remove(user)
                send_to_room(room_id, {
                    "event": "leave_room",
                    "user_id": user.user_id
                })
    else:
        return False


def add_to_room(room_id: int, user_id: int) -> bool:
    global users, room_players
    
    user = get_user_by_id(user_id)
    
    if user and room_id in room_players.keys():
        room_players[room_id].add(user)
        return True
    else:
        return False


def follow(user: User):
    global update_followers
    update_followers.add(user)
    

def unfollow(user: User):
    global update_followers
    update_followers.remove(user)


def join_to_room(room_id: int, user_id: int, password: str = None) -> tuple[bool, str]:
    global users, room_players
    user = get_user_by_id(user_id)
    room = get_room_by_id(room_id)
    
    if not user:
        return False, "User not found"
    
    if not room:
        return False, "Room not found"
    
    if password != room.password:
        return False, "Wrong password"
    
    if user in room_players[room_id]:
        return False, "Already joined"
    
    # TODO: make generation acess keys
    
    room_players[room_id].add(user)
    return True, "Joined successfully"
        

def add_room(room: Room):
    global rooms
    rooms.add(room)
    notify()


def notify():
    global update_followers

    for user in update_followers:
        user.send({"event": "notify"})  # TODO: send list
