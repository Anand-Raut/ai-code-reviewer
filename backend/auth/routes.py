from fastapi import APIRouter, HTTPException, Depends, status
from database.database import db
from database.schemas import SignupRequest, LoginRequest, TokenResponse, changePasswordRequest, ChangeNameRequest
from .password import hash_password, verify_password
from .jwt import create_access_token
from .dependencies import get_current_user
from datetime import datetime, timezone
from bson import ObjectId

router = APIRouter(prefix='/auth', tags=['auth'])

@router.post("/signup", response_model=TokenResponse)
async def signup(data: SignupRequest):
    if db.users.find_one({"email": data.email}):
        raise HTTPException(status_code=409, detail="Email already registered")

    user = {
        "name": data.name,
        "email": data.email,
        "password_hash": hash_password(data.password),
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

@router.get("/me")
async def get_current_user_info(user_info: dict = Depends(get_current_user)):
    try:
        user_id = user_info["user"]
        print(f"Looking up user_id: {user_id}")
        user = db.users.find_one({"_id": ObjectId(user_id)})
        print(f"Found user: {user}")

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/verify")
async def verify_token_endpoint(user_info: dict = Depends(get_current_user)):
    return {"valid": True, "user_id": user_info["user"]}

@router.post("/change-password")
async def change_password(
    data: changePasswordRequest,
    user_info: dict = Depends(get_current_user)
):
    user_id = user_info["user"]

    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(data.old_password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Old password is incorrect"
        )

    if verify_password(data.new_password, user["password_hash"]):
        raise HTTPException(
            status_code=400,
            detail="New password must be different from old password"
        )

    result = db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"password_hash": hash_password(data.new_password)}}
    )

    if result.modified_count != 1:
        raise HTTPException(
            status_code=500,
            detail="Failed to update password"
        )

    return {"detail": "Password updated successfully"}

@router.post("/change-name")
def change_name(
    data: ChangeNameRequest,
    user_info: dict = Depends(get_current_user)
):
    user_id = user_info["user"]

    result = db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"name": data.new_name}}
    )

    if result.modified_count != 1:
        raise HTTPException(
            status_code=500,
            detail="Failed to update name"
        )

    return {"detail": "Name updated successfully"}