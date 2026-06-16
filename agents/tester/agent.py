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

def read_project_files(files_list: list) -> dict:
    """Read all generated code files"""
    files_content = {}
    for filepath in files_list:
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                files_content[filepath] = f.read()
    return files_content

def run_tester_agent(architecture: dict, code_files: list, project_folder: str = "generated_projects") -> dict:
    """
    Reads the generated code and writes tests for it
    """
    
    print(f"🧪 Testing Agent starting...")
    print(f"📋 Writing tests for: {architecture['project_name']}")
    
    # Read the actual code files
    print("📖 Reading generated code files...")
    files_content = read_project_files(code_files)
    
    # Step 1 - Get list of test files to create
    files_prompt = f"""
    You are an expert software tester.
    
    Project: {architecture['project_name']}
    Tech Stack: {json.dumps(architecture['tech_stack'], indent=2)}
    
    These files were generated:
    {json.dumps(list(files_content.keys()), indent=2)}
    
    List all the test files needed for this project.
    
    Return ONLY a JSON array like this:
    [
        {{"filename": "backend/tests/server.test.js", "description": "tests for server.js", "tests_for": "backend/server.js"}},
        {{"filename": "backend/tests/tasks.test.js", "description": "tests for task routes", "tests_for": "backend/routes/tasks.js"}}
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
    test_files_list = json.loads(files_text)
    
    print(f"📁 Will create {len(test_files_list)} test files")
    
    # Step 2 - Write each test file
    created_tests = []
    
    for test_info in test_files_list:
        filename = test_info['filename']
        description = test_info['description']
        tests_for = test_info.get('tests_for', '')
        
        print(f"✍️ Writing {filename}...")
        
        # Get the source code content if available
        source_code = files_content.get(tests_for, "File not found")
        
        test_prompt = f"""
        You are an expert software tester.
        
        Write complete tests for this file:
        File to test: {tests_for}
        
        Source code:
        {source_code[:2000]}
        
        Write comprehensive tests including:
        - Unit tests for each function
        - Integration tests for API endpoints
        - Edge cases and error handling tests
        - Authentication tests if applicable
        
        Use Jest for JavaScript testing.
        
        Rules:
        - Write complete working test code
        - Include descriptive test names
        - Test both success and failure cases
        - Include setup and teardown
        
        Return ONLY the raw test code, no explanations, no markdown.
        """
        
        code_response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": test_prompt}],
            max_tokens=2000,
            temperature=0.3
        )
        
        test_content = code_response.choices[0].message.content.strip()
        
        # Remove markdown if present
        if test_content.startswith("```"):
            lines = test_content.split('\n')
            lines = lines[1:]
            if lines[-1].strip() == "```":
                lines = lines[:-1]
            test_content = '\n'.join(lines)
        
        save_path = os.path.join(project_folder, filename)
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        
        with open(save_path, 'w', encoding='utf-8') as f:
            f.write(test_content)
        
        print(f"✅ Created: {filename}")
        
        created_tests.append({
            "filename": filename,
            "description": description,
            "tests_for": tests_for
        })
    
    # Step 3 - Generate test report
    print("📊 Generating test report...")
    
    report = {
        "project": architecture['project_name'],
        "total_test_files": len(created_tests),
        "test_files": created_tests,
        "coverage_areas": [
            "Unit tests for all functions",
            "Integration tests for all API endpoints",
            "Authentication and authorization tests",
            "Error handling tests",
            "Edge case tests"
        ],
        "testing_framework": "Jest",
        "status": "tests_generated"
    }
    
    print(f"\n✅ Testing Agent completed!")
    print(f"🧪 Created {len(created_tests)} test files")
    
    return report


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
        ]
    }
    
    # List of files created by coding agent
    code_files = [
        "backend/server.js",
        "backend/routes/tasks.js",
        "backend/routes/users.js",
        "backend/models/User.js",
        "backend/models/Task.js"
    ]
    
    result = run_tester_agent(test_architecture, code_files)
    print("\n🧪 TEST REPORT:")
    print(json.dumps(result, indent=2))