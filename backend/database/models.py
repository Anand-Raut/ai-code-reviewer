from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class User(BaseModel):
    name: str 
    email: EmailStr
    password_hash: str
    created_at: Optional[datetime] = None


class Question(BaseModel):
    question_text: str = Field(..., max_length=5000)
    drawbacks: List[str] = []
    created_at: Optional[datetime] = None


class Attempt(BaseModel):
    user_id: str
    question_id: str
    code: str
    stats: dict  # Changed from logs
    selected_approach: Optional[dict] = None
    parameters: Optional[str] = None
    feedback_id: str
    resolved_drawback_ids: List[str] = []
    created_at: Optional[datetime] = None


class Drawback(BaseModel):
    drawback_text: str
    created_at: Optional[datetime] = None


class Feedback(BaseModel):
    feedback_text: str
    created_at: Optional[datetime] = None