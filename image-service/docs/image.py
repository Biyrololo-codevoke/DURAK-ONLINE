from .docs import BaseDocs


class Image(BaseDocs):
    path = "/image/<image_id:int>"

    @classmethod
    def get(cls):
        """
        summary: get image by id
        parameters:
          - in: query
            name: image_id
            schema:
              type: integer
        responses:
          '200':
            description: Successfully get image
            content:
              application/json:
                schema:
                  type: object
                  properties:
                    image:
                      type: file
          '404':
            description: image not found
            content:
              application/json:
                schema:
                  type: object
                  properties:
                    message:
                      type: string
        """