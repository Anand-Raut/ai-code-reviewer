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
    prev_drawbacks: str | None = None
    
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
    resolved_drawbacks: List[Drawback]  # Add this
    existing_drawbacks: List[Drawback]  # Add this


@router.post("/getapproaches", response_model=Union[ApproachesResponse, None])
def fetch_approaches (request: ApproachRequest, current_user: dict = Depends(get_current_user)):
    print("get_approaches run")
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
    
    try:
        resolved_drawback_ids = []
        existing_drawback_ids = []
        
        # DATA = GIVEN BY AI
        data = get_feedback(request.question, request.approach, request.code, request.stats, request.parameters, request.prev_drawbacks)
        print(data)
        feedback_doc = {
            "feedback_text": data["feedback_text"],
            "created_at": datetime.now(timezone.utc)
        }
        result3 = db.Feedbacks.insert_one(feedback_doc)
        feedback_id = result3.inserted_id
        resolved_drawback_docs = [
            {
                "drawback_text": drawback,
                "created_at": datetime.now(timezone.utc)
            }
            for drawback in data["resolved_drawbacks"]
        ]
        existing_drawback_docs = [
            {
                "drawback_text": drawback,
                "created_at": datetime.now(timezone.utc)
            }
            for drawback in data["existing_drawbacks"]
        ]
        # print("drawback_docs: ", drawback_docs)
        
        
        result4 = db.Drawbacks.insert_many(resolved_drawback_docs)
        result5 = db.Drawbacks.insert_many(existing_drawback_docs)
        resolved_drawback_ids.extend(result4.inserted_ids)
        existing_drawback_ids.extend(result5.inserted_ids)
        

        res0 = db.Questions.find_one({"question_text": request.question.strip()})
        if res0: # IN THE EXISTING DRAWBACKS ADD THE NEW ONES ONLY
            question_id = res0["_id"]
            saved_drawback_ids = res0.get("drawbacks", [])  # Get existing drawbacks
            all_drawback_ids = list(set(saved_drawback_ids + existing_drawback_ids))
            db.Questions.update_one(
                {"_id": question_id},
                {"$set": {"drawbacks": all_drawback_ids}}
            )
        else:
            question = {
                "question_text": request.question.strip(),
                "drawbacks": existing_drawback_ids
            }
            result1 = db.Questions.insert_one(question)
            question_id = result1.inserted_id

        attempt = {
            "user_id" :  current_user["user"],
            "question_id": question_id,
            "code" :  request.code,
            "stats":  request.stats,
            "selected_approach": request.approach.model_dump(),
            "feedback_id": feedback_id,
            "resolved_drawback_ids": resolved_drawback_ids,
            "created_at": datetime.now(timezone.utc)
        }

        result2 = db.Attempts.insert_one(attempt)
        if not result2.acknowledged:
            print("Failed to store the attempt in the database")

        return Feedback (
            feedback_text=data["feedback_text"],
            # drawbacks=[Drawback(drawback_text=d) for d in data["drawbacks"]],
            resolved_drawbacks = [Drawback(drawback_text=d) for d in data.get("resolved_drawbacks", [])],
            existing_drawbacks = [Drawback(drawback_text=d) for d in data.get("existing_drawbacks", [])]
            # resolved_drawbacks=data.get("resolved_drawbacks", []),
            # existing_drawbacks=data.get("existing_drawbacks", [])

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


# GET FEEDBACK & DRAWBACKS FOR AN ATTEMPT
@router.get("/get-stored-feedback/{attempt_id}", response_model = Feedback)
async def get_stored_feedback(attempt_id: str):
    attempt= db.Attempts.find_one({"_id": ObjectId(attempt_id)})

    feedback = db.Feedbacks.find_one({"_id": ObjectId(attempt["feedback_id"])})
    drawback_ids = attempt["drawback_ids"]

    drawbacks = list(db.Drawbacks.find({"_id": {"$in": drawback_ids}}))

    print("Drawbacks: ", drawbacks, "feedback", feedback)

    return Feedback (
            feedback_text=feedback["feedback_text"],
            drawbacks=[Drawback(drawback_text=d["drawback_text"]) for d in drawbacks]
        )