from .docs import BaseDocs


class Register(BaseDocs):
    path = "/register"

    @classmethod
    def post(cls):
        """
        summary: Register a new user
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
                  password:
                    type: string
                    minLength: 8
                    maxLength: 16
                  email:
                    type: string
                    maxLength: 120
        responses:
          '201':
            description: User created
            content:
              application/json:
                schema:
                  type: object
                  properties:
                    id:
                      type: integer
                    username:
                      type: string
                    verified:
                      type: boolean
          '400':
            description: Fields validation error
            content:
              application/json:    
                schema:
                  type: object
                  properties:
                    errors:
                      type: object
                      properties:
                        field:
                          type: object
                          properties:
                            error:
                              type: string
                              description: The error message for the field
                            type:
                              type: string
                              description: The type of the error for the field
                            validity:
                              type: string
                              description: The validation error message for the field (optional)
          '409':
            description: User already exists
            content:
              application/json:
                schema:
                  type: object
                  properties:
                    message:
                      type: string
          '500':
            description: Internal Server Error
            content:
              application/json:
                schema:
                  type: object
                  properties:
                    message:
                      type: string
        security: []
        """
