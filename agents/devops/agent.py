import json
import os
import sys
import time
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import call_groq, clean_json

def run_devops_agent(architecture: dict, project_folder: str = "generated_projects") -> dict:
    print(f"⚙️ DevOps Agent starting...")
    print(f"📋 Setting up DevOps for: {architecture['project_name']}")

    devops_files = [
        {"filename": ".github/workflows/ci.yml", "description": "GitHub Actions CI/CD pipeline"},
        {"filename": "docker/Dockerfile.backend", "description": "Dockerfile for backend"},
        {"filename": "docker/Dockerfile.frontend", "description": "Dockerfile for frontend"},
        {"filename": "docker/docker-compose.yml", "description": "Docker compose for all services"},
        {"filename": "docker/docker-compose.prod.yml", "description": "Docker compose for production"},
        {"filename": "scripts/deploy.sh", "description": "Deployment script"},
        {"filename": "scripts/setup.sh", "description": "Setup script for new developers"},
        {"filename": "scripts/backup.sh", "description": "Database backup script"},
        {"filename": ".env.example", "description": "Example environment variables"}
    ]

    created_files = []

    for file_info in devops_files:
        filename = file_info['filename']
        description = file_info['description']
        print(f"✍️  Creating {filename}...")

        prompt = f"""
        You are an expert DevOps engineer.
        Project: {architecture['project_name']}
        Tech Stack: {json.dumps(architecture['tech_stack'], indent=2)}
        
        Create this DevOps file:
        File: {filename}
        Purpose: {description}
        
        Rules:
        - Write complete, working configuration
        - Follow DevOps best practices
        - Include helpful comments
        - Use environment variables for secrets
        - Do NOT wrap in markdown code fences (no ```)
        - Return ONLY the raw file content, nothing else
        """

        try:
            file_content = call_groq(prompt, max_tokens=4000, temperature=0.2)

            # Strip markdown fences if Gemini adds them anyway
            if file_content.startswith("```"):
                lines = file_content.split('\n')
                lines = lines[1:]
                if lines and lines[-1].strip() == "```":
                    lines = lines[:-1]
                file_content = '\n'.join(lines)

            save_path = os.path.join(project_folder, filename)
            os.makedirs(os.path.dirname(save_path), exist_ok=True)

            with open(save_path, 'w', encoding='utf-8') as f:
                f.write(file_content)

            print(f"✅ Created: {save_path}")
            created_files.append({"filename": filename, "description": description})

        except Exception as e:
            print(f"⚠️  Skipping {filename}: {e}")
            continue

        # Pause between files to avoid rate limits
        time.sleep(2)

    devops_report = {
        "project": architecture['project_name'],
        "total_files_created": len(created_files),
        "files": created_files,
        "ci_cd": {
            "platform": "GitHub Actions",
            "pipeline": ".github/workflows/ci.yml",
            "stages": ["Install", "Test", "Security scan", "Build", "Deploy"]
        },
        "containerization": {
            "platform": "Docker",
            "services": ["backend", "frontend", "database", "cache"]
        },
        "status": "devops_setup_completed"
    }

    print(f"\n✅ DevOps Agent completed!")
    print(f"📁 Created {len(created_files)} DevOps files")
    return devops_report


if __name__ == "__main__":
    test_architecture = {
        "project_name": "TodoApp",
        "summary": "A todo app with user authentication",
        "tech_stack": {
            "frontend": "React",
            "backend": "Node.js with Express",
            "database": "MySQL",
            "cache": "Redis",
            "deployment": "Docker"
        },
        "api_endpoints": [
            {"method": "POST", "path": "/api/users", "description": "Create user"}
        ]
    }
    result = run_devops_agent(test_architecture, "generated_projects/TodoApp")
    print(json.dumps(result, indent=2))