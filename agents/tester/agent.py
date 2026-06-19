import json
import os
import sys
import re
import subprocess
import shutil
import time
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import call_groq, clean_json

def read_project_files(files_list: list) -> dict:
    files_content = {}
    for filepath in files_list:
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                files_content[filepath] = f.read()
    return files_content

def read_project_files(files_list: list) -> dict:
    files_content = {}
    for filepath in files_list:
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                files_content[filepath] = f.read()
    return files_content


def install_dependencies(project_folder: str, tech_stack: dict) -> None:
    backend = tech_stack.get("backend", "").lower()
    req_file = os.path.join(project_folder, "requirements.txt")
    pkg_file = os.path.join(project_folder, "package.json")

    if ("python" in backend or "fastapi" in backend or "flask" in backend or "django" in backend) and os.path.exists(req_file):
        print(f"📦 Installing Python dependencies from {req_file}...")
        subprocess.run(
            [sys.executable, "-m", "pip", "install", "-r", req_file, "--quiet"],
            cwd=project_folder,
            timeout=120
        )
    elif os.path.exists(pkg_file):
        print(f"📦 Installing npm dependencies in {project_folder}...")
        npm = shutil.which("npm")
        if npm:
            subprocess.run([npm, "install"], cwd=project_folder, timeout=180)




def detect_test_framework(tech_stack: dict, filename: str) -> str:
    backend = tech_stack.get("backend", "").lower()
    if filename.endswith(".py") or "python" in backend or "fastapi" in backend or "flask" in backend or "django" in backend:
        return "pytest"
    return "jest"


def run_tests(test_filepath: str, framework: str, project_folder: str) -> dict:
    result_base = {"passed": 0, "failed": 0, "errors": [], "output": "", "ran_ok": False}

    if framework == "pytest":
        runner = shutil.which("pytest") or shutil.which("python")
        if not runner:
            result_base["errors"].append("pytest not found in PATH — install with: pip install pytest")
            return result_base
        cmd = [runner, "-v", "--tb=short", test_filepath] if "pytest" in runner else [runner, "-m", "pytest", "-v", "--tb=short", test_filepath]

    elif framework == "jest":
        runner = shutil.which("npx")
        if not runner:
            result_base["errors"].append("npx not found in PATH — install Node.js to run Jest tests")
            return result_base
        cmd = [runner, "jest", "--no-coverage", "--forceExit", test_filepath]

    else:
        result_base["errors"].append(f"Unknown framework: {framework}")
        return result_base

    try:
        proc = subprocess.run(
            cmd,
            cwd=project_folder,
            capture_output=True,
            text=True,
            timeout=60
        )
        output = proc.stdout + proc.stderr
        result_base["output"] = output[:3000]
        result_base["ran_ok"] = True

        if framework == "pytest":
            for line in output.splitlines():
                if "passed" in line or "failed" in line or "error" in line:
                    passed = re.search(r"(\d+) passed", line)
                    failed = re.search(r"(\d+) failed", line)
                    errors = re.search(r"(\d+) error", line)
                    if passed:
                        result_base["passed"] = int(passed.group(1))
                    if failed:
                        result_base["failed"] = int(failed.group(1))
                    if errors:
                        result_base["errors"].append(f"{errors.group(1)} error(s) during collection/run")

        elif framework == "jest":
            passed = re.search(r"(\d+) passed", output)
            failed = re.search(r"(\d+) failed", output)
            if passed:
                result_base["passed"] = int(passed.group(1))
            if failed:
                result_base["failed"] = int(failed.group(1))

    except subprocess.TimeoutExpired:
        result_base["errors"].append("Test run timed out after 60 seconds")
    except Exception as e:
        result_base["errors"].append(f"Subprocess error: {str(e)}")

    return result_base


