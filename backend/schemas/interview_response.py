from pydantic import BaseModel

class InterviewResponseCreate(BaseModel):
    interview_id: int
    question_index: int
    answer: str