import json
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import call_groq, clean_json

def run_planner_agent(project_description: str) -> dict:
    print(f"🗺️ Planner Agent starting...")
    print(f"📋 Project: {project_description}")

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

    response_text = call_groq(prompt, max_tokens=4096, temperature=0.7)
    response_text = clean_json(response_text)
    architecture = json.loads(response_text)

    print(f"✅ Planner Agent completed!")
    print(f"📐 Architecture created for: {architecture['project_name']}")
    return architecture


if __name__ == "__main__":
    test_description = "A todo app where users can create, edit and delete tasks."
    result = run_planner_agent(test_description)
    print(json.dumps(result, indent=2))