def run_tester_agent(architecture: dict, code_files: list, project_folder: str = "generated_projects") -> dict:
    print(f"🧪 Testing Agent starting...")
    print(f"📋 Writing tests for: {architecture['project_name']}")
    print("📖 Reading generated code files...")
    files_content = read_project_files(code_files)

    install_dependencies(project_folder, architecture['tech_stack'])
    
    files_prompt = f"""
    You are an expert software tester.
    Project: {architecture['project_name']}
    Tech Stack: {json.dumps(architecture['tech_stack'], indent=2)}
    
    These files were generated:
    {json.dumps(list(files_content.keys()), indent=2)}
    
    List all test files needed for this project.
    Return ONLY a JSON array, no markdown, no extra text:
    [
        {{"filename": "tests/test_server.py", "description": "tests for server", "tests_for": "backend/server.py"}}
    ]
    """

    files_text = call_groq(files_prompt, max_tokens=2000, temperature=0.2)
    files_text = clean_json(files_text)

    try:
        test_files_list = json.loads(files_text)
    except json.JSONDecodeError as e:
        print(f"❌ Failed to parse test file list: {e}")
        print(f"Raw response:\n{files_text[:500]}")
        raise

    print(f"📁 Will create {len(test_files_list)} test files")

    created_tests = []
    all_passed = 0
    all_failed = 0
    execution_errors = []

    for test_info in test_files_list:
        filename = test_info['filename']
        description = test_info['description']
        tests_for = test_info.get('tests_for', '')
        print(f"✍️  Writing {filename}...")

        source_code = files_content.get(tests_for, "# Source file not found")
        framework = detect_test_framework(architecture['tech_stack'], filename)

        if framework == "pytest":
            test_instructions = """
        Use pytest. Import from the source file using relative imports or sys.path.
        Do NOT use unittest.TestCase — use plain pytest functions (def test_...).
        Include fixtures where appropriate.
        """
        else:
            test_instructions = """
        Use Jest (describe/it/expect). Import using require() or ES module imports.
        Mock external dependencies (databases, APIs) with jest.mock().
        """

        test_prompt = f"""
        You are an expert software tester.
        Write complete, EXECUTABLE tests for this file:

        File to test: {tests_for}
        Source code:
        {source_code[:4000]}
        
        {test_instructions}
        
        Write tests for:
        - Each function/endpoint (happy path)
        - Edge cases (empty input, invalid types, missing fields)
        - Error handling (what happens when things fail)
        
        Return ONLY the raw test code. No explanations. No markdown fences (no ```).
        """

        try:
            test_content = call_groq(test_prompt, max_tokens=8000, temperature=0.3)

            # Strip markdown fences if Gemini adds them anyway
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

            print(f"▶️  Running {filename} with {framework}...")
            run_result = run_tests(save_path, framework, project_folder)

            status_icon = "✅" if run_result["failed"] == 0 and run_result["ran_ok"] else "❌"
            print(f"{status_icon} {filename}: {run_result['passed']} passed, {run_result['failed']} failed")

            if run_result["errors"]:
                for err in run_result["errors"]:
                    print(f"   ⚠️  {err}")

            all_passed += run_result["passed"]
            all_failed += run_result["failed"]
            if run_result["errors"]:
                execution_errors.extend([f"{filename}: {e}" for e in run_result["errors"]])

            created_tests.append({
                "filename": filename,
                "description": description,
                "tests_for": tests_for,
                "framework": framework,
                "run_result": {
                    "passed": run_result["passed"],
                    "failed": run_result["failed"],
                    "ran_ok": run_result["ran_ok"],
                    "errors": run_result["errors"],
                    "output_preview": run_result["output"][:500] if run_result["output"] else ""
                }
            })

            # Pause between files to avoid rate limits
            time.sleep(2)

        except Exception as e:
            print(f"⚠️  Skipping {filename}: {e}")
            continue

    if all_failed == 0 and all_passed > 0:
        overall_status = "all_tests_passed"
    elif all_failed > 0:
        overall_status = "some_tests_failed"
    elif not any(t["run_result"]["ran_ok"] for t in created_tests):
        overall_status = "tests_generated_not_executed"
    else:
        overall_status = "tests_generated"

    report = {
        "project": architecture['project_name'],
        "total_test_files": len(created_tests),
        "test_files": created_tests,
        "summary": {
            "total_passed": all_passed,
            "total_failed": all_failed,
            "execution_errors": execution_errors,
        },
        "status": overall_status,
    }

    print(f"\n{'✅' if overall_status == 'all_tests_passed' else '⚠️'} Testing Agent completed!")
    print(f"🧪 {len(created_tests)} test files | {all_passed} passed | {all_failed} failed")
    if execution_errors:
        print(f"⚠️  Execution issues: {len(execution_errors)}")

    return report


if __name__ == "__main__":
    test_architecture = {
        "project_name": "TodoApp",
        "summary": "A todo app with user authentication",
        "tech_stack": {
            "frontend": "React",
            "backend": "Python FastAPI",
            "database": "MySQL",
        },
        "api_endpoints": [
            {"method": "POST", "path": "/api/users", "description": "Create user"},
            {"method": "GET", "path": "/api/tasks", "description": "Get tasks"}
        ]
    }
    code_files = [
        "backend/server.py",
        "backend/routes/tasks.py"
    ]
    result = run_tester_agent(test_architecture, code_files, "generated_projects/TodoApp")
    print(json.dumps(result, indent=2))