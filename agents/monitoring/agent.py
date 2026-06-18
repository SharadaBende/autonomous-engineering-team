import json
import os
import sys
import re
import time
import datetime
import urllib.request
import urllib.error
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import call_groq, clean_json


def extract_routes_from_code(project_folder: str) -> list:
    """
    Parse actual route decorators from generated code files.
    Supports FastAPI/Flask (@app.get, @app.post, @router.get, etc.)
    and Express (app.get, app.post, router.get, etc.)
    Returns list of {"method": "GET", "path": "/api/foo"} dicts.
    """
    routes = []
    seen = set()

    # Patterns for Python (FastAPI / Flask)
    python_pattern = re.compile(
        r'@(?:app|router)\.(get|post|put|patch|delete|head)\s*\(\s*["\']([^"\']+)["\']',
        re.IGNORECASE
    )
    # Patterns for Express JS
    express_pattern = re.compile(
        r'(?:app|router)\.(get|post|put|patch|delete)\s*\(\s*["\']([^"\']+)["\']',
        re.IGNORECASE
    )

    for root, _, files in os.walk(project_folder):
        for fname in files:
            if not (fname.endswith(".py") or fname.endswith(".js") or fname.endswith(".ts")):
                continue
            # Skip test files and monitoring files themselves
            if "test" in fname.lower() or "monitoring" in root:
                continue

            fpath = os.path.join(root, fname)
            try:
                with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
            except Exception:
                continue

            pattern = python_pattern if fname.endswith(".py") else express_pattern
            for match in pattern.finditer(content):
                method = match.group(1).upper()
                path = match.group(2)
                key = f"{method}:{path}"
                if key not in seen:
                    seen.add(key)
                    routes.append({"method": method, "path": path, "source_file": fname})

    return routes


def probe_endpoint(method: str, path: str, base_url: str, timeout: int = 5) -> dict:
    """
    Make a real HTTP request and return actual status + response time.
    Uses only stdlib (urllib) — no requests dependency needed.
    """
    url = base_url.rstrip("/") + path
    result = {
        "endpoint": path,
        "method": method,
        "url": url,
        "checked_at": datetime.datetime.now().isoformat(),
        "status": "unknown",
        "http_code": None,
        "response_time_ms": None,
        "error": None
    }

    try:
        req = urllib.request.Request(url, method=method)
        start = time.monotonic()
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            elapsed = (time.monotonic() - start) * 1000
            result["http_code"] = resp.status
            result["response_time_ms"] = round(elapsed, 1)
            result["status"] = "healthy"

    except urllib.error.HTTPError as e:
        elapsed = (time.monotonic() - start) * 1000
        result["http_code"] = e.code
        result["response_time_ms"] = round(elapsed, 1)
        # 4xx means the server is up and responding — not a monitoring failure
        result["status"] = "healthy" if e.code < 500 else "degraded"
        result["error"] = f"HTTP {e.code}: {e.reason}"

    except urllib.error.URLError as e:
        result["status"] = "unreachable"
        result["error"] = str(e.reason)

    except Exception as e:
        result["status"] = "error"
        result["error"] = str(e)

    return result


