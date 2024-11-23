from http import HTTPStatus

from .api import BaseResource
from .api_logger import logger
from ..models import FriendshipOfferModel, UserFriendsModel, make_friendship

from flask import request
from flask_jwt_extended import get_jwt_identity, jwt_required, verify_jwt_in_request


class Friend(BaseResource):
    path = "/friend/offer"
    
    @classmethod
    @jwt_required()
    def get(cls):
        user_id: int = int(get_jwt_identity()["id"])
        offers = FriendshipOfferModel.find_by_receiver_id(user_id)
        return {"offers": [offer.json() for offer in offers]}, HTTPStatus.OK
    
    @classmethod
    def post(cls):
        logger.info("post")
        verify_jwt_in_request()
        sender_id: int = int(get_jwt_identity()["id"])
        receiver_id: int = request.json.get("friend_id")
        logger.info("posta 1")
        if not receiver_id:
            return {"missed 'friend_id' arg"}, HTTPStatus.BAD_REQUEST

        logger.info("post 2")
        receiver_id = int(receiver_id)

        logger.info("post 3")
        offer = FriendshipOfferModel(
            sender_id=sender_id,
            receiver_id=receiver_id
        )
        offer.save()
        logger.info("post 4")
        return {"message": "request successfully created"}, HTTPStatus.CREATED
        
    @classmethod
    @jwt_required()
    def patch(cls):
        user_id = int(get_jwt_identity()["id"])
        offer_id = request.json.get("offer_id")
        status = request.json.get("status")
        if not offer_id or status not in ("accepted", "rejected"):
            return {"message": "idi nahuy argi zabyl"}, HTTPStatus.BAD_REQUEST
        
        offer = FriendshipOfferModel.get_by_id(offer_id)
        if not offer:
            return {"404":"404"}, HTTPStatus.NOT_FOUND
            
        if offer.receiver_id != user_id:
            return {"access": "denied"}, HTTPStatus.FORBIDDEN
        
        if status == "rejected":
            offer.delete()
            return {"message": "successfully rejected"}, HTTPStatus.OK
        else:
            make_friendship(
                offer.sender_id, offer.receiver_id
            )
            offer.delete()
            return {"message": "create friendship"}, HTTPStatus.CREATED


class FriendList2(BaseResource):
    path = "/friend/list"
    
    @classmethod
    @jwt_required()
    def get(cls):
        user_id: int = int(get_jwt_identity()["id"])
        return {"friends": UserFriendsModel.get_user_friends(user_id)}, HTTPStatus.OK

    @classmethod
    @jwt_required()
    def post(cls):
        user_id = int(get_jwt_identity()["id"])
        friend_id = request.json.get("friend_id")
        
        if not friend_id:
            return {"missed 'friend_id' arg"}, HTTPStatus.BAD_REQUEST
        
        friend_id = int(friend_id)
        UserFriendsModel.remove(user_id, friend_id)
        return {"message": "deleted"}, HTTPStatus.OK
