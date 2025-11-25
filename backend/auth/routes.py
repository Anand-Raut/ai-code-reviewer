from fastapi import APIRouter, HTTPException, Depends
from database.database import db
from database.schemas import SignupRequest, LoginRequest, TokenResponse
from .password import hash_password, verify_password
from .jwt import create_access_token
from .dependencies import get_current_user
from datetime import datetime, timezone
from bson import ObjectId

router = APIRouter(prefix='/auth', tags=['auth'])

@router.post("/signup", response_model=TokenResponse)
async def signup(data: SignupRequest):
    if await db.users.find_one({"email": data.email}):
        raise HTTPException(status_code=409, detail="Email already registered")

    user = {
        "name": data.name,
        "email": data.email,
        "password_hash": hash_password(data.password),
        "email_verified": False,
        "created_at": datetime.now(timezone.utc),
    }

    result = await db.users.insert_one(user)
    if not result.acknowledged:
        raise HTTPException(status_code=500, detail="Failed to create user")
    user_id = str(result.inserted_id)

    token = create_access_token(user_id)
    return {"access_token" : token, "token_type": "bearer"}

@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest):
    user = await db.users.find_one({"email": data.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user_id = str(user["_id"])
    token = create_access_token(user_id)
    return {"access_token" : token, "token_type": "bearer"}

@router.get("/me")
async def get_current_user_info(user_id: str = Depends(get_current_user)):
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/verify")
async def verify_token_endpoint(user_id: str = Depends(get_current_user)):
    return {"valid": True, "user_id": user_id}