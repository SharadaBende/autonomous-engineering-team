from groq import Groq
import json
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def clean_json(text):
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()

def run_coder_agent(architecture: dict, research: dict, project_folder: str = "generated_projects") -> dict:
    print(f"💻 Coding Agent starting...")
    print(f"📋 Writing code for: {architecture['project_name']}")

    files_prompt = f"""
    You are an expert software engineer.
    Project: {architecture['project_name']}
    Tech Stack: {json.dumps(architecture['tech_stack'], indent=2)}
    API Endpoints: {json.dumps(architecture['api_endpoints'], indent=2)}
    Database Tables: {json.dumps(architecture['database_tables'], indent=2)}
    List all files needed for this project.
    Return ONLY a JSON array:
    [
        {{"filename": "backend/server.js", "description": "main server file"}}
    ]
    Return ONLY the JSON array, no extra text.
    """

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": files_prompt}],
        max_tokens=1000,
        temperature=0.3
    )

    files_text = clean_json(response.choices[0].message.content)
    files_list = json.loads(files_text)
    print(f"📁 Will create {len(files_list)} files")

    created_files = []

    for file_info in files_list:
        filename = file_info['filename']
        description = file_info['description']
        print(f"✍️ Writing {filename}...")

        code_prompt = f"""
        You are an expert software engineer.
        Project: {architecture['project_name']}
        Tech Stack: {json.dumps(architecture['tech_stack'], indent=2)}
        Write complete code for:
        File: {filename}
        Purpose: {description}
        Return ONLY the raw code, no markdown, no explanations.
        """

        try:
            code_response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": code_prompt}],
                max_tokens=2000,
                temperature=0.3
            )

            code_content = code_response.choices[0].message.content.strip()

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

        except Exception as e:
            print(f"⚠️ Skipping {filename}: {e}")
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
            {"method": "POST", "path": "/api/login", "description": "Login"},
            {"method": "GET", "path": "/api/tasks", "description": "Get tasks"}
        ],
        "database_tables": [
            {"name": "users", "fields": ["id", "username", "password", "email"]},
            {"name": "tasks", "fields": ["id", "title", "priority", "user_id"]}
        ]
    }

    test_research = {
        "recommended_libraries": [],
        "security_considerations": []
    }

    result = run_coder_agent(test_architecture, test_research, "generated_projects/TodoApp")
    print("\n💻 FILES CREATED:")
    for file in result['files']:
        print(f"  ✅ {file['filename']}")