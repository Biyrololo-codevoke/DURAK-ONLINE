import asyncio
import websockets
import json


async def handle(websocket, message):
  try:
    data = json.loads(message)
    print(f"Received: {data}")
    ...
    
  except json.JSONDecodeError:
    print("Error decoding JSON message.")
  except Exception as e:
    print(f"Error handling message: {e}")


async def send(websocket, data):
  try:
    json_data = json.dumps(data)
    await websocket.send(json_data)
    print(f"Sent: {json_data}")
  except Exception as e:
    print(f"Error sending message: {e}")



async def client():
  uri = "ws://localhost:8765" # Replace with your WebSocket server URI

  async with websockets.connect(uri) as websocket:
    # Send an initial message
    await send(websocket, {"message": "Hello from client!"})

    while True:
      try:
        message = await websocket.recv()
        await handle(websocket, message)
      except websockets.exceptions.ConnectionClosedOK:
        print("Connection closed cleanly.")
        break
      except websockets.exceptions.ConnectionClosedError as e:
        print(f"Connection closed with error: {e}")
        break
      except Exception as e:
        print(f"An unexpected error occurred: {e}")
        break

    #Optional: Send a closing message (depends on the server)
    await send(websocket, {"message": "Client disconnecting"})


asyncio.run(client())
