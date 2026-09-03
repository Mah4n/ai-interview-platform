from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from database.database import get_db
from models.user import User
from schemas.user import UserCreate, ForgotPasswordRequest, ResetPasswordRequest
from utils.auth import get_current_user
from utils.hash import hash_password, verify_password
from utils.jwt import create_access_token, create_password_reset_token
from utils.jwt import SECRET_KEY, ALGORITHM

router = APIRouter()

@router.post("/register")
def register(user:UserCreate, db: Session = Depends(get_db)):

    existing_user= db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already exists")
    
    new_user = User(email=user.email, hashed_password=hash_password(user.password))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message" : "User registered successfully"}

@router.post("/login")
def login(response: Response,
          form_data: OAuth2PasswordRequestForm = Depends(), 
          db: Session=Depends(get_db)):

    existing_user = db.query(User).filter(User.email == form_data.username).first()

    if not existing_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password") 
    if not verify_password(form_data.password, existing_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    access_token = create_access_token(existing_user.id)

    response.set_cookie(
        key="access_token", 
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=False,
        path="/"
    )

    return {"access_token" : access_token, "token_type" : "bearer"} 

@router.get("/profile")
def profile(current_user: User=Depends(get_current_user)):
    return {"id":current_user.id, 
            "email":current_user.email, 
            "created_at":current_user.created_at}

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key="access_token",
        path="/"
    )
    return {"message": "Logged out successfully"}

@router.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == request.email).first()

    if not user:
        return {"message": "If an account exists for this email, a reset link has been sent."}

    reset_token = create_password_reset_token(user.email)

    reset_link = (f"http://localhost:5173/reset-password?token={reset_token}")

    print(reset_link)

    return {"message": "If an account exists for this email, a reset link has been sent."}

@router.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(
            request.token,
            SECRET_KEY,
            algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    if payload.get("purpose") != "password_reset":
        raise HTTPException(status_code=400, detail="Invalid reset token")

    email = payload.get("sub")

    if not email:
        raise HTTPException(status_code=400, detail="Invalid reset token")

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = hash_password(request.new_password)

    db.commit()

    return {"message": "Password reset successfully"}