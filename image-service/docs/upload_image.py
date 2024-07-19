from .docs import BaseDocs


class UploadImage(BaseDocs):
    path = "/image/upload"

    @classmethod
    def post(cls):
        """
        summary: upload images
        requestBody:
          content:
            application/json:
              schema:
                type: object
                properties:
                  image:
                    type: string(base64)
        responses:
          '201':
            description: Successfully uploaded image
            content:
              application/json:
                schema:
                  type: object
                  properties:
                    id:
                      type: integer
                    user_id:
                      type: integer
                    path:
                      type: string
          '400':
            description: image is not base64 or invalid
            content:
              application/json:
                schema:
                  type: object
                  properties:
                    message:
                      type: string
          '401':
            description: unauthorized
            content:
              application/json:
                schema:
                  type: object
                  properties:
                    message:
                      type: string
        security:
          - jwt_auth: []
        """

    @classmethod
    def delete(cls):
        """
        summary: delete uploaded image by id
        requestBody:
          content:
            application/json:
              schema:
                type: object
                properties:
                  image_id:
                    type: integer
        responses:
          '200':
            description: Successfully deleted image
            content:
              application/json:
                schema:
                  type: object
                  properties:
                    message:
                      type: string
          '400':
            description: you don't have permission to delete image
            content:
              application/json:
                schema:
                  type: object
                  properties:
                    message:
                      type: string
          '401':
            description: unauthorized
            content:
              application/json:
                schema:
                  type: object
                  properties:
                    message:
                      type: string
          '404':
            description: image not found
            content:
              application/json:
                schema:
                  type: object
                  properties:
                    message:
                      type: string
        security:
          - jwt_auth: []
        """