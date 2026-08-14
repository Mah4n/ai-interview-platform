from groq import Groq
import json

client = Groq()

def generate_interview_questions(
        cv_text: str, 
        role: str,
        difficulty: str,
        interview_type: str
) -> str:

    prompt = f"""
    Create 5 interview questions for a candidate.

    Target role:
    {role}

    Difficulty:
    {difficulty}

    Interview type:
    {interview_type}

    Candidate CV:
    {cv_text}

    Make the questions relevant to both the target role and the candidate's experience.
    Return the response as JSON in exactly this format:
    {{
        "questions": [
                "question 1",
                "question 2",
                "question 3",
                "question 4",
                "question 5"
        ]
    }}
    """

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        response_format={"type": "json_object"}
    )

    data = json.loads(response.choices[0].message.content)
    return data["questions"]

def generate_answer_feedback(
        question: str,
        answer: str,
        role: str,
        difficulty: str) -> dict:

    prompt = f"""
    Evaluate this interview answer.

    Target role:
    {role}

    Difficulty:
    {difficulty}

    Question:
    {question}

    Candidate answer:
    {answer}

    Return JSON in exactly this format:

    {{
        "score": 0,
        "strengths": "short explanation",
        "weaknesses": "short explanation",
        "suggested_improvement": "short improved answer or advice"
    }}

    Score must be an integer from 0 to 10.
    """

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        response_format={"type": "json_object"}
    )

    data = json.loads(response.choices[0].message.content)
    return data