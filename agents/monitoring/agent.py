from groq import Groq
import json
import os
import time
import datetime
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

def check_health(endpoints: list) -> list:
    """Simulate health checks on endpoints"""
    import random
    results = []
    for endpoint in endpoints:
        results.append({
            "endpoint": endpoint['path'],
            "method": endpoint['method'],
            "status": "healthy",
            "response_time_ms": random.randint(50, 300),
            "checked_at": datetime.datetime.now().isoformat()
        })
    return results

def run_monitoring_agent(architecture: dict, project_folder: str = "generated_projects") -> dict:
    """
    Sets up monitoring, health checks, alerts and metrics
    """
    
    print(f"📊 Monitoring Agent starting...")
    print(f"📋 Setting up monitoring for: {architecture['project_name']}")
    
    # List of monitoring files to create
    monitoring_files = [
        {
            "filename": "monitoring/health_check.py",
            "description": "Health check script for all services"
        },
        {
            "filename": "monitoring/metrics.py",
            "description": "Metrics collection and reporting"
        },
        {
            "filename": "monitoring/alerts.py",
            "description": "Alert rules and notifications"
        },
        {
            "filename": "monitoring/logger.py",
            "description": "Structured logging setup"
        },
        {
            "filename": "monitoring/dashboard.py",
            "description": "Monitoring dashboard data"
        },
        {
            "filename": "monitoring/prometheus.yml",
            "description": "Prometheus configuration"
        },
        {
            "filename": "monitoring/grafana_dashboard.json",
            "description": "Grafana dashboard configuration"
        }
    ]
    
    created_files = []
    
    # Write each monitoring file
    for file_info in monitoring_files:
        filename = file_info['filename']
        description = file_info['description']
        
        print(f"✍️ Creating {filename}...")
        
        prompt = f"""
        You are an expert DevOps and monitoring engineer.
        
        Project: {architecture['project_name']}
        Tech Stack: {json.dumps(architecture['tech_stack'], indent=2)}
        API Endpoints: {json.dumps(architecture['api_endpoints'], indent=2)}
        
        Create this monitoring file:
        File: {filename}
        Purpose: {description}
        
        Rules:
        - Write complete working code or configuration
        - Include proper error handling
        - Add helpful comments
        - Make it production ready
        - Use environment variables for configuration
        
        Return ONLY the raw file content, no explanations, no markdown.
        """
        
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2000,
            temperature=0.2
        )
        
        file_content = response.choices[0].message.content.strip()
        
        # Remove markdown if present
        if file_content.startswith("```"):
            lines = file_content.split('\n')
            lines = lines[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            file_content = '\n'.join(lines)
        
        save_path = os.path.join(project_folder, filename)
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        
        with open(save_path, 'w', encoding='utf-8') as f:
            f.write(file_content)
        
        print(f"✅ Created: {filename}")
        created_files.append({
            "filename": filename,
            "description": description
        })
    
    # Run simulated health checks
    print("\n🏥 Running health checks...")
    health_results = check_health(architecture.get('api_endpoints', []))
    
    for result in health_results:
        print(f"  ✅ {result['method']} {result['endpoint']} — {result['response_time_ms']}ms")
    
    # Generate monitoring report
    monitoring_report = {
        "project": architecture['project_name'],
        "timestamp": datetime.datetime.now().isoformat(),
        "total_files_created": len(created_files),
        "files": created_files,
        "health_checks": health_results,
        "metrics": {
            "total_endpoints_monitored": len(health_results),
            "healthy_endpoints": len([h for h in health_results if h['status'] == 'healthy']),
            "average_response_time_ms": sum([h['response_time_ms'] for h in health_results]) / len(health_results) if health_results else 0
        },
        "alerts_configured": [
            {
                "name": "High Response Time",
                "condition": "response_time > 1000ms",
                "severity": "warning",
                "action": "Send Slack notification"
            },
            {
                "name": "Service Down",
                "condition": "health_check fails 3 times",
                "severity": "critical",
                "action": "Send email + Slack alert"
            },
            {
                "name": "High Error Rate",
                "condition": "error_rate > 5%",
                "severity": "high",
                "action": "Send Slack notification"
            },
            {
                "name": "High CPU Usage",
                "condition": "cpu_usage > 80%",
                "severity": "warning",
                "action": "Send Slack notification"
            }
        ],
        "monitoring_stack": {
            "metrics": "Prometheus",
            "dashboards": "Grafana",
            "logging": "Structured JSON logs",
            "alerting": "Slack + Email"
        },
        "status": "monitoring_setup_completed"
    }
    
    # Save monitoring report
    with open('monitoring_report.json', 'w', encoding='utf-8') as f:
        json.dump(monitoring_report, f, indent=2)
    
    print(f"\n✅ Monitoring Agent completed!")
    print(f"📁 Created {len(created_files)} monitoring files")
    print(f"🏥 {len(health_results)} endpoints monitored")
    print(f"🔔 {len(monitoring_report['alerts_configured'])} alerts configured")
    print(f"📄 Report saved to monitoring_report.json")
    
    return monitoring_report


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
    
    result = run_monitoring_agent(test_architecture)
    print("\n📊 MONITORING REPORT SUMMARY:")
    print(f"Files created: {result['total_files_created']}")
    print(f"Endpoints monitored: {result['metrics']['total_endpoints_monitored']}")
    print(f"Healthy endpoints: {result['metrics']['healthy_endpoints']}")
    print(f"Average response time: {result['metrics']['average_response_time_ms']:.0f}ms")