from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from database.database import Base

class InterviewResponse(Base):
    __tablename__ = "interview_responses"

    id = Column(Integer, primary_key=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"), nullable=False)
    question_index = Column(Integer, nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    score = Column(Integer, nullable=True)
    strengths = Column(Text, nullable=True)
    weaknesses = Column(Text, nullable=True)
    suggested_improvement = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    interview = relationship("Interview", back_populates="responses")