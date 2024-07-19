from __future__ import annotations

from .db import db
from .UserModel import UserModel


class ImageExceptions:
    class NotFound(Exception):
        pass

    class PermissionDenied(Exception):
        pass


class ImageModel(db.Model):
    __tablename__ = "images"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    path = db.Column(db.String)

    def json(self):
        return {
            "id": self.id,
            "user_id": self.user_id
        }

    @classmethod
    def get_by_id(cls, image_id) -> ImageModel:
         image = cls.query.filter_by(id = image_id).first()

         if not image:
             raise ImageExceptions.NotFound
         else:
             return image
        
    @classmethod
    def delete_user_image(cls, user_id, image_id) -> None:
        image = cls.query.filter_by(id = image_id).first()
        user = UserModel.get_by_id(user_id)

        if not image:
            raise ImageExceptions.NotFound

        if image.user_id != user_id:
            raise ImageExceptions.PermissionDenied
        else:
            user.image_id = None
            user.save()
            image.delete()

    def save(self) -> None:
        db.session.add(self)
        db.session.commit()

    def delete(self) -> None:
        db.session.delete(self)
        db.session.commit()

    
