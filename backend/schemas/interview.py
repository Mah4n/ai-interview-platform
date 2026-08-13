from pydantic import BaseModel
from typing import Literal 

class InterviewCreate(BaseModel):
    role: str
    difficulty: Literal["Beginner", "Intermediate", "Advanced"]
    interview_type: Literal["Technical", "Behavioural", "Mixed"]
