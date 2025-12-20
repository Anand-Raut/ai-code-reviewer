from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from auth.dependencies import get_current_user

router = APIRouter(prefix='/api', tags=["review"])

class Approach(BaseModel):
    title: str
    description: str

class ApproachRequest(BaseModel):
    code: str
    language: str
    question: str
    stats: Dict[str, Any]

class ApproachesResponse (BaseModel):
    approaches: List[Approach]

@router.post("/getapproaches", response_model=ApproachesResponse )
async def get_code_approaches (request: ApproachRequest, current_user: dict = Depends(get_current_user)):
    try:
        # TODO: Call AI service here
        # mock response
        approaches = [
            Approach(
                title="Brute Force Approach",
                description=f"Simple solution for {request.question}. Time complexity O(n^2)"
            ),
            Approach(
                title="Optimized Approach",
                description="Using hash map to improve performance. Time complexity O(n)"
            ),
            Approach(
                title="Advanced Approach",
                description="Using dynamic programming for optimal solution"
            )
        ]

        return ApproachesResponse (
            approaches=approaches,
        )
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))