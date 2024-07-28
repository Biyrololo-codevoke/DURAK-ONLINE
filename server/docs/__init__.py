from flask import Flask, Response, send_file

from .login import Login
from .register import Register
from .room import Room
from .user import User
from .confirm_email import ConfirmEmail


def init_app(app: Flask) -> None:
    conf = """
openapi: 3.0.3
info:
  title: Durak Online - OpenAPI 3.0
  description: simple game server API
  contact:
    email: durak2.online@yandex.ru
  license:
    name: Apache 2.0
    url: https://www.apache.org/licenses/LICENSE-2.0.html
  version: 1.0.11
  
servers:
  - url: /api
  
components:
  securitySchemes:
    jwt_auth:
      type: http
      scheme: bearer

paths:
"""
    with open("docs/OpenAPI.yaml", "w+") as file:
        file.write(conf)
        for DocsClass in [Login, Register, Room, User, ConfirmEmail]:
            file.write(DocsClass.gen_docs() + "\n")

    app.add_url_rule("/api/docs/openapi", view_func=openapi)
    app.add_url_rule("/api/docs", view_func=docs)


def openapi() -> Response:
    return send_file("docs/OpenAPI.yaml", mimetype="text/yaml")


def docs() -> Response:
    return send_file("docs/template.html", mimetype="text/html")
