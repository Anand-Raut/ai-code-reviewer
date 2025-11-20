import asyncio
from database import db

async def init_collections():
    await db.create_collection("users")
    await db.create_collection("questions")
    await db.create_collection("attempts")
    await db.create_collection("drawbacks")
    print("Collections created successfully.")

asyncio.run(init_collections())
