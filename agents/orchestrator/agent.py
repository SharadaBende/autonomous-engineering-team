import json
import os
import datetime
from dotenv import load_dotenv

load_dotenv()

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
    print("🧠 Orchestrator starting...")
    print(f"📋 Product: {product_description}")
    print("=" * 60)

    start_time = datetime.datetime.now()
    results = {}

    # ─── STEP 1: PLANNER ───
    print("\n🗺️  STEP 1/7 — Planner Agent")
    print("-" * 40)
    try:
        architecture = run_planner_agent(product_description)
        results['planner'] = {"status": "completed", "output": architecture}
        print("✅ Planner Agent — DONE")
    except Exception as e:
        print(f"❌ Planner Agent failed: {e}")
        results['planner'] = {"status": "failed", "error": str(e)}
        return results

    # Create project folder
    project_name = architecture.get('project_name', 'project').replace(' ', '_')
    project_folder = os.path.join('generated_projects', project_name)
    os.makedirs(project_folder, exist_ok=True)
    print(f"📁 Project folder: {project_folder}")

    # ─── STEP 2: RESEARCHER ───
    print("\n🔍 STEP 2/7 — Research Agent")
    print("-" * 40)
    try:
        research = run_researcher_agent(architecture)
        results['researcher'] = {"status": "completed", "output": research}
        print("✅ Research Agent — DONE")
    except Exception as e:
        print(f"❌ Research Agent failed: {e}")
        results['researcher'] = {"status": "failed", "error": str(e)}
        research = {"recommended_libraries": [], "security_considerations": []}

    # ─── STEP 3: CODER ───
    print("\n💻 STEP 3/7 — Coding Agent")
    print("-" * 40)
    try:
        code_output = run_coder_agent(architecture, research, project_folder)
        results['coder'] = {"status": "completed", "output": code_output}
        print("✅ Coding Agent — DONE")
    except Exception as e:
        print(f"❌ Coding Agent failed: {e}")
        results['coder'] = {"status": "failed", "error": str(e)}

    # ─── STEP 4: TESTER ───
    print("\n🧪 STEP 4/7 — Testing Agent")
    print("-" * 40)
    try:
        code_files = [
            os.path.join(project_folder, f['filename'])
            for f in code_output.get('files', [])
        ] if results['coder']['status'] == 'completed' else []
        test_report = run_tester_agent(architecture, code_files, project_folder)
        results['tester'] = {"status": "completed", "output": test_report}
        print("✅ Testing Agent — DONE")
    except Exception as e:
        print(f"❌ Testing Agent failed: {e}")
        results['tester'] = {"status": "failed", "error": str(e)}

    # ─── STEP 5: SECURITY ───
    print("\n🔒 STEP 5/7 — Security Agent")
    print("-" * 40)
    try:
        code_files = [
            os.path.join(project_folder, f['filename'])
            for f in code_output.get('files', [])
        ] if results['coder']['status'] == 'completed' else []
        security_report = run_security_agent(architecture, code_files)
        
        # Save report to project folder
        report_path = os.path.join(project_folder, 'security_report.json')
        with open(report_path, 'w') as f:
            json.dump(security_report, f, indent=2)
        
        results['security'] = {"status": "completed", "output": security_report}
        print("✅ Security Agent — DONE")
    except Exception as e:
        print(f"❌ Security Agent failed: {e}")
        results['security'] = {"status": "failed", "error": str(e)}

    # ─── STEP 6: DEVOPS ───
    print("\n⚙️  STEP 6/7 — DevOps Agent")
    print("-" * 40)
    try:
        devops_report = run_devops_agent(architecture, project_folder)
        
        # Save report to project folder
        report_path = os.path.join(project_folder, 'devops_report.json')
        with open(report_path, 'w') as f:
            json.dump(devops_report, f, indent=2)
        
        results['devops'] = {"status": "completed", "output": devops_report}
        print("✅ DevOps Agent — DONE")
    except Exception as e:
        print(f"❌ DevOps Agent failed: {e}")
        results['devops'] = {"status": "failed", "error": str(e)}

    # ─── STEP 7: MONITORING ───
    print("\n📊 STEP 7/7 — Monitoring Agent")
    print("-" * 40)
    try:
        monitoring_report = run_monitoring_agent(architecture, project_folder)
        
        # Save report to project folder
        report_path = os.path.join(project_folder, 'monitoring_report.json')
        with open(report_path, 'w') as f:
            json.dump(monitoring_report, f, indent=2)
        
        results['monitoring'] = {"status": "completed", "output": monitoring_report}
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
        "project_name": project_name,
        "project_folder": project_folder,
        "started_at": start_time.isoformat(),
        "completed_at": end_time.isoformat(),
        "duration_seconds": duration,
        "agents_completed": completed,
        "agents_failed": failed,
        "results": results,
        "status": "completed" if failed == 0 else "completed_with_errors"
    }

    # Save final report to project folder
    report_path = os.path.join(project_folder, 'final_report.json')
    with open(report_path, 'w') as f:
        json.dump(final_report, f, indent=2)

    print("\n" + "=" * 60)
    print("🎉 ORCHESTRATOR COMPLETED!")
    print("=" * 60)
    print(f"✅ Agents completed: {completed}/7")
    print(f"❌ Agents failed: {failed}/7")
    print(f"⏱️  Total time: {duration} seconds")
    print(f"📁 Project saved to: {project_folder}")

    return final_report


if __name__ == "__main__":
    product_description = input("🚀 Describe your product: ")
    result = run_orchestrator(product_description)