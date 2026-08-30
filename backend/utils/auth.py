import jwt
from fastapi import Depends, HTTPException, Request, status 
from fastapi.security import OAuth2PasswordBearer 
from sqlalchemy.orm import Session
from typing import Optional

from database.database import get_db
from models.user import User
from utils.jwt import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login", auto_error=False)

def get_current_user(request: Request,
                     token: Optional[str]=Depends(oauth2_scheme), 
                     db: Session=Depends(get_db)):
    
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"})

    if token is None:
        token = request.cookies.get("access_token")

    if token is None:
        raise credentials_error

    try:
        user_id = decode_access_token(token)
    except (jwt.InvalidTokenError, ValueError):
        raise credentials_error

    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise credentials_error

    return user