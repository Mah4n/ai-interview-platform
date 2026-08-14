from datetime import datetime, timezone 
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, JSON
from sqlalchemy.orm import relationship
from database.database import Base 

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    interview_type = Column(String, nullable=False)
    questions = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="interviews")
    responses = relationship("InterviewResponse", back_populates="interview", cascade="all, delete-orphan")