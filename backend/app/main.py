from fastapi import Depends, FastAPI, HTTPException, status, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import os
import uuid

from database.database import Base, engine, get_db
from models.user import User
from models.cv import CV
from models.interview import Interview 
from models.interview_response import InterviewResponse
from schemas.user import UserCreate
from schemas.interview import InterviewCreate
from schemas.interview_response import InterviewResponseCreate 
from utils.auth import get_current_user
from utils.hash import hash_password, verify_password
from utils.jwt import create_access_token
from utils.pdf import extract_text_from_pdf
from utils.ai import generate_interview_questions

Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")
def home():
    return {"message" : "AI Interview Website API is running"}

@app.post("/register")
def register(user:UserCreate, db: Session = Depends(get_db)):

    existing_user= db.query(User).filter(User.email == user.email).first()

    if existing_user:
        return {"message" : "User already exists"}
    
    new_user = User(email=user.email, hashed_password=hash_password(user.password))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message" : "User registered successfully"}

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session=Depends(get_db)):

    existing_user = db.query(User).filter(User.email == form_data.username).first()

    if not existing_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password") 
    if not verify_password(form_data.password, existing_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    access_token = create_access_token(existing_user.id)
    return {"access_token" : access_token, "token_type" : "bearer"} 

@app.get("/profile")
def profile(current_user: User=Depends(get_current_user)):
    return {"id":current_user.id, 
            "email":current_user.email, "created_at":current_user.created_at}

@app.post("/cv/upload")
def upload_cv(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)):

    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    stored_filename = f"{uuid.uuid4()}.pdf"

    file_path = os.path.join("uploads", stored_filename)
    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    extracted_text = extract_text_from_pdf(file_path)

    existing_cv = db.query(CV).filter(CV.user_id == current_user.id).first()

    if existing_cv:
        old_file_path = os.path.join("uploads", existing_cv.stored_filename)
        if os.path.exists(old_file_path):
            os.remove(old_file_path)

        existing_cv.original_filename = file.filename
        existing_cv.stored_filename = stored_filename
        existing_cv.extracted_text = extracted_text
        existing_cv.uploaded_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(existing_cv)

        return {"message" : "CV updated successfully",
                "filename" : existing_cv.original_filename}

    new_cv = CV(user_id = current_user.id,
                original_filename = file.filename,
                stored_filename = stored_filename,
                extracted_text = extracted_text)

    db.add(new_cv)
    db.commit()
    db.refresh(new_cv)

    return {"message" : "CV uploaded successfully",
            "filename" : new_cv.original_filename}

@app.post("/interview/generate")
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

@app.post("/interviews/answer")
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

    new_response = InterviewResponse(
        interview_id=interview.id,
        question_index=response.question_index,
        question=question,
        answer=response.answer)

    db.add(new_response)
    db.commit()
    db.refresh(new_response)

    return {
        "message": "Answer submitted successfully",
        "response_id": new_response.id,
        "question": question,
        "answer": new_response.answer
    }
