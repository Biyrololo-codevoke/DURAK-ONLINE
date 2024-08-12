

async def router (message: dict) -> None:
    event = message.get("event", 0)
    
    match event:
        case "":
            ...
