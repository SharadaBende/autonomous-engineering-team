import json
import os
import datetime
from dotenv import load_dotenv

load_dotenv()

# Import all agents
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from planner.agent import run_planner_agent
from researcher.agent import run_researcher_agent
from coder.agent import run_coder_agent
from tester.agent import run_tester_agent
from security.agent import run_security_agent
from devops.agent import run_devops_agent
from monitoring.agent import run_monitoring_agent

def run_orchestrator(product_description: str) -> dict:
    """
    The brain — runs all agents in order and connects them together
    """
    
    print("🧠 Orchestrator starting...")
    print(f"📋 Product: {product_description}")
    print("=" * 60)
    
    start_time = datetime.datetime.now()
    results = {}
    
    # ─── STEP 1: PLANNER AGENT ───
    print("\n🗺️  STEP 1/7 — Planner Agent")
    print("-" * 40)
    try:
        architecture = run_planner_agent(product_description)
        results['planner'] = {
            "status": "completed",
            "output": architecture
        }
        print("✅ Planner Agent — DONE")
    except Exception as e:
        print(f"❌ Planner Agent failed: {e}")
        results['planner'] = {"status": "failed", "error": str(e)}
        return results

    # ─── STEP 2: RESEARCH AGENT ───
    print("\n🔍 STEP 2/7 — Research Agent")
    print("-" * 40)
    try:
        research = run_researcher_agent(architecture)
        results['researcher'] = {
            "status": "completed",
            "output": research
        }
        print("✅ Research Agent — DONE")
    except Exception as e:
        print(f"❌ Research Agent failed: {e}")
        results['researcher'] = {"status": "failed", "error": str(e)}

    # ─── STEP 3: CODING AGENT ───
    print("\n💻 STEP 3/7 — Coding Agent")
    print("-" * 40)
    try:
        code_files_list = [
            "backend/server.js",
            "backend/routes/tasks.js",
            "backend/routes/users.js",
            "backend/models/User.js",
            "backend/models/Task.js",
            "backend/database/db.js"
        ]
        code_output = run_coder_agent(architecture, research)
        results['coder'] = {
            "status": "completed",
            "output": code_output
        }
        print("✅ Coding Agent — DONE")
    except Exception as e:
        print(f"❌ Coding Agent failed: {e}")
        results['coder'] = {"status": "failed", "error": str(e)}

    # ─── STEP 4: TESTING AGENT ───
    print("\n🧪 STEP 4/7 — Testing Agent")
    print("-" * 40)
    try:
        code_files = [
            "backend/server.js",
            "backend/routes/tasks.js",
            "backend/routes/users.js",
            "backend/models/User.js",
            "backend/database/db.js"
        ]
        test_report = run_tester_agent(architecture, code_files)
        results['tester'] = {
            "status": "completed",
            "output": test_report
        }
        print("✅ Testing Agent — DONE")
    except Exception as e:
        print(f"❌ Testing Agent failed: {e}")
        results['tester'] = {"status": "failed", "error": str(e)}

    # ─── STEP 5: SECURITY AGENT ───
    print("\n🔒 STEP 5/7 — Security Agent")
    print("-" * 40)
    try:
        security_report = run_security_agent(architecture, code_files)
        results['security'] = {
            "status": "completed",
            "output": security_report
        }
        print("✅ Security Agent — DONE")
    except Exception as e:
        print(f"❌ Security Agent failed: {e}")
        results['security'] = {"status": "failed", "error": str(e)}

    # ─── STEP 6: DEVOPS AGENT ───
    print("\n⚙️  STEP 6/7 — DevOps Agent")
    print("-" * 40)
    try:
        devops_report = run_devops_agent(architecture)
        results['devops'] = {
            "status": "completed",
            "output": devops_report
        }
        print("✅ DevOps Agent — DONE")
    except Exception as e:
        print(f"❌ DevOps Agent failed: {e}")
        results['devops'] = {"status": "failed", "error": str(e)}

    # ─── STEP 7: MONITORING AGENT ───
    print("\n📊 STEP 7/7 — Monitoring Agent")
    print("-" * 40)
    try:
        monitoring_report = run_monitoring_agent(architecture)
        results['monitoring'] = {
            "status": "completed",
            "output": monitoring_report
        }
        print("✅ Monitoring Agent — DONE")
    except Exception as e:
        print(f"❌ Monitoring Agent failed: {e}")
        results['monitoring'] = {"status": "failed", "error": str(e)}

    # ─── FINAL REPORT ───
    end_time = datetime.datetime.now()
    duration = (end_time - start_time).seconds

    completed = len([r for r in results.values() if r['status'] == 'completed'])
    failed = len([r for r in results.values() if r['status'] == 'failed'])

    final_report = {
        "product_description": product_description,
        "started_at": start_time.isoformat(),
        "completed_at": end_time.isoformat(),
        "duration_seconds": duration,
        "agents_completed": completed,
        "agents_failed": failed,
        "results": results,
        "status": "completed" if failed == 0 else "completed_with_errors"
    }

    # Save final report
    with open('final_report.json', 'w', encoding='utf-8') as f:
        json.dump(final_report, f, indent=2)

    print("\n" + "=" * 60)
    print("🎉 ORCHESTRATOR COMPLETED!")
    print("=" * 60)
    print(f"✅ Agents completed: {completed}/7")
    print(f"❌ Agents failed: {failed}/7")
    print(f"⏱️  Total time: {duration} seconds")
    print(f"📄 Full report saved to final_report.json")

    return final_report


# Run the orchestrator
if __name__ == "__main__":
    product_description = input("🚀 Describe your product: ")
    result = run_orchestrator(product_description)