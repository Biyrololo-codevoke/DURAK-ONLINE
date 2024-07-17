from __future__ import annotations

import json
import logging
from http import HTTPStatus

from flask import request as flask_request, Request, make_response, abort


logger = logging.getLogger("api_logger")


def parser_factory(args: dict[str, type | Type | tuple]) -> JSONRequestParser:
    request_parser = JSONRequestParser()
    for key in args.keys():
        if key.startswith("_"):  # "_field": bool -> field: bool, non-required
            field = key[1:]
            required = False
        else:
            field = key
            required = True

        if isinstance(args[key], tuple):  # "field": (Type, handler)
            field_type = args[key][0]
            handler = args[key][1]
            request_parser.add_argument(
                field, field_type=field_type, handler=handler, is_required=required
            )
        elif isinstance(args[key], type) or isinstance(
            args[key], Type
        ):  # "field": Type | type
            request_parser.add_argument(
                field, field_type=args[key], is_required=required
            )
        else:  # "field": BrokenTypeDefinition
            request_parser.add_argument(field, is_required=required)

    return request_parser


class JSONRequestParser:
    def __init__(self) -> None:
        self.fields: set = set()
        self.types: dict = {}
        self.handlers: dict = {}
        self.required: dict = {}
        self.error_log = {}

    def add_argument(
        self,
        field: str,
        *,
        field_type: type | Type | None = None,
        handler: callable = None,
        is_required: bool = True,
    ) -> None:
        self.fields.add(field)
        self.types[field] = field_type
        if handler:
            self.handlers[field] = handler
        self.required[field] = is_required

    def parse_args(self, request: Request = flask_request) -> ArgsDict:
        logger.info("request: " + json.dumps(request.json, indent=4))
        self.error_log = {}
        self._check_request(request)
        self._check_available(request)
        self._check_field_types(request)
        self._check_fields(request)

        if self.error_log:
            response_body = {"errors": self.error_log}
            response = make_response(response_body, HTTPStatus.BAD_REQUEST)
            abort(HTTPStatus.BAD_REQUEST, response=response)

        parsed_args = {}
        for field in self.fields:
            if self.types[field] and request.json.get(field) is not None:
                arg_name = field
                _type = self.types[field]
                typed_arg = _type(request.json[arg_name])
                if issubclass(self.types[field], Type):
                    parsed_args[field] = typed_arg.value
                else:
                    parsed_args[field] = typed_arg

        return ArgsDict(parsed_args)

    @staticmethod
    def _check_request(request: Request) -> None:
        allowed_methods = ["POST", "PUT", "PATCH", "DELETE"]
        if request.method not in allowed_methods:
            abort(HTTPStatus.METHOD_NOT_ALLOWED, "Request method must be in" + str(allowed_methods))

        if not request.is_json:
            abort(HTTPStatus.BAD_REQUEST, "Request must be JSON")

    def _check_available(self, request: Request) -> None:
        # set of request fields must be more than schema fields or equal to it
        if not set(list(request.get_json().keys())) >= self.fields:
            missed_fields = self.fields - set(request.get_json().keys())

            # check is missed fields required
            required_missed_fields = [
                field for field in missed_fields if self.required[field]
            ]
            if required_missed_fields:
                abort(
                    HTTPStatus.BAD_REQUEST,
                    "Request must contain all fields, missed: {}".format(missed_fields),
                )

    def _check_field_types(self, request: Request) -> None | ValueError:
        for field in self.fields:
            if field in self.types:
                _field_value = request.get_json().get(field)
                _field_type = self.types[field]

                if not _field_value:
                    continue

                try:
                    _field_type(_field_value)
                except ValueError as error:
                    if issubclass(_field_type, Type):
                        self.error_log[field] = {
                            "type": _field_type.__err__(f"{field}({_field_value})"),
                            "error": str(error)
                        }
                    else:
                        self.error_log[field] ={
                            "type": "Field %s must be type %s" % (_field_value, str(_field_type)),
                            "error": str(error)
                        }

    def _check_fields(self, request: Request) -> None:
        for field in self.fields:
            if field in self.handlers:
                field_value = request.get_json().get(field)
                if not field_value:
                    continue

                handler = self.handlers[field]
                valid, reason = handler(field_value)

                if not valid:
                    if field not in self.error_log:
                        self.error_log[field] = {}

                    self.error_log[field]["validity"] = reason


class ArgsDict(dict):
    def __getattr__(self, item):
        return self.get(item)


class Type:
    _name_ = "TypeClass"

    @classmethod
    def __err__(cls, field):
        return "%s must be type %s" % (field, cls._name_)


class _MyRangedInt(Type):
    def __getitem__(self, x: tuple[int, int] | int) -> object:
        if isinstance(x, int):
            number_range = (
                min(0, x),  # transform Int[-31] to range[-31, 0]
                max(0, x),
            )  # and Int[5] to range[0, 5]
            return self.gen(number_range)
        elif isinstance(x, tuple) and (type(x[0]) is type(x[1]) is int):
            return self.gen((x[0], x[1]))
        else:
            raise TypeError("Unsupported arguments type.\nSupported: int | (int, int)")

    def gen(self, minmax: tuple[int, int]) -> object:
        _name_ = "Int[%d, %d]" % (minmax[0], minmax[1])

        class RangedInt(int, Type):
            min = minmax[0]
            max = minmax[1]

            def __init__(self, x: int) -> None:
                if not (self.min <= x <= self.max):
                    raise ValueError(
                        f"%d is not in range [%d, %d]" % (x, self.min, self.max)
                    )

                self.value = x

        return RangedInt


class _MyEnum(Type):
    def __getitem__(self, x: tuple[any, ...] | list[any]) -> object:
        return self.gen(list(x))

    def gen(self, _values: list) -> object:
        class MyEnum(Type):
            _name_ = "Enum[%s]" % (", ".join(list(map(str, _values))),)
            values = _values

            def __init__(self, x: str) -> None:
                if x not in self.values:
                    raise ValueError(f"%s is not in %s" % (x, self.values))

                self.value = x

        return MyEnum


class _MyString(Type):
    def __getitem__(self, x: int | tuple[int, int]) -> object:
        if isinstance(x, int):
            line_len_range = (0, x)
        elif isinstance(x, tuple) and isinstance(x[0], int) and isinstance(x[1], int):
            line_len_range = (x[0], x[1])
        else:
            raise TypeError("Unsupported arguments type.\nSupported: int | (int, int)")
        return self.gen(line_len_range)

    def gen(self, x: tuple[int, int]) -> object:
        _min, _max = x

        class MyString(str, Type):
            _name_ = "String[%d, %d]" % (_min, _max)
            min = _min
            max = _max

            def __init__(self, x: str) -> None:
                if not (self.min <= len(x) <= self.max):
                    raise ValueError(
                        f"'%s' length (%d) is not in range [%d, %d]"
                        % (x, len(x), self.min, self.max)
                    )

                self.value = x

        return MyString


Int = _MyRangedInt()
Enum = _MyEnum()
String = _MyString()
