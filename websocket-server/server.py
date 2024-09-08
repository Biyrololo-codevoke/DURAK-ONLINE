import asyncio
import http
import json
import typing
import email.utils

import websockets
from websockets import WebSocketServerProtocol as WebSocket, serve as make_websocket_server
from websockets.exceptions import ConnectionClosed, InvalidHandshake, InvalidUpgrade, InvalidOrigin, AbortHandshake
from websockets.asyncio.compatibility import asyncio_timeout
from websocket_logger import logger

from event_handling.data import socket_identity, user_socket
from event_handling import serialize, deserialize, router, auth_socket
from event_handling.utils import handle_socket_closing


async def socket_listener(socket: WebSocket, path: str):
    socket_id = id(socket)
    auth = False

    if path.startswith("/ws/room?"):
        await router(path, {"event": "join_room"}, socket)

        async for message in socket:
            await router(path, deserialize(message), socket)

    async for message in socket:
        payload = deserialize(message)

        # auth
        if not auth:
            auth, message = auth_socket(payload)
            await socket.send(serialize(message))
            if auth:
                user_id = int(message["user_id"])
                # save socket with user_id (two dicts for useful)
                socket_identity[socket_id] = user_id
                user_socket[user_id] = socket

        # post auth event handling ( if auth was success )
        if auth:
            await router(path, payload, socket)


class MyWebsocketServerProtocol(WebSocket):
    async def handler(self) -> None:
        """
        Handle the lifecycle of a WebSocket connection.

        Since this method doesn't have a caller able to handle exceptions, it
        attempts to log relevant ones and guarantees that the TCP connection is
        closed before exiting.

        """
        try:
            try:
                async with asyncio_timeout(self.open_timeout):
                    await self.handshake(
                        origins=self.origins,
                        available_extensions=self.available_extensions,
                        available_subprotocols=self.available_subprotocols,
                        extra_headers=self.extra_headers,
                    )
            except asyncio.TimeoutError:  # pragma: no cover
                self.handle_close()
            except ConnectionError:
                raise
            except Exception as exc:
                if isinstance(exc, AbortHandshake):
                    status, headers, body = exc.status, exc.headers, exc.body
                elif isinstance(exc, InvalidOrigin):
                    if self.debug:
                        self.logger.debug("! invalid origin", exc_info=True)
                    status, headers, body = (
                        http.HTTPStatus.FORBIDDEN,
                        websockets.Headers(),
                        f"Failed to open a WebSocket connection: {exc}.\n".encode(),
                    )
                elif isinstance(exc, InvalidUpgrade):
                    if self.debug:
                        self.logger.debug("! invalid upgrade", exc_info=True)
                    status, headers, body = (
                        http.HTTPStatus.UPGRADE_REQUIRED,
                        websockets.Headers([("Upgrade", "websocket")]),
                        (
                            f"Failed to open a WebSocket connection: {exc}.\n"
                            f"\n"
                            f"You cannot access a WebSocket server directly "
                            f"with a browser. You need a WebSocket client.\n"
                        ).encode(),
                    )
                elif isinstance(exc, InvalidHandshake):
                    if self.debug:
                        self.logger.debug("! invalid handshake", exc_info=True)
                    exc_chain = typing.cast(BaseException, exc)
                    exc_str = f"{exc_chain}"
                    while exc_chain.__cause__ is not None:
                        exc_chain = exc_chain.__cause__
                        exc_str += f"; {exc_chain}"
                    status, headers, body = (
                        http.HTTPStatus.BAD_REQUEST,
                        websockets.Headers(),
                        f"Failed to open a WebSocket connection: {exc_str}.\n".encode(),
                    )
                else:
                    self.logger.error("opening handshake failed", exc_info=True)
                    status, headers, body = (
                        http.HTTPStatus.INTERNAL_SERVER_ERROR,
                        websockets.Headers(),
                        (
                            b"Failed to open a WebSocket connection.\n"
                            b"See server log for more information.\n"
                        ),
                    )

                headers.setdefault("Date", email.utils.formatdate(usegmt=True))
                if self.server_header:
                    headers.setdefault("Server", self.server_header)

                headers.setdefault("Content-Length", str(len(body)))
                headers.setdefault("Content-Type", "text/plain")
                headers.setdefault("Connection", "close")

                self.write_http_response(status, headers, body)
                self.logger.info(
                    "connection rejected (%d %s)", status.value, status.phrase
                )
                await self.close_transport()
                return

            try:
                await self.ws_handler(self)
            except Exception:
                self.logger.error("connection handler failed", exc_info=True)
                if not self.closed:
                    self.fail_connection(1011)
                raise

            try:
                await self.close()
            except ConnectionError:
                raise
            except Exception:
                self.logger.error("closing handshake failed", exc_info=True)
                raise

        except Exception:
            # Last-ditch attempt to avoid leaking connections on errors.
            try:
                self.transport.close()
            except Exception:  # pragma: no cover
                pass

        finally:
            # Unregister the connection with the server when the handler task
            # terminates. Registration is tied to the lifecycle of the handler
            # task because the server waits for tasks attached to registered
            # connections before terminating.
            self.ws_server.unregister(self)
            self.logger.info("connection closed")

    def handle_close(self) -> None:
        print("closing")
        pass


start_server = make_websocket_server(socket_listener, "0.0.0.0", 9000, kclass=MyWebsocketServerProtocol)
