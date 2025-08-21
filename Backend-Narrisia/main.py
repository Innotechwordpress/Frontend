import uvicorn
from fastapi import FastAPI
import os

from app.api.endpoints import fetch, research, report, orchestrate
from app.core.config import settings
from app.core.logging_config import setup_logging

app = FastAPI(title="Email Orchestrator")

# Include API routers (connect removed)
app.include_router(fetch.router, prefix="/fetch", tags=["fetch"])
app.include_router(research.router, prefix="/research", tags=["research"])
app.include_router(report.router, prefix="/report", tags=["report"])
app.include_router(orchestrate.router, prefix="/orchestrate", tags=["orchestrate"])

# Setup custom logging
setup_logging()

@app.get("/")
async def root():
    return {"message": "Welcome to Email Orchestrator API"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
