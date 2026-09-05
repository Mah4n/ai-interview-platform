# PrepSprint

PrepSprint is a full-stack AI-powered interview preparation platform that generates personalised interview questions based on a user's CV and provides structured AI feedback on their answers.

Users can complete role-specific interviews using typed or voice-transcribed answers, review their performance, and track progress across previous interviews.

## Features

- Secure user registration and authentication
- CV upload and PDF text extraction
- AI-generated interview questions tailored to the user's CV and target role
- Multiple interview difficulties and interview types
- AI-generated answer scores, strengths, weaknesses, and suggested improvements
- Voice-to-text answers using the Web Speech API
- Resume, restart, and delete interview sessions
- Interview history and performance analytics
- Secure password-reset token flow
- Responsive React interface

## Tech Stack

**Frontend:** React, JavaScript, Vite, React Router, Web Speech API, CSS

**Backend:** Python, FastAPI, SQLAlchemy, Pydantic

**Database:** PostgreSQL, Alembic

**Authentication:** JWT, HttpOnly cookies, Argon2 password hashing

**AI:** Groq API with GPT-OSS 20B

## Running Locally

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file using `.env.example`, then apply the database migrations:

```bash
alembic upgrade head
```

Start the API:

```bash
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Create a `.env` file using `.env.example` with the appropriate backend API URL.

## Security

PrepSprint uses Argon2 password hashing, JWT authentication stored in HttpOnly cookies, protected API endpoints, environment-based secret management, and short-lived password-reset tokens.

## Deployment

PrepSprint is designed to be self-hosted using a Raspberry Pi with Nginx, FastAPI, PostgreSQL, and HTTPS.

**Live Demo:** prepsprint.mah-noor.com/login 

## Future Improvements

- Transactional email delivery for password-reset links
- Expanded interview and question categories
- More detailed performance visualisations
- Increased automated test coverage

## Author

**Mah Noor**  
