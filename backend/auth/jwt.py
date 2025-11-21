from datetime import datetime, timedelta, timezone
from jose import jwt
import os
from dotenv import load_dotenv
load_dotenv()

SECRET=os.getenv("SECRET")
ALGORITHM=os.getenv("ALGORITHM")

def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=3)
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, SECRET, algorithm=ALGORITHM)

def verify_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, SECRET, algorithms=[ALGORITHM])
    except:
        return None