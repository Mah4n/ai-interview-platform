from fastapi import Depends, APIRouter, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db
from models.user import User
from models.cv import CV
from models.interview import Interview 
from models.interview_response import InterviewResponse
from schemas.interview import InterviewCreate
from schemas.interview_response import InterviewResponseCreate 
from utils.auth import get_current_user
from utils.ai import generate_interview_questions, generate_answer_feedback

router = APIRouter(prefix="/interviews", tags=["Interviews"])

@router.post("/generate")
def generate_interview(
    interview: InterviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)):

    cv = db.query(CV).filter(CV.user_id == current_user.id).first()

    if not cv:
        raise HTTPException(status_code= 400,
                            detail= "Please upload a CV before generating an interview")

    generated_questions = generate_interview_questions(
        cv_text = cv.extracted_text, 
        role = interview.role,
        difficulty = interview.difficulty,
        interview_type = interview.interview_type)

    new_interview = Interview(
        user_id = current_user.id,
        role = interview.role,
        difficulty = interview.difficulty,
        interview_type = interview.interview_type,
        questions = generated_questions)

    db.add(new_interview)
    db.commit()
    db.refresh(new_interview)

    return{
        "interview_id": new_interview.id,
        "questions": generated_questions
    }

@router.post("/answer")
def submit_answer(
    response: InterviewResponseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)):

    interview = db.query(Interview).filter(Interview.id == response.interview_id,
                                           Interview.user_id == current_user.id).first()

    if not interview:
        raise HTTPException(
            status_code=404,
            detail="Interview not found")

    if response.question_index < 0 or response.question_index >= len(interview.questions):
        raise HTTPException(
            status_code=400,
            detail="Invalid question index")

    question = interview.questions[response.question_index]

    feedback = generate_answer_feedback(
        question=question,
        answer=response.answer,
        role=interview.role,
        difficulty=interview.difficulty)

    new_response = InterviewResponse(
        interview_id=interview.id,
        question_index=response.question_index,
        question=question,
        answer=response.answer,
        score=feedback["score"],
        strengths=feedback["strengths"],
        weaknesses=feedback["weaknesses"],
        suggested_improvement=feedback["suggested_improvement"])

    db.add(new_response)
    db.commit()
    db.refresh(new_response)

    return {
        "message": "Answer submitted successfully",
        "response_id": new_response.id,
        "question": question,
        "answer": new_response.answer,
        "score": new_response.score,
        "strengths": new_response.strengths,
        "weaknesses": new_response.weaknesses,
        "suggested_improvement": new_response.suggested_improvement
    }

@router.get("/history")
def get_interview_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)):

    interviews = db.query(Interview).filter(Interview.user_id == current_user.id).order_by(Interview.created_at.desc()).all()

    history = []

    for interview in interviews:
        history.append({
            "id": interview.id,
            "role": interview.role,
            "difficulty": interview.difficulty,
            "interview_type": interview.interview_type,
            "questions": interview.questions,
            "created_at": interview.created_at,

            "responses": [
                {
                    "question_index": response.question_index,
                    "question": response.question,
                    "answer": response.answer,
                    "score": response.score,
                    "strengths": response.strengths,
                    "weaknesses": response.weaknesses,
                    "suggested_improvement": response.suggested_improvement
                }
                for response in interview.responses
            ]
        })

    return history

@router.get("/{interview_id}")
def get_interview(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)):

    interview = db.query(Interview).filter(Interview.id == interview_id, Interview.user_id == current_user.id).first()

    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    return{
        "id": interview.id,
        "role": interview.role,
        "difficulty": interview.difficulty,
        "interview_type": interview.interview_type,
        "questions": interview.questions,
        "created_at": interview.created_at,
        
        "responses": [
            {
                "question_index": response.question_index,
                "question": response.question,
                "answer": response.answer,
                "score": response.score,
                "strengths": response.strengths,
                "weaknesses": response.weaknesses,
                "suggested_improvement": response.suggested_improvement
            }
            for response in interview.responses
        ]
    }