def run_monitoring_agent(
    architecture: dict,
    project_folder: str = "generated_projects",
    base_url: str = "http://localhost:8000",
    probe_live: bool = True
) -> dict:
    print(f"📊 Monitoring Agent starting...")
    print(f"📋 Setting up monitoring for: {architecture['project_name']}")

    monitoring_files = [
        {"filename": "monitoring/health_check.py", "description": "Health check script"},
        {"filename": "monitoring/metrics.py",       "description": "Metrics collection"},
        {"filename": "monitoring/alerts.py",        "description": "Alert rules"},
        {"filename": "monitoring/logger.py",        "description": "Structured logging"},
        {"filename": "monitoring/dashboard.py",     "description": "Dashboard data"},
        {"filename": "monitoring/prometheus.yml",   "description": "Prometheus config"},
        {"filename": "monitoring/grafana_dashboard.json", "description": "Grafana dashboard"}
    ]

    created_files = []

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
        - Use environment variables for configuration
        
        Return ONLY the raw file content, no explanations, no markdown.
        """

        try:
            file_content = call_groq(prompt, max_tokens=2000, temperature=0.2)

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

            print(f"✅ Created: {save_path}")
            created_files.append({"filename": filename, "description": description})

        except Exception as e:
            print(f"⚠️ Skipping {filename}: {e}")
            continue

    # ── NEW: derive routes from actual generated code ─────────────────────
    print("\n🔍 Scanning generated code for real routes...")
    real_routes = extract_routes_from_code(project_folder)

    if real_routes:
        print(f"  Found {len(real_routes)} routes in code:")
        for r in real_routes:
            print(f"    {r['method']} {r['path']}  ({r['source_file']})")
    else:
        # Fall back to architecture dict if parser found nothing
        print("  ⚠️  No routes parsed from code — falling back to architecture spec")
        real_routes = [
            {"method": e["method"], "path": e["path"], "source_file": "architecture_spec"}
            for e in architecture.get("api_endpoints", [])
        ]

    # ── NEW: actually probe each endpoint ────────────────────────────────
    print(f"\n🏥 Probing endpoints at {base_url}...")
    health_results = []

    for route in real_routes:
        if not probe_live:
            # Dry-run mode — skip network calls, mark as skipped
            health_results.append({
                "endpoint": route["path"],
                "method": route["method"],
                "status": "skipped",
                "http_code": None,
                "response_time_ms": None,
                "checked_at": datetime.datetime.now().isoformat(),
                "note": "probe_live=False — server not running during generation"
            })
            print(f"  ⏭️  {route['method']} {route['path']} — skipped (server not running)")
            continue

        result = probe_endpoint(route["method"], route["path"], base_url)
        health_results.append(result)

        icon = "✅" if result["status"] == "healthy" else "❌"
        ms = f"{result['response_time_ms']}ms" if result["response_time_ms"] else "—"
        code = result["http_code"] or result["error"] or "no response"
        print(f"  {icon} {route['method']} {route['path']} — {result['status']} ({code}, {ms})")

    # ── Summary counts ────────────────────────────────────────────────────
    healthy_count   = sum(1 for h in health_results if h["status"] == "healthy")
    degraded_count  = sum(1 for h in health_results if h["status"] == "degraded")
    unreachable_count = sum(1 for h in health_results if h["status"] in ("unreachable", "error"))

    times = [h["response_time_ms"] for h in health_results if h.get("response_time_ms")]
    avg_response_ms = round(sum(times) / len(times), 1) if times else None

    monitoring_report = {
        "project": architecture['project_name'],
        "timestamp": datetime.datetime.now().isoformat(),
        "total_files_created": len(created_files),
        "files": created_files,
        "routes_source": "parsed_from_code" if any(r.get("source_file") != "architecture_spec" for r in real_routes) else "architecture_spec_fallback",
        "health_checks": health_results,
        "metrics": {
            "total_endpoints_monitored": len(health_results),
            "healthy": healthy_count,
            "degraded": degraded_count,
            "unreachable": unreachable_count,
            "average_response_time_ms": avg_response_ms
        },
        "alerts_configured": [
            {"name": "High Response Time", "condition": "response_time > 1000ms", "severity": "warning"},
            {"name": "Service Down",        "condition": "health_check fails 3 times", "severity": "critical"},
            {"name": "High Error Rate",     "condition": "error_rate > 5%",        "severity": "high"},
            {"name": "High CPU Usage",      "condition": "cpu_usage > 80%",         "severity": "warning"}
        ],
        "monitoring_stack": {
            "metrics": "Prometheus",
            "dashboards": "Grafana",
            "logging": "Structured JSON logs",
            "alerting": "Slack + Email"
        },
        "status": "monitoring_setup_completed"
    }

    print(f"\n✅ Monitoring Agent completed!")
    print(f"📁 Created {len(created_files)} monitoring files")
    print(f"🏥 {healthy_count}/{len(health_results)} endpoints healthy")
    if unreachable_count:
        print(f"❌ {unreachable_count} endpoint(s) unreachable — server may not be running")

    return monitoring_report


if __name__ == "__main__":
    test_architecture = {
        "project_name": "TodoApp",
        "summary": "A todo app with user authentication",
        "tech_stack": {
            "frontend": "React",
            "backend": "Node.js with Express",
            "database": "MySQL",
        },
        "api_endpoints": [
            {"method": "POST", "path": "/api/users", "description": "Create user"},
            {"method": "GET",  "path": "/api/tasks",  "description": "Get tasks"}
        ]
    }
    # probe_live=False during generation (server isn't running yet)
    # flip to True to test against a running server
    result = run_monitoring_agent(
        test_architecture,
        "generated_projects/TodoApp",
        base_url="http://localhost:8000",
        probe_live=False
    )
    print(json.dumps(result, indent=2))