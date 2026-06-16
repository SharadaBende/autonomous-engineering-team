from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel
import subprocess
import sys
import os

load_dotenv()

app = FastAPI(
    title="Autonomous Engineering Team",
    description="A platform where AI agents autonomously build software",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProductRequest(BaseModel):
    description: str

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

@app.post("/api/run-planner")
async def run_planner(request: ProductRequest):
    sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'agents'))
    from planner.agent import run_planner_agent
    result = run_planner_agent(request.description)
    return {"status": "completed", "output": result}

@app.post("/api/run-researcher")
async def run_researcher(request: ProductRequest):
    sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'agents'))
    from planner.agent import run_planner_agent
    from researcher.agent import run_researcher_agent
    architecture = run_planner_agent(request.description)
    result = run_researcher_agent(architecture)
    return {"status": "completed", "output": result}

@app.post("/api/build")
async def build_product(request: ProductRequest):
    """
    Main endpoint - runs all agents and returns results
    """
    # Change working directory to project root
    root_dir = os.path.dirname(os.path.dirname(__file__))
    os.chdir(root_dir)
    
    sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'agents'))
    from orchestrator.agent import run_orchestrator
    result = run_orchestrator(request.description)
    return result