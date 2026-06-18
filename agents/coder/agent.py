import json
import os
import sys
import time
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import call_groq, clean_json

def run_coder_agent(architecture: dict, research: dict, project_folder: str = "generated_projects") -> dict:
    print(f"💻 Coding Agent starting...")
    print(f"📋 Writing code for: {architecture['project_name']}")

    # Build library context from research
    libraries = research.get("recommended_libraries", [])
    library_context = ", ".join([lib["name"] for lib in libraries]) if libraries else "none specified"

    files_prompt = f"""
    You are an expert software engineer.
    Project: {architecture['project_name']}
    Tech Stack: {json.dumps(architecture['tech_stack'], indent=2)}
    API Endpoints: {json.dumps(architecture['api_endpoints'], indent=2)}
    Database Tables: {json.dumps(architecture['database_tables'], indent=2)}
    
    List all files needed for this project.
    Return ONLY a JSON array, no markdown, no extra text:
    [
        {{"filename": "backend/server.js", "description": "main server file"}}
    ]
    """

    files_text = call_groq(files_prompt, max_tokens=2000, temperature=0.2)
    files_text = clean_json(files_text)

    try:
        files_list = json.loads(files_text)
    except json.JSONDecodeError as e:
        print(f"❌ Failed to parse file list: {e}")
        print(f"Raw response:\n{files_text[:500]}")
        raise

    print(f"📁 Will create {len(files_list)} files")

    created_files = []

    for file_info in files_list:
        filename = file_info['filename']
        description = file_info['description']
        print(f"✍️  Writing {filename}...")

        # Get file extension for language context
        ext = os.path.splitext(filename)[-1]
        lang_map = {
            ".py": "Python", ".js": "JavaScript", ".ts": "TypeScript",
            ".jsx": "React JSX", ".tsx": "React TSX", ".html": "HTML",
            ".css": "CSS", ".sql": "SQL", ".sh": "Bash"
        }
        language = lang_map.get(ext, "code")

        code_prompt = f"""
        You are an expert software engineer.
        Project: {architecture['project_name']}
        Tech Stack: {json.dumps(architecture['tech_stack'], indent=2)}
        Recommended Libraries: {library_context}
        
        Write complete {language} code for:
        File: {filename}
        Purpose: {description}
        
        Rules:
        - Write complete, working, production-ready code
        - Include proper error handling
        - Include helpful comments
        - Follow best practices for {language}
        - Do NOT include markdown code fences (no ```)
        - Return ONLY the raw code, nothing else
        """

        try:
            code_content = call_groq(code_prompt, max_tokens=8000, temperature=0.3)

            # Strip markdown fences if Gemini adds them anyway
            if code_content.startswith("```"):
                lines = code_content.split('\n')
                lines = lines[1:]
                if lines and lines[-1].strip() == "```":
                    lines = lines[:-1]
                code_content = '\n'.join(lines)

            save_path = os.path.join(project_folder, filename)
            os.makedirs(os.path.dirname(save_path), exist_ok=True)

            with open(save_path, 'w', encoding='utf-8') as f:
                f.write(code_content)

            print(f"✅ Created: {save_path}")
            created_files.append({"filename": filename, "description": description})

            # Small pause to avoid rate limits between files
            time.sleep(2)

        except Exception as e:
            print(f"⚠️  Skipping {filename}: {e}")
            continue

    print(f"\n✅ Coding Agent completed!")
    print(f"📁 Created {len(created_files)} files")
    return {"files": created_files}


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
            {"method": "POST", "path": "/api/users", "description": "Create user"},
            {"method": "GET", "path": "/api/tasks", "description": "Get tasks"}
        ],
        "database_tables": [
            {"name": "users", "fields": ["id", "username", "password"]},
            {"name": "tasks", "fields": ["id", "title", "user_id"]}
        ]
    }
    test_research = {
        "recommended_libraries": [
            {"name": "express"}, {"name": "jsonwebtoken"}, {"name": "bcrypt"}
        ],
        "security_considerations": []
    }
    result = run_coder_agent(test_architecture, test_research, "generated_projects/TodoApp")
    print("\n💻 FILES CREATED:")
    for file in result['files']:
        print(f"  ✅ {file['filename']}")