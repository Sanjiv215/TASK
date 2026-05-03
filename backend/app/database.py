from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config import settings


client: AsyncIOMotorClient | None = None


async def connect_to_mongo() -> None:
    global client
    client = AsyncIOMotorClient(settings.mongodb_uri)
    await client.admin.command("ping")
    await get_database().tasks.create_index([("user_id", 1), ("created_at", -1)])


async def close_mongo_connection() -> None:
    if client is not None:
        client.close()


def get_database() -> AsyncIOMotorDatabase:
    if client is None:
        raise RuntimeError("MongoDB client is not connected")

    return client[settings.mongodb_db]
