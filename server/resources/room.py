from http import HTTPStatus

from flask_jwt_extended import jwt_required, get_jwt_identity

from ..models import RoomModel, UserModel, Exceptions as exc

from .api import BaseResource
from .utils import parser_factory, Int, String, Enum, verified_user


class Room(BaseResource):
    path = "/room"

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

        if args.private and not args.password:
            return {
                "error": "password is required for private rooms"
            }, HTTPStatus.BAD_REQUEST

        room: RoomModel | None = None
        try:
            room = RoomModel(**args)
            room.save()

            author = UserModel.get_by_id(get_jwt_identity()["id"])
            room.add_player(author.id)

            return {"room": room.json()}, HTTPStatus.CREATED

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
