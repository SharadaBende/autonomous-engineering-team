from fastapi import FastAPI
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from pydantic import BaseModel
import sys
import os
import zipfile
import shutil

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





@app.get("/api/download/{project_name}")
async def download_project(project_name: str):
    """
    Zips the generated project and returns it for download
    """
    project_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        'generated_projects',
        project_name
    )

    if not os.path.exists(project_path):
        return {"error": f"Project {project_name} not found"}

    # Create ZIP file
    zip_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        'generated_projects',
        f"{project_name}.zip"
    )

    print(f"📦 Zipping project: {project_name}")

    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(project_path):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, project_path)
                zipf.write(file_path, arcname)

    print(f"✅ ZIP created: {zip_path}")

    return FileResponse(
        path=zip_path,
        filename=f"{project_name}.zip",
        media_type="application/zip"
    )



@app.get("/api/download/{project_name}")
async def download_project(project_name: str):
    base_dir = Path(os.path.dirname(os.path.dirname(__file__))) / 'generated_projects'
    project_path = (base_dir / project_name).resolve()

    if not str(project_path).startswith(str(base_dir.resolve())):
        return {"error": "Invalid project name"}

    if not project_path.exists():
        return {"error": f"Project {project_name} not found"}

    zip_path = base_dir / f"{project_name}.zip"

    print(f"📦 Zipping project: {project_name}")

    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(project_path):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, project_path)
                zipf.write(file_path, arcname)

    print(f"✅ ZIP created: {zip_path}")

    return FileResponse(
        path=str(zip_path),
        filename=f"{project_name}.zip",
        media_type="application/zip"
    )