# !bin/bash

docker compose up -d --build websocket-server --no-deps
docker compose logs -f websocket-server