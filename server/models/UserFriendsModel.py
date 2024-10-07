from __future__ import annotations

from typing import Iterable

from .db import db, BaseModel


class UserFriendsModel(BaseModel):
    __tablename__ = "friend"
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    friend_id = db.Column(db.Integer, db.ForeignKey("user.id"))

    @classmethod
    def get_user_friends(cls, user_id: int):
        data = cls.query.filter_by(user_id=user_id).all()
        if not data:
            return None
        else:
            return [d.friend_id for d in data]
        
    @classmethod
    def remove(cls, user_id: int, friend_id: int):
        cls.query.filter_by(user_id=user_id, friend_id=friend_id).delete()
        cls.query.filter_by(user_id=friend_id, friend_id=user_id).delete()
        db.session.commit()


def make_friendship(user_id: int, friend_id: int):
    f1 = UserFriendsModel(user_id=user_id, friend_id=friend_id)
    f2 = UserFriendsModel(user_id=friend_id, friend_id=user_id)
    f1.save()
    f2.save()
