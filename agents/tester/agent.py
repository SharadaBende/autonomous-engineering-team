import json
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import call_groq, clean_json

def read_project_files(files_list: list) -> dict:
    files_content = {}
    for filepath in files_list:
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                files_content[filepath] = f.read()
    return files_content

def run_tester_agent(architecture: dict, code_files: list, project_folder: str = "generated_projects") -> dict:
    print(f"🧪 Testing Agent starting...")
    print(f"📋 Writing tests for: {architecture['project_name']}")

    print("📖 Reading generated code files...")
    files_content = read_project_files(code_files)

    files_prompt = f"""
    You are an expert software tester.
    Project: {architecture['project_name']}
    Tech Stack: {json.dumps(architecture['tech_stack'], indent=2)}
    
    These files were generated:
    {json.dumps(list(files_content.keys()), indent=2)}
    
    List all test files needed for this project.
    Return ONLY a JSON array:
    [
        {{"filename": "backend/tests/server.test.js", "description": "tests for server", "tests_for": "backend/server.js"}}
    ]
    Return ONLY the JSON array, no extra text.
    """

    files_text = call_groq(files_prompt, max_tokens=1000, temperature=0.3)
    files_text = clean_json(files_text)
    test_files_list = json.loads(files_text)
    print(f"📁 Will create {len(test_files_list)} test files")

    created_tests = []

    for test_info in test_files_list:
        filename = test_info['filename']
        description = test_info['description']
        tests_for = test_info.get('tests_for', '')
        print(f"✍️ Writing {filename}...")

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
        
        Use Jest for JavaScript testing.
        Return ONLY the raw test code, no explanations, no markdown.
        """

        try:
            test_content = call_groq(test_prompt, max_tokens=2000, temperature=0.3)

            if test_content.startswith("```"):
                lines = test_content.split('\n')
                lines = lines[1:]
                if lines and lines[-1].strip() == "```":
                    lines = lines[:-1]
                test_content = '\n'.join(lines)

            save_path = os.path.join(project_folder, filename)
            os.makedirs(os.path.dirname(save_path), exist_ok=True)

            with open(save_path, 'w', encoding='utf-8') as f:
                f.write(test_content)

            print(f"✅ Created: {save_path}")
            created_tests.append({
                "filename": filename,
                "description": description,
                "tests_for": tests_for
            })

        except Exception as e:
            print(f"⚠️ Skipping {filename}: {e}")
            continue

    report = {
        "project": architecture['project_name'],
        "total_test_files": len(created_tests),
        "test_files": created_tests,
        "testing_framework": "Jest",
        "status": "tests_generated"
    }

    print(f"\n✅ Testing Agent completed!")
    print(f"🧪 Created {len(created_tests)} test files")
    return report


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
        ]
    }
    code_files = [
        "backend/server.js",
        "backend/routes/tasks.js"
    ]
    result = run_tester_agent(test_architecture, code_files, "generated_projects/TodoApp")
    print(json.dumps(result, indent=2))