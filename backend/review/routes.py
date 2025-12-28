from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Union
from auth.dependencies import get_current_user
from database.database import db
from datetime import datetime, timezone
from ai.service import get_approaches, get_feedback
from bson import ObjectId


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

class Drawback (BaseModel):
    drawback_text: str

class Feedback (BaseModel):
    feedback_text: str
    drawbacks: List[Drawback]


@router.post("/getapproaches", response_model=Union[ApproachesResponse, None])
def get_appraoches (request: ApproachRequest, current_user: dict = Depends(get_current_user)):
    
    try:
        data = get_approaches(request.question, request.code)
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
    question_id = result1.inserted_id


    try:
        drawback_ids = []
        data = get_feedback(request.question, request.approach, request.code, request.stats, request.parameters)
        print(data)
        feedback_doc = {
            "feedback_text": data["feedback_text"],
            "created_at": datetime.now(timezone.utc)
        }
        result3 = db.Feedbacks.insert_one(feedback_doc)
        feedback_id = result3.inserted_id
        drawback_docs = [
            {
                "drawback_text": drawback["drawback_text"],
                "created_at": datetime.now(timezone.utc)
            }
            for drawback in data["drawbacks"]
        ]
        result4 = db.Drawbacks.insert_many(drawback_docs)
        drawback_ids.extend(result4.inserted_ids)

        attempt = {
        "user_id" :  current_user["user"],
        "question_id": question_id,
        "code" :  request.code,
        "stats":  request.stats,
        "selected_approach": request.approach.model_dump(),
        "feedback_id": feedback_id,
        "drawback_ids": drawback_ids,
        "created_at": datetime.now(timezone.utc)
        }

        result2 = db.Attempts.insert_one(attempt)
        if not result2.acknowledged:
            print("Failed to store the attempt in the database")

        return Feedback (
            feedback_text=data["feedback_text"],
            drawbacks=data["drawbacks"]
        )
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))   


@router.get("/questions")
async def get_user_questions(current_user: dict = Depends(get_current_user)):
    #get question ids from attempt and then get the question texts too
    user_id = current_user["user"]

    pipeline = [
        { "$match": { "user_id": user_id } },

        {
            "$lookup": {
                "from": "Questions",
                "localField": "question_id",
                "foreignField": "_id",
                "as": "question"
            }
        },

        { "$unwind": "$question" },

        {
            "$group": {
                "_id": "$question._id",
                "question_text": { "$first": "$question.question_text" },
                "last_attempt": { "$max": "$created_at" }

            }
        },
        { "$sort": { "last_attempt": -1 } }

    ]

    result = list(db.Attempts.aggregate(pipeline))

    return {
        "questions": [
            {
                "id": str(r["_id"]),
                "question_text": r["question_text"]
            }
            for r in result
        ]
    }


@router.get("/attempts/{question_id}")
async def get_question_attempts(question_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["user"]
    attempts = list(
        db.Attempts
          .find(
              {
                  "question_id": ObjectId(question_id),
                  "user_id": user_id
              }
          )
          .sort("created_at", -1)
    )

    return {
        "attempts": [
            {
                "id": str(a["_id"]),
                "code": a["code"],
                "stats": a["stats"],
                "selected_approach": a.get("selected_approach"),
                "created_at": a["created_at"]
            }
            for a in attempts
        ]
    }