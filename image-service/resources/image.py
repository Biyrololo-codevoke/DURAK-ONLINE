from http import HTTPStatus
import logging

from io import BytesIO

from flask import send_file

from ..models import ImageModel, Exceptions as exc

from .api import BaseResource


logger = logging.getLogger("image service logger")


class Image(BaseResource):
    path = "/image/<int:image_id>"
    
    def get(self, image_id):        
        try:
            logger.info("image_id: %d" % image_id)
            image = ImageModel.get_by_id(image_id)

            with open(image.path, "rb") as file:
                image_bytes = file.read()
            byte_io = BytesIO(image_bytes)

            return send_file(byte_io, mimetype="image/jpg")

        except exc.Image.NotFound:
            return {"message": "image not found"}, HTTPStatus.NOT_FOUND