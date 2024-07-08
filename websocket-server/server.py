import json
import asyncio
import websockets
import threading as th

from handlers import handle_list, handle_room, handle_jwt_token
from data import auth_sockets_id, authed_sockets


async def handle (websocket, path):
    async for message in websocket:
        router(path, message, websocket)


async def router (path, payload, websocket):
    w_id = id(websocket)

    if w_id not in auth_sockets_id:
        thread = th.Thread(
            target=auth_socket, 
            args=(payload, websocket)
        )
        await thread.start()

    if path == "/ws/room/list":
        thread = th.Thread(
            target=handle_list, 
            args=websocket
        )
        await thread.start()

    elif path.startswith("/ws/room/"):
        try:
            room_id = int(path.replace("/ws/room/", ""))
            payload["room_id"] = room_id
            thread = th.Thread(
                target=handle_room,
                args=(payload, websocket)
            )

        except ValueError:
            websocket.send(json.dumps({
                "status": "error",
                "message": "room_id must be int"
            }))

def auth_socket(message, socket):
    if "access_token" not in message.keys():
        socket.send({
            "status": "error",
            "message": "access token wasn't found in request"
        })
    else:
        status, data = handle_jwt_token(message["access_token"])
        if not status:
            socket.send({
                "status": "error",
                "message": data
            })
        else:
            authed_sockets[data] = socket
            auth_sockets_id.append(id(socket))


start_server = websockets.serve(handle, "localhost", 9000)
asyncio.get_event_loop().run_until_complete(start_server)
print("Server listen: localhost:9000")
asyncio.get_event_loop().run_forever()