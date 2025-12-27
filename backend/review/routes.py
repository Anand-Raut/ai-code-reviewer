from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Union
from auth.dependencies import get_current_user
from database.database import db
from datetime import datetime, timezone
from ai.service import get_approaches, get_feedback
import json


router = APIRouter(prefix='/api', tags=["review"])

class Approach(BaseModel):
    title: str
    description: str

class ApproachSelect(BaseModel):
    approach: Approach
    code: str
    question: str
    stats: Dict[str, Any]
    language: str
    parameters: str
    
class ApproachRequest(BaseModel):
    code: str
    language: str
    question: str
    parameters: str

class ApproachesResponse (BaseModel):
    approaches: List[Approach]

class drawback (BaseModel):
    drawback_text: str

class Feedback (BaseModel):
    feedback_text: str
    drawbacks: List[drawback]


@router.post("/getapproaches", response_model=Union[ApproachesResponse, None])
def select_approach (request: ApproachRequest, current_user: dict = Depends(get_current_user)):
    
    try:
        raw = get_approaches(request.question, request.code)
        data = json.loads(raw)
        print(data)
        return ApproachesResponse (
            approaches=data["approaches"]
        )
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/approachselect", response_model=Feedback)
async def select_approach(request: ApproachSelect, current_user: dict = Depends(get_current_user)):
    #Store data in the DB
    question = {
        "question_text": request.question
    }
    result1 = db.Questions.insert_one(question)

    if not result1.acknowledged:
        print("Failed to store the question in the database")
    else:
        question_id = result1.inserted_id

        attempt = {
            "user_id" :  current_user["user"],
            "question_id": question_id,
            "code" :  request.code,
            "stats":  request.stats,
            "selected_approach": request.approach.model_dump(),
            "created_at": datetime.now(timezone.utc)
        }

        result2 = db.Attempts.insert_one(attempt)
        if not result2.acknowledged:
            print("Failed to store the question in the database")


    # Get drawbacks etc for the code and the approach.
    # class Drawback(BaseModel):
    #     attempt_id: str
    #     question_id: str
    #     drawback_text: str
    #     created_at: Optional[datetime] = None

    # AI should return drawback list, and a feedback text
    # TODO: Replace with actual AI-generated feedback
    sample_drawbacks = [
        drawback(drawback_text="Inefficient nested loop structure increases time complexity to O(n²)"),
        drawback(drawback_text="No input validation - code will crash with empty arrays"),
        drawback(drawback_text="Variable names like 'temp' and 'x' are not descriptive"),
        drawback(drawback_text="Missing edge case handling for negative numbers"),
        drawback(drawback_text="Code lacks comments explaining the algorithm logic")
    ]
    
    feedback_response = Feedback(
        feedback_text="Your solution demonstrates understanding of the problem, but there are several areas for improvement. Consider optimizing the nested loops and adding input validation.",
        drawbacks=sample_drawbacks
    )

    return feedback_response