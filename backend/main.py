from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Autonomous Engineering Team",
    description="A platform where AI agents autonomously build software",
    version="1.0.0"
)

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Basic health check route
@app.get("/")
async def root():
    return {
        "message": "Autonomous Engineering Team API is running!",
        "status": "healthy",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "agents": [
            "planner",
            "researcher", 
            "coder",
            "tester",
            "security",
            "devops",
            "monitoring"
        ]
    }