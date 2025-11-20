from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class User(BaseModel):
    name: str
    email: EmailStr
    password_hash: str
    email_verified: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class Question(BaseModel):
    question_text: str
    created_at: Optional[datetime] = None

class Attempt(BaseModel):
    user_id: str
    question_id: str
    created_at: Optional[datetime] = None

class Drawback(BaseModel):
    attempt_id: str
    question_id: str
    drawback_text: str
    created_at: Optional[datetime] = None
