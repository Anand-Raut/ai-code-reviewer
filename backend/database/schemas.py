from pydantic import BaseModel, EmailStr, Field

class SignupRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class changePasswordRequest(BaseModel):
    email: EmailStr
    prev_password: str
    old_password: str

class ChangeNameRequest(BaseModel):
    new_name: str