from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.database import get_db
from models.interview import Interview
from models.interview_response import InterviewResponse
from models.user import User
from utils.auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("")
def get_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)):

    interviews = db.query(Interview).filter(Interview.user_id == current_user.id).all()
    responses = db.query(InterviewResponse).join(Interview).filter(Interview.user_id == current_user.id).all()

    scores = [
        response.score
        for response in responses
        if response.score is not None ]

    average_score = (
        sum(scores) / len(scores)
        if scores
        else 0 )

    return {
        "interviews_completed": len(interviews),
        "questions_answered": len(responses),
        "average_score": round(average_score, 2),
        "highest_score": max(scores) if scores else 0,
        "lowest_score": min(scores) if scores else 0
    }