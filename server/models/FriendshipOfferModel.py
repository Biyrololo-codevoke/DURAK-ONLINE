from __future__ import annotations

from .db import db, BaseModel, retry_on_exception


class FriendshipOfferModel(BaseModel):
    __tablename__ = "friendship_offer"
    
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    
    def json(self) -> dict:
        return {
            "id": self.id,
            "sender_id": self.sender_id,
            "receiver_id": self.receiver_id
        }

    @classmethod
    @retry_on_exception()
    def get_by_id(cls, _id):
        return cls.query.filter_by(id=_id).first()
        
    @classmethod
    @retry_on_exception()
    def find_by_receiver_id(cls, receiver_id: int) -> list[FriendshipOfferModel]:
        return cls.query.filter_by(receiver_id=receiver_id).all()