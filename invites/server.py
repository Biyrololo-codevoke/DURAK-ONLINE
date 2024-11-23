from websockets import WebSocketServerProtocol as WebSocket, serve as make_websocket_server

from handle import user_store, handler
from utils import serialize, deserialize, auth_socket
from _logging import logger


async def socket_listener(socket: WebSocket, path: str):
    auth = False
    user_id = None
    
    if path != "/invites":
        return
    
    async for message in socket:
        payload = deserialize(message)

        if not auth:
            auth, message = auth_socket(payload)
            await socket.send(serialize(message))
            if auth:
                user_id = int(message["user_id"])
                user_store[user_id] = socket
        else:
            payload.update({
                "request_author_id": user_id
            })
            await handler(payload)


start_server = make_websocket_server(socket_listener, "0.0.0.0", 9100)
