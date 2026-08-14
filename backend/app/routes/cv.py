from datetime import datetime, timezone
import os
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from database.database import get_db
from models.cv import CV
from models.user import User
from utils.auth import get_current_user
from utils.pdf import extract_text_from_pdf

router = APIRouter(prefix="/cv", tags=["CV"])

@router.post("/upload")
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

@router.get("")
def get_cv(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)):

    cv = db.query(CV).filter(CV.user_id == current_user.id).first()

    if not cv:
        raise HTTPException(status_code= 404, detail= "No CV found")

    return{
        "id": cv.id,
        "original_filename": cv.original_filename,
        "uploaded_at": cv.uploaded_at
    }

@router.delete("")
def delete_cv(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)):

    cv = db.query(CV).filter(CV.user_id == current_user.id).first()

    if not cv:
        raise HTTPException(status_code= 404, detail= "No CV found")

    file_path = os.path.join("uploads", cv.stored_filename)
    if os.path.exists(file_path):
        os.remove(file_path)

    db.delete(cv)
    db.commit()

    return {"message": "CV deleted successfully"}