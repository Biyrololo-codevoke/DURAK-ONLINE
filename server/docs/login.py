from .docs import BaseDocs


class Login(BaseDocs):
    path = "/login"

    @classmethod
    def post(cls):
        """
        summary: User login
        requestBody:
          content:
            application/json:
              schema:
                type: object
                properties:
                  email:
                    type: string
                    maxLength: 120
                  password:
                    type: string
                    minLength: 4
                    maxLength: 16
        responses:
          '200':
            description: Successful login
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
                          default: false
                    access_token:
                      type: string
          '400':
            description: password is incorrect
            content:
              application/json:
                schema:
                  type: object
                  properties:
                    message:
                      type: string
          '404':
            description: login is incorrect (user is not registered)
            content:
              application/json:
                schema:
                  type: object
                  properties:
                    message:
                      type: string
          '500':
            description: internal server error
            content:
              application/json:
                schema:
                  type: object
                  properties:
                    message:
                      type: string
        security: []
        """
