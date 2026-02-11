from pydantic import BaseModel, EmailStr, Field

class SignupRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., max_length=128)

class changePasswordRequest(BaseModel):
    old_password: str = Field(..., max_length=128)
    new_password: str = Field(..., min_length=8, max_length=128)

class ChangeNameRequest(BaseModel):
    new_name: str = Field(..., min_length=2, max_length=50)