from groq import Groq
import json
import os
import re
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

def run_coder_agent(architecture: dict, research: dict) -> dict:
    """
    Takes architecture and research and writes actual code
    """
    
    print(f"💻 Coding Agent starting...")
    print(f"📋 Writing code for: {architecture['project_name']}")
    
    # Step 1 - Get list of files to create
    files_prompt = f"""
    You are an expert software engineer.
    
    Project: {architecture['project_name']}
    Summary: {architecture['summary']}
    Tech Stack: {json.dumps(architecture['tech_stack'], indent=2)}
    API Endpoints: {json.dumps(architecture['api_endpoints'], indent=2)}
    Database Tables: {json.dumps(architecture['database_tables'], indent=2)}
    
    List all the files needed for this project.
    
    Return ONLY a JSON array like this:
    [
        {{"filename": "backend/server.js", "description": "main server file"}},
        {{"filename": "backend/routes/tasks.js", "description": "task routes"}}
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
    
    # Step 2 - Write each file one by one
    created_files = []
    
    for file_info in files_list:
        filename = file_info['filename']
        description = file_info['description']
        
        print(f"✍️ Writing {filename}...")
        
        code_prompt = f"""
        You are an expert software engineer.
        
        Project: {architecture['project_name']}
        Tech Stack: {json.dumps(architecture['tech_stack'], indent=2)}
        
        Write the complete code for this file:
        File: {filename}
        Purpose: {description}
        
        Rules:
        - Write complete working code
        - Include error handling
        - Include helpful comments
        - Follow best practices
        
        Return ONLY the raw code, no explanations, no markdown, just the code.
        """
        
        code_response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": code_prompt}],
            max_tokens=2000,
            temperature=0.3
        )
        
        code_content = code_response.choices[0].message.content.strip()
        
        # Remove markdown if present
        if code_content.startswith("```"):
            lines = code_content.split('\n')
            lines = lines[1:]
            if lines[-1].strip() == "```":
                lines = lines[:-1]
            code_content = '\n'.join(lines)
        
        # Create directories if needed
        if os.path.dirname(filename):
            os.makedirs(os.path.dirname(filename), exist_ok=True)
        
        # Save the file
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(code_content)
        
        print(f"✅ Created: {filename}")
        
        created_files.append({
            "filename": filename,
            "description": description,
            "content": code_content
        })
    
    print(f"\n✅ Coding Agent completed!")
    print(f"📁 Created {len(created_files)} files")
    
    return {"files": created_files}


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
            {"method": "GET", "path": "/api/tasks", "description": "Get all tasks"},
            {"method": "POST", "path": "/api/tasks", "description": "Create a new task"},
            {"method": "PUT", "path": "/api/tasks/:id", "description": "Edit a task"},
            {"method": "DELETE", "path": "/api/tasks/:id", "description": "Delete a task"}
        ],
        "database_tables": [
            {"name": "users", "fields": ["id", "username", "password", "email"]},
            {"name": "tasks", "fields": ["id", "title", "description", "priority", "due_date", "user_id"]}
        ]
    }
    
    test_research = {
        "recommended_libraries": [
            {"name": "jsonwebtoken", "purpose": "JWT authentication", "why": "Secure", "install_command": "npm install jsonwebtoken"},
            {"name": "bcryptjs", "purpose": "Password hashing", "why": "Secure", "install_command": "npm install bcryptjs"}
        ],
        "security_considerations": [
            {"concern": "SQL injection", "solution": "Use parameterized queries"},
            {"concern": "XSS", "solution": "Validate and sanitize input"}
        ]
    }
    
    result = run_coder_agent(test_architecture, test_research)
    print("\n💻 FILES CREATED:")
    for file in result['files']:
        print(f"  ✅ {file['filename']}")