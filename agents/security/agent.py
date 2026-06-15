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

def read_code_files(files_list: list) -> dict:
    """Read all code files for security analysis"""
    files_content = {}
    for filepath in files_list:
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                files_content[filepath] = f.read()
    return files_content

def run_security_agent(architecture: dict, code_files: list) -> dict:
    """
    Reads all code files and performs security audit
    """
    
    print(f"🔒 Security Agent starting...")
    print(f"📋 Auditing: {architecture['project_name']}")
    
    # Read all code files
    print("📖 Reading code files for security analysis...")
    files_content = read_code_files(code_files)
    
    all_vulnerabilities = []
    file_reports = []
    
    # Audit each file one by one
    for filepath, content in files_content.items():
        print(f"🔍 Auditing {filepath}...")
        
        audit_prompt = f"""
        You are an expert security engineer and penetration tester.
        
        Audit this code file for security vulnerabilities:
        
        File: {filepath}
        Code:
        {content[:3000]}
        
        Check for:
        1. SQL Injection vulnerabilities
        2. XSS (Cross Site Scripting)
        3. Hardcoded secrets or passwords
        4. Weak authentication
        5. Insecure data storage
        6. Missing input validation
        7. CSRF vulnerabilities
        8. Insecure dependencies
        9. Sensitive data exposure
        10. Broken access control
        
        Return ONLY a JSON object like this:
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
            "secure_code_suggestions": [
                "suggestion 1",
                "suggestion 2"
            ]
        }}
        
        Return ONLY the JSON, no extra text.
        """
        
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": audit_prompt}],
            max_tokens=2000,
            temperature=0.1
        )
        
        result_text = clean_json(response.choices[0].message.content)
        
        try:
            file_report = json.loads(result_text)
            file_reports.append(file_report)
            all_vulnerabilities.extend(file_report.get('vulnerabilities', []))
            
            vuln_count = len(file_report.get('vulnerabilities', []))
            risk = file_report.get('risk_level', 'unknown')
            print(f"  ⚠️  Found {vuln_count} vulnerabilities - Risk: {risk}")
            
        except json.JSONDecodeError:
            print(f"  ⚠️  Could not parse report for {filepath}")
    
    # Count vulnerabilities by severity
    critical = len([v for v in all_vulnerabilities if v.get('severity') == 'critical'])
    high = len([v for v in all_vulnerabilities if v.get('severity') == 'high'])
    medium = len([v for v in all_vulnerabilities if v.get('severity') == 'medium'])
    low = len([v for v in all_vulnerabilities if v.get('severity') == 'low'])
    
    # Generate final security report
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
            "Implement proper input validation and sanitization",
            "Store secrets in environment variables never in code",
            "Use HTTPS for all communications",
            "Implement proper authentication and authorization",
            "Add rate limiting to prevent brute force attacks",
            "Keep all dependencies updated",
            "Implement proper error handling without exposing details"
        ],
        "status": "audit_completed"
    }
    
    # Save security report to file
    with open('security_report.json', 'w', encoding='utf-8') as f:
        json.dump(security_report, f, indent=2)
    
    print(f"\n✅ Security Agent completed!")
    print(f"📊 Audited {len(files_content)} files")
    print(f"🚨 Found {len(all_vulnerabilities)} total vulnerabilities")
    print(f"🔴 Critical: {critical}")
    print(f"🟠 High: {high}")
    print(f"🟡 Medium: {medium}")
    print(f"🟢 Low: {low}")
    print(f"📄 Report saved to security_report.json")
    
    return security_report


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
        }
    }
    
    # Files to audit
    code_files = [
        "backend/server.js",
        "backend/routes/tasks.js",
        "backend/routes/users.js",
        "backend/models/User.js",
        "backend/database/db.js"
    ]
    
    result = run_security_agent(test_architecture, code_files)
    print("\n🔒 SECURITY REPORT SUMMARY:")
    print(f"Total vulnerabilities: {result['total_vulnerabilities']}")
    print(f"Overall risk: {result['overall_risk']}")
    print(f"Severity: {json.dumps(result['severity_summary'], indent=2)}")