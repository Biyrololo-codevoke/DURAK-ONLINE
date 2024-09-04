from http import HTTPStatus

from .api import BaseResource
from ..models import FriendshipOfferModel, UserFriendsModel

from flask_jwt_extended import get_jwt_identity, jwt_required


class Friendship(BaseResource):
    path = "/friendship/offer"
    
    @classmethod
    @jwt_required()
    def get(cls):
        user_id: int = int(get_jwt_identity())
        offers = FriendshipOfferModel.find_by_receiver_id(user_id)
        return {"offers": [offer.json() for offer in offers]}, HTTPStatus.OK
    
    @classmethod
    @jwt_required()
    def post(cls):
        sender_id: int = int(get_jwt_identity())
        receiver_id: int = request.json.get("friend_id")
        
        if not receiver_id:
            return {"missed 'friend_id' arg"}
        receiver_id = int(receiver_id)
        offer = FriendshipOfferModel(
            sender_id=sender_id,
            receiver_id=receiver_id
        )
        offer.save()
        return {"message": "request successfully created"}, HTTPStatus.CREATED
        
    @classmethod
    @jwt_required()
    def patch(cls):
        user_id = int(get_jwt_identity())
        offer_id = request.json.get("offer_id")
        status = request.json.get("status")
        if not offer_id or status not in ("accepted", "rejected"):
            return {"message": "idi nahuy argi zabyl"}, HTTPStatus.BAD_REQUEST
        
        offer = riendshipOfferModel.get_by_id(offer_id)
        if not offer:
            return {"404":"404"}, HTTPStatus.NOT_FOUND
            
        if offer.receiver_id != user_id:
            return {"access": "denied"}, HTTPStatus.FORBIDDEN
        
        if status == "rejected":
            offer.delete()
            return {"message": "successfully rejected"}, HTTPStatus.OK
        else:
            UserFriendsModel.make_friendship(
                offer.sender_id, offer.receiver_id
            )
            return {"message": "create friendship"}, HTPStatus.CREATED        

class Friends(BaseResource):
    path = "/friendship/friends"
    
    @classmethod
    @jwt_required()
    def get(cls):
        user_id: int = int(get_jwt_identity())
        return UserFriendsModel.get_user_friends(user_id)