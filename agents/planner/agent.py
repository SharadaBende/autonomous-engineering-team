from groq import Groq
import json
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def run_planner_agent(project_description: str) -> dict:
    """
    Takes a project description and returns a full technical architecture
    """
    
    print(f"🗺️ Planner Agent starting...")
    print(f"📋 Project: {project_description}")
    
    # The prompt we send to Groq
    prompt = f"""
    You are a senior software architect. A client has described a product they want built.
    
    Your job is to create a detailed technical architecture for this product.
    
    Product Description:
    {project_description}
    
    Please provide a complete technical architecture in JSON format with these exact fields:
    {{
        "project_name": "name of the project",
        "summary": "brief summary of what we are building",
        "tech_stack": {{
            "frontend": "technology choice",
            "backend": "technology choice",
            "database": "technology choice",
            "cache": "technology choice",
            "deployment": "technology choice"
        }},
        "components": [
            {{
                "name": "component name",
                "description": "what this component does",
                "technology": "technology used"
            }}
        ],
        "api_endpoints": [
            {{
                "method": "GET/POST/PUT/DELETE",
                "path": "/api/example",
                "description": "what this endpoint does"
            }}
        ],
        "database_tables": [
            {{
                "name": "table name",
                "fields": ["field1", "field2", "field3"]
            }}
        ],
        "development_phases": [
            {{
                "phase": 1,
                "name": "phase name",
                "tasks": ["task1", "task2"]
            }}
        ]
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
    
    # Get the response text
    response_text = response.choices[0].message.content
    
    # Clean the response - remove markdown code blocks if present
    response_text = response_text.strip()
    if response_text.startswith("```json"):
        response_text = response_text[7:]
    if response_text.startswith("```"):
        response_text = response_text[3:]
    if response_text.endswith("```"):
        response_text = response_text[:-3]
    response_text = response_text.strip()
    
    # Parse JSON response
    architecture = json.loads(response_text)
    
    print(f"✅ Planner Agent completed!")
    print(f"📐 Architecture created for: {architecture['project_name']}")
    
    return architecture


# Test the agent directly
if __name__ == "__main__":
    test_description = "A todo app where users can create, edit and delete tasks. Users should be able to sign up and log in. Tasks should have priorities and due dates."
    
    result = run_planner_agent(test_description)
    print("\n📐 ARCHITECTURE OUTPUT:")
    print(json.dumps(result, indent=2))