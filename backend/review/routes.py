from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Union
from auth.dependencies import get_current_user
from database.database import db
from datetime import datetime, timezone
from ai.service import get_feedback
from bson import ObjectId
from pymongo import ReturnDocument


router = APIRouter(prefix='/api', tags=["review"])

# class Approach(BaseModel):
#     title: str
#     description: str

 
# class ApproachRequest(BaseModel):
    # code: str
    # language: str
    # question: str
    # parameters: str

# class ApproachesResponse (BaseModel):
#     approaches: List[Approach]

class submitRequest(BaseModel):
    code: str
    question: str
    stats: Dict[str, Any]
    language: str
    parameters: str
    prev_drawbacks: str | None = None
   
class Drawback (BaseModel):
    drawback_text: str

class Review (BaseModel):
    feedback_text: str
    resolved_drawbacks: List[Drawback]
    existing_drawbacks: List[Drawback]
    added_question: Dict[str, str] | None = None

# @router.post("/getapproaches", response_model=Union[ApproachesResponse, None])
# def fetch_approaches (request: ApproachRequest, current_user: dict = Depends(get_current_user)):
#     print("get_approaches run")
#     try:
#         data = get_approaches(request.question, request.code)
#         return ApproachesResponse (
#             approaches=data["approaches"]
#         )
#     except Exception as e:
#         print(e)
#         raise HTTPException(status_code=500, detail=str(e))


@router.post("/submit", response_model=Review)
async def submit(request: submitRequest, current_user: dict = Depends(get_current_user)):
    question_text = request.question.strip()
    
    # Fetch previous drawbacks
    prev_drawbacks_query = db.Questions.find_one(
        {"question_text": question_text}, 
        {"_id": 0, "drawbacks": 1}
    )
    
    prev_drawbacks = []
    if prev_drawbacks_query and prev_drawbacks_query.get("drawbacks"):
        prev_drawbacks_docs = list(db.Drawbacks.find(
            {"_id": {"$in": prev_drawbacks_query["drawbacks"]}}
        ))
        prev_drawbacks = [d["drawback_text"] for d in prev_drawbacks_docs]
    
    try:
        # Get AI feedback
        data = get_feedback(
            question_text,
            # request.approach,   
            request.code, 
            request.stats, 
            request.parameters, 
            prev_drawbacks
        )
        if data.get("approach_name") == "invalid":
            raise HTTPException(status_code=400, detail="Invalid code and question entered.")
        approach = data.get("approach_name", None)
        # Store feedback
        feedback_doc = {
            "feedback_text": data["feedback_text"],
            "created_at": datetime.now(timezone.utc)
        }
        result_feedback = db.Feedbacks.insert_one(feedback_doc)
        feedback_id = result_feedback.inserted_id
                
        def get_or_create_drawback(text):
            normalized = text.strip()
            existing = db.Drawbacks.find_one({"drawback_text": normalized})
            if existing:
                return existing["_id"]
            result = db.Drawbacks.insert_one({
                "drawback_text": normalized,
                "created_at": datetime.now(timezone.utc)
            })
            return result.inserted_id
        
        resolved_texts = set(data.get("resolved_drawbacks", []))
        existing_texts = set(data.get("existing_drawbacks", []))
        
        overlap = resolved_texts & existing_texts
        if overlap:
            print(f"Warning: Drawbacks in both resolved and existing: {overlap}")
            resolved_texts -= overlap
        
        resolved_drawback_ids = [get_or_create_drawback(text) for text in resolved_texts]
        existing_drawback_ids = [get_or_create_drawback(text) for text in existing_texts]
        
        question = db.Questions.find_one_and_update(
            {
                "question_text": question_text,
            },
            {
                "$setOnInsert": {
                    "question_text": question_text,
                    "created_at": datetime.now(timezone.utc)
                },
                "$addToSet": {"drawbacks": {"$each": existing_drawback_ids}}
            },
            upsert=True,
            return_document=ReturnDocument.AFTER
        )
        question_id = question["_id"]
        
        attempt = {
            "user_id": current_user["user"],
            "question_id": question_id,
            "code": request.code,
            "stats": request.stats,
            "selected_approach": approach,
            "language": request.language,
            "parameters": request.parameters,
            "feedback_id": feedback_id,
            "resolved_drawback_ids": resolved_drawback_ids,
            "created_at": datetime.now(timezone.utc)
        }
        
        result_attempt = db.Attempts.insert_one(attempt)
        if not result_attempt.acknowledged:
            raise HTTPException(status_code=500, detail="Failed to store attempt")
        
        return Review(
            feedback_text=data["feedback_text"],
            resolved_drawbacks=[Drawback(drawback_text=t) for t in resolved_texts],
            existing_drawbacks=[Drawback(drawback_text=t) for t in existing_texts],
            added_question={"id": str(question_id), "question_text": question_text} if result_attempt.inserted_id else None
        )
    except HTTPException:
        raise 
    except Exception as e:
        print(f"Error in submit: {e}")
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
            "$lookup": {
            "from": "Drawbacks",
            "localField": "question.drawbacks",
            "foreignField": "_id",
            "as": "drawback_docs"
            }
        },

        {
            "$group": {
                "_id": "$question._id",
                "question_text": { "$first": "$question.question_text" },
                "drawback_docs": { "$first": "$drawback_docs" },
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
                "question_text": r["question_text"],
                "drawbacks": [d["drawback_text"] for d in r.get("drawback_docs", [])]
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
                "language": a.get("language"),
                "parameters": a.get("parameters"),
                "created_at": a["created_at"]
            }
            for a in attempts
        ]
    }


@router.get("/get-stored-feedback/{attempt_id}", response_model = Review)
async def get_stored_feedback(attempt_id: str):
    attempt = db.Attempts.find_one({"_id": ObjectId(attempt_id)})
    
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")

    feedback = db.Feedbacks.find_one({"_id": ObjectId(attempt["feedback_id"])})
    
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    # Get the question to access all its drawbacks
    question = db.Questions.find_one({"_id": ObjectId(attempt["question_id"])})
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # TIMESTAMP-BASED FILTERING
    # Get attempt creation time
    attempt_created_at = attempt.get("created_at")
    
    # Get all drawbacks for this question that existed at the time of the attempt
    all_drawback_ids = question.get("drawbacks", [])
    all_drawbacks = list(db.Drawbacks.find({"_id": {"$in": all_drawback_ids}}))
    
    # Filter: Only drawbacks created BEFORE or AT the same time as this attempt
    historical_drawbacks = [
        d for d in all_drawbacks 
        if d.get("created_at") and d["created_at"] <= attempt_created_at
    ]
    historical_drawback_ids = [d["_id"] for d in historical_drawbacks]
    
    # Resolved drawbacks from this specific attempt
    resolved_drawback_ids = attempt.get("resolved_drawback_ids", [])

    # Existing = Historical drawbacks - Resolved in this attempt
    existing_drawback_ids = [d_id for d_id in historical_drawback_ids if d_id not in resolved_drawback_ids]
    
    resolved_drawbacks = [d for d in historical_drawbacks if d["_id"] in resolved_drawback_ids]
    existing_drawbacks = [d for d in historical_drawbacks if d["_id"] in existing_drawback_ids]

    return Review(
        feedback_text=feedback["feedback_text"],
        resolved_drawbacks=[Drawback(drawback_text=d["drawback_text"]) for d in resolved_drawbacks],
        existing_drawbacks=[Drawback(drawback_text=d["drawback_text"]) for d in existing_drawbacks]
    )