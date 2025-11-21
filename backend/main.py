from fastapi import FastAPI
from auth.routes import router as auth_router

app = FastAPI()

app.include_router(auth_router)

@app.get("/")
async def root():
    return {"message": "AI Code Reviewer API"}