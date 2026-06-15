from groq import Groq
import json
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def run_researcher_agent(architecture: dict) -> dict:
    """
    Takes the architecture from Planner Agent and researches
    best libraries, practices and potential pitfalls
    """
    
    print(f"🔍 Research Agent starting...")
    print(f"📋 Researching for: {architecture['project_name']}")
    
    # Build prompt from architecture
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
    
    Return ONLY the JSON, no extra text.
    """
    
    # Call Groq API
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": prompt}
        ],
        max_tokens=4096,
        temperature=0.7
    )
    
    # Get response text
    response_text = response.choices[0].message.content
    
    # Clean markdown code blocks if present
    response_text = response_text.strip()
    if response_text.startswith("```json"):
        response_text = response_text[7:]
    if response_text.startswith("```"):
        response_text = response_text[3:]
    if response_text.endswith("```"):
        response_text = response_text[:-3]
    response_text = response_text.strip()
    
    # Parse JSON
    research = json.loads(response_text)
    
    print(f"✅ Research Agent completed!")
    print(f"📚 Found {len(research['recommended_libraries'])} libraries")
    print(f"⚠️ Found {len(research['potential_pitfalls'])} potential pitfalls")
    
    return research


# Test the agent directly
if __name__ == "__main__":
    # Simulate architecture from planner agent
    test_architecture = {
        "project_name": "TodoApp",
        "summary": "A todo app where users can create, edit and delete tasks with priorities and due dates, and user authentication",
        "tech_stack": {
            "frontend": "React",
            "backend": "Node.js with Express",
            "database": "MySQL",
            "cache": "Redis",
            "deployment": "Docker with Kubernetes"
        },
        "components": [
            {
                "name": "User Authentication",
                "description": "Handles user sign up, log in, and session management",
                "technology": "Node.js with Express and Passport.js"
            },
            {
                "name": "Task Management",
                "description": "Handles task creation, editing, and deletion",
                "technology": "Node.js with Express"
            }
        ]
    }
    
    result = run_researcher_agent(test_architecture)
    print("\n📚 RESEARCH OUTPUT:")
    print(json.dumps(result, indent=2))