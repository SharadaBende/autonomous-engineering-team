import React, { useState, useEffect } from 'react';

const AGENTS = [
  { id: 1, name: 'Planner', icon: '🗺️', key: 'planner', desc: 'Architecture & scope' },
  { id: 2, name: 'Researcher', icon: '🔍', key: 'researcher', desc: 'Libraries & best practices' },
  { id: 3, name: 'Coder', icon: '💻', key: 'coder', desc: 'Source code generation' },
  { id: 4, name: 'Tester', icon: '🧪', key: 'tester', desc: 'Test suite creation' },
  { id: 5, name: 'Security', icon: '🔒', key: 'security', desc: 'Vulnerability audit' },
  { id: 6, name: 'DevOps', icon: '⚙️', key: 'devops', desc: 'Docker & CI/CD' },
  { id: 7, name: 'Monitor', icon: '📊', key: 'monitoring', desc: 'Health checks & alerts' },
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #080d1a;
    color: #e2e8f0;
    font-family: 'Inter', sans-serif;
    min-height: 100vh;
  }

  .app { min-height: 100vh; background: #080d1a; }

  /* Header */
  .header {
    background: rgba(10,15,30,0.95);
    border-bottom: 1px solid #1e2a45;
    padding: 0 32px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(12px);
  }
  .header-brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .header-logo {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    box-shadow: 0 0 20px rgba(99,102,241,0.4);
  }
  .header-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: #f1f5f9;
    letter-spacing: -0.3px;
  }
  .header-sub {
    font-size: 12px;
    color: #475569;
    margin-top: 1px;
  }
  .header-status {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #475569;
  }
  .pulse-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 8px #10b981;
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.85); }
  }

  /* Tabs */
  .tabs {
    background: rgba(10,15,30,0.95);
    border-bottom: 1px solid #1e2a45;
    padding: 0 32px;
    display: flex;
    gap: 2px;
  }
  .tab-btn {
    padding: 12px 20px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: #475569;
    font-size: 13.5px;
    font-weight: 500;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: all 0.15s;
  }
  .tab-btn.active {
    border-bottom-color: #6366f1;
    color: #e2e8f0;
    font-weight: 600;
  }
  .tab-btn:hover:not(.active) { color: #94a3b8; }

  /* Main content */
  .main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 28px 32px;
  }

  /* Input card */
  .input-card {
    background: #0e1628;
    border: 1px solid #1e2a45;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 24px;
    position: relative;
    overflow: hidden;
  }
  .input-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #6366f1, transparent);
  }
  .input-label {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: #f1f5f9;
    margin-bottom: 6px;
    letter-spacing: -0.3px;
  }
  .input-hint {
    font-size: 13px;
    color: #475569;
    margin-bottom: 16px;
  }
  .product-textarea {
    width: 100%;
    min-height: 90px;
    background: #080d1a;
    border: 1px solid #1e2a45;
    border-radius: 10px;
    padding: 14px 16px;
    color: #e2e8f0;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    resize: vertical;
    outline: none;
    transition: border-color 0.15s;
    line-height: 1.6;
  }
  .product-textarea::placeholder { color: #334155; }
  .product-textarea:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
  .build-btn {
    margin-top: 14px;
    padding: 11px 28px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: #ffffff;
    border: none;
    border-radius: 9px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: all 0.15s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 20px rgba(99,102,241,0.3);
  }
  .build-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 24px rgba(99,102,241,0.45);
  }
  .build-btn:disabled {
    background: #1e2a45;
    color: #334155;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }

  /* Pipeline */
  .pipeline-card {
    background: #0e1628;
    border: 1px solid #1e2a45;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 24px;
    position: relative;
    overflow: hidden;
  }
  .pipeline-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #8b5cf6, transparent);
  }
  .pipeline-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 20px;
  }
  .pipeline-flow {
    display: flex;
    align-items: center;
    gap: 0;
    overflow-x: auto;
    padding-bottom: 4px;
  }
  .pipeline-node {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    min-width: 110px;
    position: relative;
  }
  .pipeline-connector {
    flex: 0 0 24px;
    height: 2px;
    background: #1e2a45;
    position: relative;
    top: -18px;
    transition: background 0.3s;
  }
  .pipeline-connector.done { background: linear-gradient(90deg, #6366f1, #10b981); }
  .pipeline-connector.active { background: linear-gradient(90deg, #6366f1, #f59e0b); }
  .node-icon-wrap {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: #080d1a;
    border: 2px solid #1e2a45;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    margin-bottom: 10px;
    transition: all 0.3s;
    position: relative;
  }
  .node-icon-wrap.idle { border-color: #1e2a45; }
  .node-icon-wrap.running {
    border-color: #f59e0b;
    box-shadow: 0 0 16px rgba(245,158,11,0.35);
    animation: nodeGlow 1.2s ease-in-out infinite alternate;
  }
  @keyframes nodeGlow {
    from { box-shadow: 0 0 10px rgba(245,158,11,0.25); }
    to   { box-shadow: 0 0 22px rgba(245,158,11,0.55); }
  }
  .node-icon-wrap.completed {
    border-color: #10b981;
    box-shadow: 0 0 14px rgba(16,185,129,0.3);
    background: rgba(16,185,129,0.08);
  }
  .node-icon-wrap.failed {
    border-color: #ef4444;
    box-shadow: 0 0 14px rgba(239,68,68,0.3);
    background: rgba(239,68,68,0.06);
  }
  .node-name {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 12px;
    font-weight: 600;
    color: #94a3b8;
    text-align: center;
    margin-bottom: 3px;
  }
  .node-status-badge {
    font-size: 10px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 20px;
    text-align: center;
  }
  .badge-idle    { color: #334155; background: #0e1628; border: 1px solid #1e2a45; }
  .badge-running { color: #fbbf24; background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3); }
  .badge-completed { color: #34d399; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); }
  .badge-failed  { color: #f87171; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); }

  /* Bottom panels */
  .panels {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 24px;
  }
  .panel {
    background: #0e1628;
    border: 1px solid #1e2a45;
    border-radius: 16px;
    padding: 20px;
  }
  .panel-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 14px;
  }
  .agent-row {
    background: #080d1a;
    border: 1px solid #1e2a45;
    border-radius: 10px;
    padding: 11px 14px;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: border-color 0.2s;
  }
  .agent-row.running { border-color: rgba(245,158,11,0.3); }
  .agent-row.completed { border-color: rgba(16,185,129,0.25); }
  .agent-row.failed { border-color: rgba(239,68,68,0.25); }
  .agent-info { display: flex; flex-direction: column; gap: 2px; }
  .agent-name { font-size: 13px; color: #cbd5e1; font-weight: 500; }
  .agent-desc { font-size: 11px; color: #334155; }

  /* Logs */
  .log-box {
    background: #080d1a;
    border: 1px solid #1e2a45;
    border-radius: 10px;
    padding: 14px;
    height: 320px;
    overflow-y: auto;
    font-family: 'JetBrains Mono', monospace;
  }
  .log-box::-webkit-scrollbar { width: 4px; }
  .log-box::-webkit-scrollbar-track { background: transparent; }
  .log-box::-webkit-scrollbar-thumb { background: #1e2a45; border-radius: 2px; }
  .log-empty { font-size: 12.5px; color: #1e2a45; }
  .log-line { margin-bottom: 5px; font-size: 11.5px; line-height: 1.55; display: flex; gap: 10px; }
  .log-time { color: #1e3a5f; flex-shrink: 0; }
  .log-msg-info    { color: #64748b; }
  .log-msg-success { color: #34d399; }
  .log-msg-error   { color: #f87171; }

  /* Report */
  .report-card {
    background: #0a1f17;
    border: 1px solid #064e3b;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 24px;
    position: relative;
    overflow: hidden;
  }
  .report-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #10b981, transparent);
  }
  .report-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: #34d399;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }
  .stat-box {
    background: #080d1a;
    border: 1px solid #064e3b;
    border-radius: 10px;
    padding: 14px;
  }
  .stat-value {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 22px;
    font-weight: 700;
    color: #f1f5f9;
    letter-spacing: -0.5px;
  }
  .stat-label {
    font-size: 11.5px;
    color: #065f46;
    margin-top: 3px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .download-btn {
    padding: 11px 24px;
    background: #10b981;
    color: #064e3b;
    border: none;
    border-radius: 9px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: all 0.15s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .download-btn:hover { background: #34d399; transform: translateY(-1px); }

  /* Projects tab */
  .projects-panel {
    background: #0e1628;
    border: 1px solid #1e2a45;
    border-radius: 16px;
    padding: 24px;
  }
  .project-row {
    background: #080d1a;
    border: 1px solid #1e2a45;
    border-radius: 11px;
    padding: 16px 18px;
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: border-color 0.15s;
  }
  .project-row:hover { border-color: #6366f1; }
  .project-name {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: #e2e8f0;
    margin-bottom: 4px;
  }
  .project-meta { font-size: 12px; color: #334155; }
  .dl-btn {
    padding: 8px 18px;
    background: transparent;
    color: #6366f1;
    border: 1px solid #6366f1;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: all 0.15s;
  }
  .dl-btn:hover { background: #6366f1; color: #fff; }

  .empty-state {
    color: #1e2a45;
    font-size: 14px;
    text-align: center;
    padding: 40px 0;
    font-family: 'Space Grotesk', sans-serif;
  }

  @media (max-width: 768px) {
    .main { padding: 20px 16px; }
    .panels { grid-template-columns: 1fr; }
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
    .pipeline-node { min-width: 80px; }
  }
`;

export default function App() {
  const [product, setProduct] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [agents, setAgents] = useState(
    AGENTS.map(a => ({ ...a, status: 'idle', output: null }))
  );
  const [logs, setLogs] = useState([]);
  const [finalReport, setFinalReport] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('build');

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const r = await fetch('http://localhost:8000/api/projects');
      const d = await r.json();
      setProjects(d.projects || []);
    } catch { /* silent */ }
  };

  const downloadProject = async (name) => {
    try {
      const r = await fetch(`http://localhost:8000/api/download/${name}`);
      const blob = await r.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${name}.zip`; a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) { alert('Download failed: ' + e.message); }
  };

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [...prev, { message, type, timestamp }]);
  };

  const updateAgent = (id, status, output = null) =>
    setAgents(prev => prev.map(a => a.id === id ? { ...a, status, output } : a));

  const runBuild = async () => {
    if (!product.trim()) { alert('Describe your product first.'); return; }
    setIsRunning(true);
    setLogs([]);
    setFinalReport(null);
    setAgents(AGENTS.map(a => ({ ...a, status: 'idle', output: null })));
    addLog('Orchestrator initializing pipeline…', 'info');
    addLog(`Target: ${product}`, 'info');

    try {
      setAgents(prev => prev.map(a => ({ ...a, status: 'running' })));
      AGENTS.forEach(a => addLog(`${a.name} agent dispatched`, 'info'));

      const resp = await fetch('http://localhost:8000/api/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: product }),
      });
      const data = await resp.json();

      AGENTS.forEach((a, i) => {
        const res = data.results?.[a.key];
        const status = res?.status === 'completed' ? 'completed' : 'failed';
        updateAgent(i + 1, status, status === 'completed' ? `${a.name} done` : `${a.name} failed`);
        addLog(`${a.name} — ${status}`, status === 'completed' ? 'success' : 'error');
      });

      setFinalReport({
        agents_completed: data.agents_completed,
        agents_failed: data.agents_failed,
        project_name: data.project_name,
        duration_seconds: data.duration_seconds,
      });

      addLog('Pipeline complete ✓', 'success');
      fetchProjects();
    } catch (e) {
      addLog(`Pipeline error: ${e.message}`, 'error');
      setAgents(prev => prev.map(a => ({ ...a, status: 'failed' })));
    }
    setIsRunning(false);
  };

  const badgeClass = s =>
    s === 'running' ? 'badge-running'
    : s === 'completed' ? 'badge-completed'
    : s === 'failed' ? 'badge-failed'
    : 'badge-idle';

  const badgeLabel = s =>
    s === 'running' ? '● Running'
    : s === 'completed' ? '✓ Done'
    : s === 'failed' ? '✕ Failed'
    : '○ Idle';

  const connectorClass = (index) => {
    const prev = agents[index - 1];
    const curr = agents[index];
    if (!prev || !curr) return '';
    if (prev.status === 'completed' && curr.status === 'completed') return 'done';
    if (prev.status === 'completed' && curr.status === 'running') return 'active';
    return '';
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">

        {/* Header */}
        <header className="header">
          <div className="header-brand">
            <div className="header-logo">🤖</div>
            <div>
              <div className="header-title">Autonomous Engineering Team</div>
              <div className="header-sub">7-agent AI pipeline · Code generation platform</div>
            </div>
          </div>
          <div className="header-status">
            <div className="pulse-dot" />
            System online
          </div>
        </header>

        {/* Tabs */}
        <div className="tabs">
          {[{ id: 'build', label: '⚡ Build' }, { id: 'projects', label: '📁 Projects' }].map(t => (
            <button
              key={t.id}
              className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >{t.label}</button>
          ))}
        </div>

        <div className="main">
          {activeTab === 'build' && (
            <>
              {/* Input */}
              <div className="input-card">
                <div className="input-label">What are we building?</div>
                <div className="input-hint">Describe your product in plain English — the pipeline handles the rest.</div>
                <textarea
                  className="product-textarea"
                  value={product}
                  onChange={e => setProduct(e.target.value)}
                  placeholder="A real-time food delivery app where customers order from local restaurants, track couriers on a live map, and pay via Stripe..."
                />
                <button className="build-btn" onClick={runBuild} disabled={isRunning}>
                  {isRunning ? (
                    <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span> Pipeline running…</>
                  ) : (
                    <>▶ Launch pipeline</>
                  )}
                </button>
              </div>

              {/* Pipeline visualization */}
              <div className="pipeline-card">
                <div className="pipeline-title">Agent Pipeline</div>
                <div className="pipeline-flow">
                  {agents.map((agent, i) => (
                    <React.Fragment key={agent.id}>
                      <div className="pipeline-node">
                        <div className={`node-icon-wrap ${agent.status}`}>
                          {agent.icon}
                        </div>
                        <div className="node-name">{agent.name}</div>
                        <div className={`node-status-badge ${badgeClass(agent.status)}`}>
                          {badgeLabel(agent.status)}
                        </div>
                      </div>
                      {i < agents.length - 1 && (
                        <div className={`pipeline-connector ${connectorClass(i + 1)}`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Panels */}
              <div className="panels">
                {/* Agent list */}
                <div className="panel">
                  <div className="panel-title">Agent status</div>
                  {agents.map(agent => (
                    <div key={agent.id} className={`agent-row ${agent.status}`}>
                      <div className="agent-info">
                        <div className="agent-name">{agent.icon} {agent.name} Agent</div>
                        <div className="agent-desc">{agent.desc}</div>
                      </div>
                      <span className={`node-status-badge ${badgeClass(agent.status)}`}>
                        {badgeLabel(agent.status)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Logs */}
                <div className="panel">
                  <div className="panel-title">Live log</div>
                  <div className="log-box">
                    {logs.length === 0
                      ? <div className="log-empty">// Waiting for pipeline to start</div>
                      : logs.map((l, i) => (
                          <div key={i} className="log-line">
                            <span className="log-time">{l.timestamp}</span>
                            <span className={`log-msg-${l.type}`}>{l.message}</span>
                          </div>
                        ))
                    }
                  </div>
                </div>
              </div>

              {/* Report */}
              {finalReport && (
                <div className="report-card">
                  <div className="report-title">✓ Build complete</div>
                  <div className="stats-grid">
                    {[
                      { label: 'Agents Passed', value: `${finalReport.agents_completed}/7` },
                      { label: 'Failed', value: finalReport.agents_failed ?? 0 },
                      { label: 'Project', value: finalReport.project_name },
                      { label: 'Duration', value: `${finalReport.duration_seconds}s` },
                    ].map((s, i) => (
                      <div key={i} className="stat-box">
                        <div className="stat-value">{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <button className="download-btn" onClick={() => downloadProject(finalReport.project_name)}>
                    ↓ Download project (.zip)
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === 'projects' && (
            <div className="projects-panel">
              <div className="panel-title">Generated projects</div>
              {projects.length === 0
                ? <div className="empty-state">No projects yet.<br />Head to Build to generate your first one.</div>
                : projects.map((p, i) => (
                    <div key={i} className="project-row">
                      <div>
                        <div className="project-name">{p.name}</div>
                        <div className="project-meta">{p.files} files generated</div>
                      </div>
                      <button className="dl-btn" onClick={() => downloadProject(p.name)}>
                        ↓ Download
                      </button>
                    </div>
                  ))
              }
            </div>
          )}
        </div>
      </div>
    </>
  );
}