from flask import Flask
from flask_restful import Api, Resource
from flask_jwt_extended import JWTManager

from .api_logger import logger


api = Api(prefix="/api")
jwt = JWTManager()


def init_app(app: Flask) -> None:
    api.init_app(app)
    jwt.init_app(app)


class BaseResource(Resource):
    _docs = {}
    logger = logger
    path: str | None = None

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        if cls.path and isinstance(cls.path, str):
            api.add_resource(cls, cls.path)
        else:
            raise TypeError("class must have path property")
    
    @property
    def docs(cls, method):
        return cls._docs[method]

    @classmethod
    def set_docs(cls, method, docs):
        cls._docs[method] = docs


    @classmethod
    def get(cls):
        __doc__ = cls._docs.get("get")

    @classmethod
    def post(cls):
        __doc__ = cls._docs.get("post")

    @classmethod
    def put(cls):
        __doc__ = cls._docs.get("put")

    @classmethod
    def patch(cls):
        __doc__ = cls._docs.get("patch")

    @classmethod
    def delete(cls):
        __doc__ = cls._docs.get("delete")