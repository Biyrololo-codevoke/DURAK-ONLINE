from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import json
from typing import Optional, Dict, Any
import os

class MongoDBManager:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MongoDBManager, cls).__new__(cls)
            cls._instance.client = None
            cls._instance.db = None
        return cls._instance
    
    async def connect(self):
        """Connect to MongoDB."""
        if not self.client:
            # Get MongoDB connection details from environment variables
            mongo_user = os.getenv("MONGO_INITDB_ROOT_USERNAME", "root")
            mongo_pass = os.getenv("MONGO_INITDB_ROOT_PASSWORD", "example")
            mongo_host = os.getenv("MONGODB_HOST", "mongodb")
            
            # Create MongoDB connection URL
            mongo_url = f"mongodb://{mongo_user}:{mongo_pass}@{mongo_host}:27017"
            
            self.client = AsyncIOMotorClient(mongo_url)
            self.db = self.client.durak_game
    
    async def save_game_state(self, room_id: str, game_state: Dict[str, Any]) -> str:
        """Save game state to MongoDB."""
        await self.connect()
        
        # Convert game state to JSON-serializable format
        game_state_json = json.loads(json.dumps(game_state, default=str))
        
        # Update or insert game state
        result = await self.db.game_states.update_one(
            {"room_id": room_id},
            {"$set": {"state": game_state_json}},
            upsert=True
        )
        
        return str(result.upserted_id) if result.upserted_id else room_id
    
    async def load_game_state(self, room_id: str) -> Optional[Dict[str, Any]]:
        """Load game state from MongoDB."""
        await self.connect()
        
        # Find game state by room_id
        game_state = await self.db.game_states.find_one({"room_id": room_id})
        
        if game_state:
            return game_state["state"]
        return None
    
    async def delete_game_state(self, room_id: str) -> bool:
        """Delete game state from MongoDB."""
        await self.connect()
        
        result = await self.db.game_states.delete_one({"room_id": room_id})
        return result.deleted_count > 0

# Create singleton instance
mongodb = MongoDBManager()
