from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from database.database import get_db
from models.user import User
from schemas.user import UserCreate
from utils.auth import get_current_user
from utils.hash import hash_password, verify_password
from utils.jwt import create_access_token

router = APIRouter()

@router.post("/register")
def register(user:UserCreate, db: Session = Depends(get_db)):

    existing_user= db.query(User).filter(User.email == user.email).first()

    if existing_user:
        return {"message" : "User already exists"}
    
    new_user = User(email=user.email, hashed_password=hash_password(user.password))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message" : "User registered successfully"}

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session=Depends(get_db)):

    existing_user = db.query(User).filter(User.email == form_data.username).first()

    if not existing_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password") 
    if not verify_password(form_data.password, existing_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    access_token = create_access_token(existing_user.id)
    return {"access_token" : access_token, "token_type" : "bearer"} 

@router.get("/profile")
def profile(current_user: User=Depends(get_current_user)):
    return {"id":current_user.id, 
            "email":current_user.email, "created_at":current_user.created_at}