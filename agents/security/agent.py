import json
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import call_groq, clean_json

def read_code_files(files_list: list) -> dict:
    files_content = {}
    for filepath in files_list:
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                files_content[filepath] = f.read()
    return files_content

def run_security_agent(architecture: dict, code_files: list) -> dict:
    print(f"🔒 Security Agent starting...")
    print(f"📋 Auditing: {architecture['project_name']}")

    print("📖 Reading code files for security analysis...")
    files_content = read_code_files(code_files)

    all_vulnerabilities = []
    file_reports = []

    for filepath, content in files_content.items():
        print(f"🔍 Auditing {filepath}...")

        audit_prompt = f"""
        You are an expert security engineer.
        
        Audit this code file for security vulnerabilities:
        File: {filepath}
        Code:
        {content[:3000]}
        
        Check for:
        1. SQL Injection
        2. XSS
        3. Hardcoded secrets
        4. Weak authentication
        5. Missing input validation
        6. CSRF vulnerabilities
        7. Sensitive data exposure
        
        Return ONLY a JSON object:
        {{
            "file": "{filepath}",
            "risk_level": "low/medium/high/critical",
            "vulnerabilities": [
                {{
                    "type": "vulnerability type",
                    "severity": "low/medium/high/critical",
                    "line_area": "which part of code",
                    "description": "what the vulnerability is",
                    "fix": "how to fix it"
                }}
            ],
            "secure_code_suggestions": ["suggestion 1", "suggestion 2"]
        }}
        Return ONLY the JSON, no extra text.
        """

        try:
            result_text = call_groq(audit_prompt, max_tokens=2000, temperature=0.1)
            result_text = clean_json(result_text)
            file_report = json.loads(result_text)
            file_reports.append(file_report)
            all_vulnerabilities.extend(file_report.get('vulnerabilities', []))

            vuln_count = len(file_report.get('vulnerabilities', []))
            risk = file_report.get('risk_level', 'unknown')
            print(f"  ⚠️  Found {vuln_count} vulnerabilities - Risk: {risk}")

        except Exception as e:
            print(f"  ⚠️  Could not audit {filepath}: {e}")
            continue

    critical = len([v for v in all_vulnerabilities if v.get('severity') == 'critical'])
    high = len([v for v in all_vulnerabilities if v.get('severity') == 'high'])
    medium = len([v for v in all_vulnerabilities if v.get('severity') == 'medium'])
    low = len([v for v in all_vulnerabilities if v.get('severity') == 'low'])

    security_report = {
        "project": architecture['project_name'],
        "total_files_audited": len(files_content),
        "total_vulnerabilities": len(all_vulnerabilities),
        "severity_summary": {
            "critical": critical,
            "high": high,
            "medium": medium,
            "low": low
        },
        "overall_risk": "critical" if critical > 0 else "high" if high > 0 else "medium" if medium > 0 else "low",
        "file_reports": file_reports,
        "top_recommendations": [
            "Use parameterized queries to prevent SQL injection",
            "Implement proper input validation",
            "Store secrets in environment variables",
            "Use HTTPS for all communications",
            "Implement rate limiting"
        ],
        "status": "audit_completed"
    }

    print(f"\n✅ Security Agent completed!")
    print(f"📊 Audited {len(files_content)} files")
    print(f"🚨 Found {len(all_vulnerabilities)} total vulnerabilities")
    print(f"🔴 Critical: {critical}")
    print(f"🟠 High: {high}")
    print(f"🟡 Medium: {medium}")
    print(f"🟢 Low: {low}")

    return security_report


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
        }
    }
    code_files = [
        "backend/server.js",
        "backend/routes/tasks.js"
    ]
    result = run_security_agent(test_architecture, code_files)
    print(json.dumps(result, indent=2))