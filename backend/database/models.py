from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class User(BaseModel):
    name: str
    email: EmailStr
    password_hash: str
    email_verified: bool = False
    created_at: Optional[datetime] = None


class Question(BaseModel):
    question_text: str
    created_at: Optional[datetime] = None


class Attempt(BaseModel):
    user_id: str
    question_id: str

    code: str
    logs: dict

    selected_approach: Optional[str] = None

    created_at: Optional[datetime] = None


# class Drawback(BaseModel): #for marking if drawbacks are resolved or not
#     attempt_id: str
#     user_id: str
#     resolved: bool


class Feedback(BaseModel):
    attempt_id: str
    question_id: str
    # drawbacks: List[Drawback]
    created_at: Optional[datetime] = None