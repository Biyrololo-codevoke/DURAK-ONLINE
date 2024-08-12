import aiohttp
import random
from string import ascii_letters as letters

from logger import logger


PREFIX = "bot_"
SERVER = "https://codevoke.ru"
API_URL = SERVER + "/api"


def strgen() -> str:
    return random.choices(letters, k=10)


def make_profile() -> dict:
    username = PREFIX + strgen()
    password = PREFIX + strgen()
    email = strgen.lower() + "." + username + "@bot-factory.com"
    return { "username": username, "password": password, "email": email }


async def register_user() -> str:
    make_bot_profile = make_profile()
    register_endpoint = API_URL + "/user/register"
    
    with aiohttp.ClientSession() as session:
        async with session.post(register_endpoint, json=make_bot_profile) as resp:
            if resp.status == 200:
                payload = await resp.json()
                return payload["access_token"]
            else:
                logger.info("Failed to register user: " + str(resp.status))
