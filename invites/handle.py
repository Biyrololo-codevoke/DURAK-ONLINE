import json
from typing import Callable

from websockets import WebSocketServerProtocol as WebSocket

from utils import serialize
from _logging import logger


user_store: dict[int, WebSocket] = dict()

response_error: Callable[[str], str] = lambda message: serialize({
    "type": "response",
    "status": "error",
    "message": message
})

response_success: Callable[[str], str] = lambda message: serialize({
    "type": "response",
    "status": "success",
    "message": message
})

request_invite: Callable[[str], str] = lambda room_id, inviter_id: serialize({
    "type": "invite",
    "room_id": room_id,
    "inviter_id": inviter_id
})


async def handler(request):
    inviter_id = request["request_author_id"]
    logger.info("new req: " + json.dumps(request, indent=2))
    
    match request.get('type', "None Type"):
        case "invite":
            logger.info("invite type handling...")
            
            target = int(request.get("user_id"))
            room_id = int(request.get("room_id"))
            
            logger.info(f"{target =}, {room_id =}, {inviter_id =}")
            
            if not all([target, room_id]):
                status, res = await send_to_user(
                    inviter_id,
                    response_error("'user_id', 'room_id' are required fields")
                )
                if not status:
                    logger.info("err" + res)
                else:
                    logger.info("er: 400 sended")
                
            elif target not in user_store.keys():
                status, res = await send_to_user(
                    inviter_id,
                    response_error("user is not online")
                )
                if not status:
                    logger.info("err" + res)
                else:
                    logger.info("er: 404 sended")
            else:
                status, res = await send_to_user(
                    target,
                    request_invite(room_id, inviter_id)
                )
                if not status:
                    logger.info("err" + res)
                    await send_to_user(
                        inviter_id,
                        response_error(f"Internal websocket server error: {res}")
                    )
                    logger.info("er: 500 sended")
                    return
                else:
                    await send_to_user(
                        inviter_id,
                        response_success("successfully invite player")
                    )
                    logger.info("scs: 200")

        case unknown_request_type:
            logger.info(f"uknown request type: {unknown_request_type}")
            user_store[inviter_id].send(
                response_error(f"{unknown_request_type :}")
            )


async def send_to_user(user_id: int, payload: dict):
    logger.info(f"send to user: {user_id}, body: " + json.dumps(payload, indent=2))
    
    if not user_id in user_store:
        logger.info("user is not online")
        return False, "User is not online"
    
    try:
        await user_store[user_id].send(payload)
        logger.info("success send")
        return True, "success"
    except Exception as e:
        logger.info(f"error while send: {str(e)}")
        return False, f"Internal websocket server error: {str(e)}"
