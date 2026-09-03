from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth, cv, analytics, interviews
from app.config import FRONTEND_URL

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins= [FRONTEND_URL],
    allow_credentials=  True,
    allow_methods= ["*"],
    allow_headers= ["*"]
)

app.include_router(auth.router)
app.include_router(cv.router)
app.include_router(analytics.router)
app.include_router(interviews.router)

@app.get("/")
def home():
    return {"message" : "AI Interview Website API is running"}