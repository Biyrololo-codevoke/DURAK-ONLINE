from .docs import BaseDocs


class Room(BaseDocs):
    path = "/room"

    @classmethod
    def post(cls):
        """
        summary: Create a new room
        requestBody:
          content:
            application/json:
              schema:
                type: object
                properties:
                  reward:
                    type: integer
                  players_count:
                    type: integer
                    minimum: 2
                    maximum: 6
                  cards_count:
                    type: integer
                    enum: [24, 36, 52]
                  speed:
                    type: integer
                    enum: [1, 2]
                  game_type:
                    type: string
                    enum: ["throw", "translate"]
                  throw_type:
                    type: string
                    enum: ["all", "neighborhood"]
                  win_type:
                    type: string
                    enum: ["classic", "draw"]
                  private:
                    type: boolean
                  _password:
                    type: string
                    minLength: 4
                    maxLength: 8
        responses:
          '201':
            description: Room created
            content:
              application/json:
                schema:
                  type: object
                  properties:
                    room:
                      type: object
                      properties:
                        id:
                          type: integer
                        name:
                          type: string
                        reward:
                          type: integer
                        cards_count:
                          type: integer
                        speed:
                          type: integer
                        game_type:
                          type: string
                        throw_type:
                          type: string
                        win_type:
                          type: string
                        private:
                          type: boolean
          '400':
            description: Bad Request
            content:
              application/json:
                schema:
                  type: object
                  properties:
                    error:
                      type: string
          '500':
            description: Internal Server Error
            content:
              application/json:
                schema:
                  type: object
                  properties:
                    error:
                      type: string
                    warning:
                      type: string
        security:
          - jwt_auth: []
        """
