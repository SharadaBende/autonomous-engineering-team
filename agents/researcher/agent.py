import json
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import call_groq, clean_json

def run_researcher_agent(architecture: dict) -> dict:
    print(f"🔍 Research Agent starting...")
    print(f"📋 Researching for: {architecture['project_name']}")

    prompt = f"""
    You are a senior software engineer and technical researcher.
    
    A project has been planned with the following architecture:
    Project: {architecture['project_name']}
    Summary: {architecture['summary']}
    Tech Stack: {json.dumps(architecture['tech_stack'], indent=2)}
    Components: {json.dumps(architecture['components'], indent=2)}
    
    Your job is to research and provide detailed recommendations.
    
    Return ONLY a JSON response with these exact fields:
    {{
        "recommended_libraries": [
            {{
                "name": "library name",
                "purpose": "what it does",
                "why": "why we should use it",
                "install_command": "pip install x or npm install x"
            }}
        ],
        "similar_projects": [
            {{
                "name": "project name",
                "description": "what it does",
                "what_to_learn": "what we can learn from it"
            }}
        ],
        "best_practices": [
            {{
                "area": "area of concern",
                "practice": "what to do",
                "reason": "why this matters"
            }}
        ],
        "potential_pitfalls": [
            {{
                "pitfall": "what could go wrong",
                "solution": "how to avoid it"
            }}
        ],
        "security_considerations": [
            {{
                "concern": "security concern",
                "solution": "how to handle it"
            }}
        ],
        "estimated_complexity": "low/medium/high",
        "estimated_time": "estimated development time"
    }}
    
    Rules:
    - Return ONLY raw JSON, no markdown, no code fences, no extra text
    - No comments inside the JSON
    - All strings must be properly escaped
    - Do not truncate — complete the entire JSON
    """

    response_text = call_groq(prompt, max_tokens=8000, temperature=0.2)
    response_text = clean_json(response_text)

    try:
        research = json.loads(response_text)
    except json.JSONDecodeError as e:
        print(f"❌ Failed to parse JSON: {e}")
        print(f"Raw response:\n{response_text[:500]}")
        raise

    print(f"✅ Research Agent completed!")
    print(f"📚 Found {len(research['recommended_libraries'])} libraries")
    print(f"⚠️  Found {len(research['potential_pitfalls'])} potential pitfalls")
    return research


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
        "components": [
            {
                "name": "User Authentication",
                "description": "Handles user sign up and login",
                "technology": "JWT"
            }
        ]
    }
    result = run_researcher_agent(test_architecture)
    print(json.dumps(result, indent=2))