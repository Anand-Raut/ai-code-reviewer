from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth.routes import router as auth_router
from review.routes import router as review_router


app = FastAPI()

app.add_middleware(CORSMiddleware,
                   allow_origins=["http://localhost:5173"],
                   allow_credentials=True,
                   allow_methods=["*"],
                   allow_headers=["*"]
                   )

app.include_router(auth_router)
app.include_router(review_router)


@app.get("/check")
async def root():
    return {"message": "AI Code Reviewer API"}