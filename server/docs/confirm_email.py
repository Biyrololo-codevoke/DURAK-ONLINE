from .docs import BaseDocs


class ConfirmEmail(BaseDocs):
    path = "/confirm_email"

    @classmethod
    def post(cls):
        """
        summary: confirm user email by code
        requestBody:
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: string
                    minLength: 6
                    maxLength: 6
        responses:
          '200':
            description: Successfully confirmed
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
          '400':
            description: code is invalid
            content:
              application/json:
                schema:
                  type: object
                  properties:
                    message:
                      type: string
          '404':
            description: authorized user not found
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
