from fastapi import APIRouter, HTTPException
from database.database import db
from database.schemas import SignupRequest, LoginRequest, TokenResponse
from .password import hash_password, verify_password
from .jwt import create_access_token
from datetime import datetime, timezone

router = APIRouter(prefix='/auth', tags=['auth'])

@router.post("/signup", response_model=TokenResponse)
async def signup(data: SignupRequest):
    if db.users.find_one({"email": data.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = {
        "name": data.name,
        "email": data.email,
        "password_hash": hash_password(data.password),
        "email_verified": False,
        "created_at": datetime.now(timezone.utc),
    }

    result = db.users.insert_one(user)
    if not result.acknowledged:
        raise HTTPException(status_code=500, detail="Failed to create user")
    user_id = str(result.inserted_id)

    token = create_access_token(user_id)
    return {"access_token" : token, "token_type": "bearer"}


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest):
    user = db.users.find_one({"email": data.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_id = str(user["_id"])
    token = create_access_token(user_id)
    return {"access_token" : token, "token_type": "bearer"}

