from .docs import BaseDocs


class User(BaseDocs):
    path = "/user"

    @classmethod
    def get(cls):
        """
        summary: Get user
        parameters:
          - name: id
            in: query
            description: id of user
            schema:
              type: integer
            required: true
        responses:
          '200':
            description: User
            content:
              application/json:
                schema:
                  type: object
                  properties:
                    user:
                      type: object
                      properties:
                        id:
                          type: integer
                        username:
                          type: string
                        verified:
                          type: boolean
          '404':
            description: User not found
        """

    @classmethod
    def patch(cls):
        """
        summary: Update user
        requestBody:
          content:
            application/json:
              schema:
                type: object
                properties:
                  username:
                    type: string
                    minLength: 4
                    maxLength: 16
                required:
                  - username
        responses:
          '200':
            description: User updated
            content:
              application/json:
                schema:
                  type: object
                  properties:
                    user:
                      type: object
                      properties:
                        id:
                          type: integer
                        username:
                          type: string
                        verified:
                          type: boolean
                        image_id:
                          type: integer
                          nullable: true
          '404':
        security:
          - jwt_auth: []
        """