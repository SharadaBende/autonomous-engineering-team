from groq import Groq
import json
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def clean_json(text):
    """Clean and fix JSON response from AI"""
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()
    return text

def run_devops_agent(architecture: dict, project_folder: str = "generated_projects") -> dict:
    """
    Creates all DevOps files - Dockerfile, CI/CD pipeline, deployment scripts
    """
    
    print(f"⚙️ DevOps Agent starting...")
    print(f"📋 Setting up DevOps for: {architecture['project_name']}")
    
    # List of DevOps files to create
    devops_files = [
        {
            "filename": ".github/workflows/ci.yml",
            "description": "GitHub Actions CI/CD pipeline"
        },
        {
            "filename": "docker/Dockerfile.backend",
            "description": "Dockerfile for backend"
        },
        {
            "filename": "docker/Dockerfile.frontend",
            "description": "Dockerfile for frontend"
        },
        {
            "filename": "docker/docker-compose.yml",
            "description": "Docker compose for all services"
        },
        {
            "filename": "docker/docker-compose.prod.yml",
            "description": "Docker compose for production"
        },
        {
            "filename": "scripts/deploy.sh",
            "description": "Deployment script"
        },
        {
            "filename": "scripts/setup.sh",
            "description": "Setup script for new developers"
        },
        {
            "filename": "scripts/backup.sh",
            "description": "Database backup script"
        },
        {
            "filename": ".env.example",
            "description": "Example environment variables file"
        }
    ]
    
    created_files = []
    
    # Write each DevOps file
    for file_info in devops_files:
        filename = file_info['filename']
        description = file_info['description']
        
        print(f"✍️ Creating {filename}...")
        
        prompt = f"""
        You are an expert DevOps engineer.
        
        Project: {architecture['project_name']}
        Tech Stack: {json.dumps(architecture['tech_stack'], indent=2)}
        
        Create this DevOps file:
        File: {filename}
        Purpose: {description}
        
        Rules:
        - Write complete working configuration
        - Follow DevOps best practices
        - Include helpful comments
        - Make it production ready
        - Use environment variables for secrets
        
        Return ONLY the raw file content, no explanations, no markdown.
        """
        
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2000,
            temperature=0.2
        )
        
        file_content = response.choices[0].message.content.strip()
        
        # Remove markdown if present
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
        
        print(f"✅ Created: {filename}")
        
        created_files.append({
            "filename": filename,
            "description": description
        })
    
    # Generate DevOps report
    devops_report = {
        "project": architecture['project_name'],
        "total_files_created": len(created_files),
        "files": created_files,
        "ci_cd": {
            "platform": "GitHub Actions",
            "pipeline": ".github/workflows/ci.yml",
            "stages": [
                "Install dependencies",
                "Run tests",
                "Security scan",
                "Build Docker image",
                "Deploy to production"
            ]
        },
        "containerization": {
            "platform": "Docker",
            "services": [
                "backend",
                "frontend",
                "database",
                "cache"
            ]
        },
        "deployment": {
            "script": "scripts/deploy.sh",
            "environment": "production"
        },
        "status": "devops_setup_completed"
    }
    
    # Save devops report
    with open('devops_report.json', 'w', encoding='utf-8') as f:
        json.dump(devops_report, f, indent=2)
    
    print(f"\n✅ DevOps Agent completed!")
    print(f"📁 Created {len(created_files)} DevOps files")
    print(f"🚀 CI/CD pipeline ready")
    print(f"🐳 Docker configuration ready")
    print(f"📄 Report saved to devops_report.json")
    
    return devops_report


# Test the agent directly
if __name__ == "__main__":
    test_architecture = {
        "project_name": "TodoApp",
        "summary": "A todo app with user authentication and task management",
        "tech_stack": {
            "frontend": "React",
            "backend": "Node.js with Express",
            "database": "MySQL",
            "cache": "Redis",
            "deployment": "Docker"
        },
        "api_endpoints": [
            {"method": "POST", "path": "/api/users", "description": "Create a new user"},
            {"method": "POST", "path": "/api/login", "description": "Log in a user"},
            {"method": "GET", "path": "/api/tasks", "description": "Get all tasks"}
        ]
    }
    
    result = run_devops_agent(test_architecture)
    print("\n⚙️ DEVOPS REPORT:")
    print(json.dumps(result, indent=2))