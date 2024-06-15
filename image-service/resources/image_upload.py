from http import HTTPStatus

from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import ImageModel, Exceptions as exc

from .api import BaseResource
from .image_handling import handle_image


class ImageUpload(BaseResource):
    path = "/api/image"

    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        image = request.json.get("image")

        if not image:
            return {"message": "image is not base64 or invalid"}, HTTPStatus.BAD_REQUEST

        try:
            image_path = handle_image(image)

        except ValueError:
            return {"message": "image is not base64 or invalid"}, HTTPStatus.BAD_REQUEST

        image = ImageModel(user_id, image_path)
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
            image = ImageModel.query.filter_by(
                id = image_id
            ).first()

            if image.user_id != user_id:
                return {"message": "you don't have permission to delete image"}, HTTPStatus.BAD_REQUEST

        except exc.ImageNotFound:
            return {"message": "image not found"}, HTTPStatus.NOT_FOUND

        image.delete()
        return {"message": "Successfully deleted image"}, HTTPStatus.OK
