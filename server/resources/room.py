from http import HTTPStatus
from uuid import uuid4

from flask_jwt_extended import jwt_required, get_jwt_identity
from flask import request

from ..models import RoomModel, UserModel, Exceptions as exc, Room as RoomType

from .api_logger import logger
from .api import BaseResource
from .utils import parser_factory, Int, String, Enum, verified_user, send_new_room


class Room(BaseResource):
    path = "/room"
    
    @classmethod
    @jwt_required()
    @verified_user
    def get(cls) -> tuple[dict, HTTPStatus]:
        room_id = request.args.get("id")
        logger.info("request to get room %s" % str(room_id))
        try:
            room = RoomModel.get_by_id(room_id)
            return {"room": room.json()}, HTTPStatus.OK
        
        except exc.Room.NotFound:
            return {"error": "Room not found"}, HTTPStatus.NOT_FOUND

    @classmethod
    @jwt_required()
    @verified_user
    def post(cls) -> tuple[dict, HTTPStatus]:
        parser = parser_factory(
            {
                "reward": int,
                "players_count": Int[2, 6],
                "cards_count": Enum[24, 36, 52],
                "speed": Enum[1, 2],
                "game_type": Enum["throw", "translate"],
                "throw_type": Enum["all", "neighborhood"],
                "win_type": Enum["classic", "draw"],
                "private": bool,
                "_password": String[4, 8],
            }
        )

        args = parser.parse_args()
        author_id = get_jwt_identity()["id"]
        
        player = UserModel.get_by_id(author_id)
        if player and player.money < args["reward"]:
            return {"error": "not enough money"}, HTTPStatus.BAD_REQUEST

        if args.private and not args.password:
            return {
                "error": "password is required for private rooms"
            }, HTTPStatus.BAD_REQUEST

        room: RoomModel | None = None

        try:
            room = RoomModel(**args)
            room.game_state = RoomType.RoomState.OPEN
            room.save()

            key = "athr" + uuid4().hex + "_" + str(author_id)

            send_new_room(room.id, author_id, key)

            return {
                "room": room.json(),
                "key": key
            }, HTTPStatus.CREATED

        except exc.DBError as e:
            if room:
                cls.logger.error(
                    "user was not added to room.\nArgs: %s\nError: %s" % (str(args), e)
                )
                return {
                    "room": room.json(),
                    "warning": "Cause some error. User was not added to room.",
                }, HTTPStatus.CREATED
            else:
                cls.logger.critical(
                    "Room was not created.\nArgs: %s\nError: %s" % (str(args), e)
                )
                return {
                    "error": "Cause some error. Room was not created."
                }, HTTPStatus.INTERNAL_SERVER_ERROR
