from flask import Flask, Response, send_file

from .upload_image import UploadImage
from .image import Image


def init_app(app: Flask) -> None:
    conf = """
openapi: 3.0.3
info:
  title: Durak Online [images] - OpenAPI 3.0
  description: API for image service
  contact:
    email: durak2.online@yandex.ru
  license:
    name: Apache 2.0
    url: https://www.apache.org/licenses/LICENSE-2.0.html
  version: 1.0.1
  
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
        for DocsClass in [UploadImage, Image]:
            file.write(DocsClass.gen_docs() + "\n")

    app.add_url_rule("/api/image/docs/openapi", view_func=openapi)
    app.add_url_rule("/api/image/docs", view_func=docs)


def openapi() -> Response:
    return send_file("docs/OpenAPI.yaml", mimetype="text/yaml")


def docs() -> Response:
    return send_file("docs/template.html", mimetype="text/html")