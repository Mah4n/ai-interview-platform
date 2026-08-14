from fastapi import FastAPI
from app.routes import auth, cv, analytics, interviews

app = FastAPI()

app.include_router(auth.router)
app.include_router(cv.router)
app.include_router(analytics.router)
app.include_router(interviews.router)

@app.get("/")
def home():
    return {"message" : "AI Interview Website API is running"}