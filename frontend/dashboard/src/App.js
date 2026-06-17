import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [product, setProduct] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [agents, setAgents] = useState([
    { id: 1, name: 'Planner Agent', icon: '🗺️', status: 'idle', output: null },
    { id: 2, name: 'Research Agent', icon: '🔍', status: 'idle', output: null },
    { id: 3, name: 'Coding Agent', icon: '💻', status: 'idle', output: null },
    { id: 4, name: 'Testing Agent', icon: '🧪', status: 'idle', output: null },
    { id: 5, name: 'Security Agent', icon: '🔒', status: 'idle', output: null },
    { id: 6, name: 'DevOps Agent', icon: '⚙️', status: 'idle', output: null },
    { id: 7, name: 'Monitoring Agent', icon: '📊', status: 'idle', output: null },
  ]);
  const [logs, setLogs] = useState([]);
  const [finalReport, setFinalReport] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('build');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/projects');
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.log('Could not fetch projects');
    }
  };

  const downloadProject = async (projectName) => {
    try {
      const response = await fetch(`http://localhost:8000/api/download/${projectName}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Download failed: ' + error.message);
    }
  };

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
  };

  const updateAgent = (id, status, output = null) => {
    setAgents(prev => prev.map(agent =>
      agent.id === id ? { ...agent, status, output } : agent
    ));
  };

  const simulateAgents = async () => {
    if (!product.trim()) {
      alert('Please describe your product first!');
      return;
    }

    setIsRunning(true);
    setLogs([]);
    setFinalReport(null);
    setAgents(prev => prev.map(a => ({ ...a, status: 'idle', output: null })));

    addLog('Orchestrator starting...', 'info');
    addLog(`Product: ${product}`, 'info');

    try {
      setAgents(prev => prev.map(a => ({ ...a, status: 'running' })));
      addLog('Planner Agent starting...', 'info');
      addLog('Research Agent starting...', 'info');
      addLog('Coding Agent starting...', 'info');
      addLog('Testing Agent starting...', 'info');
      addLog('Security Agent starting...', 'info');
      addLog('DevOps Agent starting...', 'info');
      addLog('Monitoring Agent starting...', 'info');

      const response = await fetch('http://localhost:8000/api/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: product })
      });

      const data = await response.json();
      const agentNames = ['planner', 'researcher', 'coder', 'tester', 'security', 'devops', 'monitoring'];

      agentNames.forEach((name, index) => {
        const agentResult = data.results?.[name];
        const status = agentResult?.status === 'completed' ? 'completed' : 'failed';
        updateAgent(index + 1, status,
          status === 'completed' ? `${name} completed` : `${name} failed`
        );
        addLog(
          `${name} agent ${status}`,
          status === 'completed' ? 'success' : 'error'
        );
      });

      setFinalReport({
        agents_completed: data.agents_completed,
        agents_failed: data.agents_failed,
        project_name: data.project_name,
        duration_seconds: data.duration_seconds
      });

      addLog('All agents completed', 'success');
      fetchProjects();

    } catch (error) {
      addLog(`Error: ${error.message}`, 'error');
      setAgents(prev => prev.map(a => ({ ...a, status: 'failed' })));
    }

    setIsRunning(false);
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'running': return { color: '#b5742a', bg: '#fdf3e6', dot: '#d97706' };
      case 'completed': return { color: '#1e7a4d', bg: '#eafaf1', dot: '#16a34a' };
      case 'failed': return { color: '#c0392b', bg: '#fdeeee', dot: '#dc2626' };
      default: return { color: '#7c7a76', bg: '#f4f3f1', dot: '#a8a6a1' };
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'running': return 'Running';
      case 'completed': return 'Completed';
      case 'failed': return 'Failed';
      default: return 'Idle';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f7f6f4',
      color: '#2d2c2a',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>

      {/* Header */}
      <div style={{
        background: '#ffffff',
        padding: '18px 40px',
        borderBottom: '1px solid #ebe9e6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            background: '#da7756',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px'
          }}>
            🤖
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#2d2c2a' }}>
              Autonomous Engineering Team
            </div>
            <div style={{ fontSize: '12.5px', color: '#8a8782' }}>
              AI agents that build software automatically
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        background: '#ffffff',
        padding: '0 40px',
        borderBottom: '1px solid #ebe9e6',
        display: 'flex',
        gap: '4px'
      }}>
        {[{ id: 'build', label: 'Build' }, { id: 'projects', label: 'Projects' }].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '14px 18px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #da7756' : '2px solid transparent',
              color: activeTab === tab.id ? '#2d2c2a' : '#8a8782',
              fontWeight: activeTab === tab.id ? 600 : 500,
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: 'inherit'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '32px 40px', maxWidth: '1100px', margin: '0 auto' }}>

        {/* Build Tab */}
        {activeTab === 'build' && (
          <>
            <div style={{
              background: '#ffffff',
              borderRadius: '14px',
              padding: '22px',
              marginBottom: '20px',
              border: '1px solid #ebe9e6',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}>
              <h2 style={{ margin: '0 0 4px', color: '#2d2c2a', fontSize: '16px', fontWeight: 600 }}>
                Describe your product
              </h2>
              <p style={{ margin: '0 0 14px', color: '#8a8782', fontSize: '13px' }}>
                Plain English is fine — the agents will figure out the rest.
              </p>
              <textarea
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="A food delivery app where customers can order food from restaurants and track delivery in real time..."
                style={{
                  width: '100%',
                  height: '90px',
                  background: '#faf9f7',
                  border: '1px solid #e3e1dd',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  color: '#2d2c2a',
                  fontSize: '14px',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  outline: 'none'
                }}
              />
              <button
                onClick={simulateAgents}
                disabled={isRunning}
                style={{
                  marginTop: '14px',
                  padding: '10px 22px',
                  background: isRunning ? '#e3e1dd' : '#da7756',
                  color: isRunning ? '#9a978f' : '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background 0.15s'
                }}
              >
                {isRunning ? 'Agents running…' : 'Start building'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

              {/* Agents Panel */}
              <div style={{
                background: '#ffffff',
                borderRadius: '14px',
                padding: '20px',
                border: '1px solid #ebe9e6'
              }}>
                <h2 style={{ margin: '0 0 14px', color: '#2d2c2a', fontSize: '15px', fontWeight: 600 }}>
                  Agents
                </h2>
                {agents.map(agent => {
                  const s = getStatusStyles(agent.status);
                  return (
                    <div key={agent.id} style={{
                      background: '#faf9f7',
                      borderRadius: '10px',
                      padding: '11px 14px',
                      marginBottom: '8px',
                      border: '1px solid #efeeea'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13.5px', color: '#2d2c2a' }}>
                          {agent.icon} {agent.name}
                        </span>
                        <span style={{
                          fontSize: '11.5px',
                          fontWeight: 600,
                          color: s.color,
                          background: s.bg,
                          padding: '3px 9px',
                          borderRadius: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.dot }} />
                          {getStatusText(agent.status)}
                        </span>
                      </div>
                      {agent.output && (
                        <p style={{ margin: '7px 0 0', fontSize: '12px', color: '#8a8782' }}>
                          {agent.output}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Logs Panel */}
              <div style={{
                background: '#ffffff',
                borderRadius: '14px',
                padding: '20px',
                border: '1px solid #ebe9e6'
              }}>
                <h2 style={{ margin: '0 0 14px', color: '#2d2c2a', fontSize: '15px', fontWeight: 600 }}>
                  Activity
                </h2>
                <div style={{
                  background: '#faf9f7',
                  borderRadius: '10px',
                  padding: '14px',
                  height: '360px',
                  overflowY: 'auto',
                  border: '1px solid #efeeea',
                  fontFamily: "'JetBrains Mono', monospace"
                }}>
                  {logs.length === 0 ? (
                    <p style={{ color: '#b3b0aa', fontSize: '12.5px', margin: 0 }}>
                      Activity will appear here once you start building.
                    </p>
                  ) : (
                    logs.map((log, i) => (
                      <div key={i} style={{ marginBottom: '6px', fontSize: '12.5px', lineHeight: 1.5 }}>
                        <span style={{ color: '#b3b0aa' }}>{log.timestamp}  </span>
                        <span style={{
                          color: log.type === 'success' ? '#1e7a4d' : log.type === 'error' ? '#c0392b' : '#56544f'
                        }}>
                          {log.message}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {finalReport && (
              <div style={{
                background: '#ffffff',
                borderRadius: '14px',
                padding: '22px',
                marginTop: '20px',
                border: '1px solid #d9ecdf'
              }}>
                <h2 style={{ margin: '0 0 16px', color: '#1e7a4d', fontSize: '15px', fontWeight: 600 }}>
                  Build completed
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '18px' }}>
                  {[
                    { label: 'Agents completed', value: `${finalReport.agents_completed}/7` },
                    { label: 'Agents failed', value: finalReport.agents_failed },
                    { label: 'Project', value: finalReport.project_name },
                    { label: 'Time taken', value: `${finalReport.duration_seconds}s` }
                  ].map((stat, i) => (
                    <div key={i} style={{
                      background: '#faf9f7',
                      borderRadius: '10px',
                      padding: '14px',
                      border: '1px solid #efeeea'
                    }}>
                      <div style={{ fontSize: '16px', fontWeight: 600, color: '#2d2c2a' }}>
                        {stat.value}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#8a8782', marginTop: '3px' }}>
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => downloadProject(finalReport.project_name)}
                  style={{
                    padding: '10px 22px',
                    background: '#2d2c2a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                  }}
                >
                  Download project (.zip)
                </button>
              </div>
            )}
          </>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            padding: '20px',
            border: '1px solid #ebe9e6'
          }}>
            <h2 style={{ margin: '0 0 16px', color: '#2d2c2a', fontSize: '15px', fontWeight: 600 }}>
              Generated projects
            </h2>
            {projects.length === 0 ? (
              <p style={{ color: '#8a8782', fontSize: '13.5px' }}>
                No projects yet. Head to Build to create your first one.
              </p>
            ) : (
              projects.map((project, i) => (
                <div key={i} style={{
                  background: '#faf9f7',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  marginBottom: '10px',
                  border: '1px solid #efeeea',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '14.5px', color: '#2d2c2a', fontWeight: 600 }}>
                      {project.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#8a8782', marginTop: '3px' }}>
                      {project.files} files generated
                    </div>
                  </div>
                  <button
                    onClick={() => downloadProject(project.name)}
                    style={{
                      padding: '8px 18px',
                      background: '#2d2c2a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '7px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit'
                    }}
                  >
                    Download
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;