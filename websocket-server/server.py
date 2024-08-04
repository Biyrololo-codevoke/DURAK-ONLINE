import json

from websockets import WebSocketServerProtocol as WebSocket, serve as make_websocket_server
from websockets.exceptions import ConnectionClosed

from websocket_logger import logger

from event_handling.data import socket_identity, user_socket
from event_handling import serialize, deserialize, router, auth_socket


async def socket_listener(socket: WebSocket, path: str):
    try:
        socket_id = id(socket)
        logger.info(f"{socket.remote_address}[id: {socket_id}] -> {path}")
        auth = False
        
        if path.startswith("/ws/room?"):
            await router(path, {"event": "join_room"}, socket)

            async for message in socket:
                logger.info(f"message: {json.dumps(json.loads(message), indent=2)}")
                await router(path, deserialize(message), socket)

        async for message in socket:
            payload = deserialize(message)
            logger.info(f"message: {json.dumps(payload, indent=2)}")

            # auth
            if not auth:
                auth, message = auth_socket(payload)
                await socket.send(serialize(message))
                if auth:
                    user_id = int(message["user_id"])
                    # save socket with user_id (two dicts for useful)
                    socket_identity[socket_id] = user_id
                    user_socket[user_id] = socket

            # post auth event handling ( if auth was success )
            if auth:
                await router(path, payload, socket)

    # Обработка закрытия соединения
    except ConnectionClosed as e:
        logger.info(f"Connection closed: code={e.code}, reason='{e.reason}'")
        match e.code:
            case 1000:
                logger.info("Connection closed normally")
            case 1001:
                logger.info("пиздюк свалил куда-то")
            case 1002:
                logger.info("пиздюк нарушил протокол")
            case 1003:
                logger.info("пиздюк не по русски базарит")
            case 1004:
                logger.info("зарезервировано нахуй")
            case 1005:
                logger.info("пиздюк свалил без подтверждения")
            case 1006:
                logger.info("у пиздюка проблемы с инетом")
            case 1007:
                logger.info("пиздюк напиздел")
            case 1008:
                logger.info("пиздюк оказался хохлом")
            case 1009:
                logger.info("пиздюк слишком много и долго болтает")
            case 1010:
                logger.info("пиздюк ждал ксиву")
            case 1011:
                logger.info("ПИЗДЕЦ НА КОРАБЛЕ")
            case 1015:
                logger.info("пиздюк не защищается")
            case _:
                logger.info(f"Connection closed with unknown code: {e.code}")

start_server = make_websocket_server(socket_listener, "0.0.0.0", 9000)
