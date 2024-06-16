from http import HTTPStatus

from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..models import ImageModel, Exceptions as exc

from .api import BaseResource
from .image_handling import handle_image


class ImageUpload(BaseResource):
    path = "/image/upload"

    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()["id"]
        image = request.json.get("image")

        if not image:
            return {"message": "image is not base64 or invalid"}, HTTPStatus.BAD_REQUEST

        try:
            image_path = handle_image(image, user_id)

        except ValueError:
            return {"message": "image is not base64 or invalid"}, HTTPStatus.BAD_REQUEST

        image = ImageModel(
            user_id=user_id, 
            path=image_path
        )
        image.save()

        return {
            "message": "Successfully uploaded image",
            "path": "/api/image/" + str(image.id)
        }, HTTPStatus.CREATED

    @jwt_required()
    @classmethod
    def delete(cls):
        user_id = get_jwt_identity()
        image_id = request.json.get("image_id")

        try:
            ImageModel.delete(user_id, image_id)
        
        except exc.Image.PermissionDenied:
            return {"message": "you don't have permission to delete image"}, HTTPStatus.BAD_REQUEST

        except exc.ImageNotFound:
            return {"message": "image not found"}, HTTPStatus.NOT_FOUND

        return {"message": "Successfully deleted image"}, HTTPStatus.OK
