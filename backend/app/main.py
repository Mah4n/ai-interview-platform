from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth, cv, analytics, interviews

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins= ["http://localhost:5173"],
    allow_credentials=  True,
    allow_methods= ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers= ["Content-Type", "Authorization"]
)

app.include_router(auth.router)
app.include_router(cv.router)
app.include_router(analytics.router)
app.include_router(interviews.router)

@app.get("/")
def home():
    return {"message" : "AI Interview Website API is running"}