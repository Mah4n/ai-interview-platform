from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship 
from database.database import Base

class CV(Base):
    __tablename__ = "cvs"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    original_filename = Column(String, nullable=False)
    stored_filename = Column(String, nullable=False)
    extracted_text = Column(String, nullable=True)
    uploaded_at = Column(DateTime(timezone=True),default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="cv")
