from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import analyze

app = FastAPI(
    title="LexiGuard NLP Service",
    description="BERT tabanlı sözleşme analiz mikroservisi",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/api")


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "LexiGuard NLP"}
