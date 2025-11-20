import asyncio
from pymongo import MongoClient
from pymongo.server_api import ServerApi
import os
from dotenv import load_dotenv

load_dotenv()
uri = os.getenv("MONGO_URI")

client = MongoClient(uri, server_api = ServerApi('1'))
db = client["code-reviewer-dev"]
