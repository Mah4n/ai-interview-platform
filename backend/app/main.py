from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message" : "AI Interview Website API is running"}