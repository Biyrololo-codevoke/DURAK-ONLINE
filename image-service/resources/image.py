from http import HTTPStatus

from flask import send_file
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..models import ImageModel, Exceptions as exc

from .api import BaseResource


class Image(BaseResource):
    path = "/api/image/<int:image_id>"
    
    @jwt_required()
    def get(self, image_id):
        user_id = get_jwt_identity()
        
        try:
            image = ImageModel.query.filter_by(
                id = image_id, 
                user_id = user_id
            ).first()
            
            with open(image.path, "rb") as file:
                image_bytes = file.read()

            return send_file(image_bytes, mimetype="image/jpg")

        except exc.Image.NotFound:
            return {"message": "image not found"}, HTTPStatus.NOT_FOUND