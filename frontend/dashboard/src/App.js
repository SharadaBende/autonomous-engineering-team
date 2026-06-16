import React, { useState } from 'react';
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

    addLog('🧠 Orchestrator starting...', 'info');
    addLog(`📋 Product: ${product}`, 'info');

    try {
      setAgents(prev => prev.map(a => ({ ...a, status: 'running' })));

      addLog('🗺️ Planner Agent starting...', 'info');
      addLog('🔍 Research Agent starting...', 'info');
      addLog('💻 Coding Agent starting...', 'info');
      addLog('🧪 Testing Agent starting...', 'info');
      addLog('🔒 Security Agent starting...', 'info');
      addLog('⚙️ DevOps Agent starting...', 'info');
      addLog('📊 Monitoring Agent starting...', 'info');

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
          status === 'completed' ? `✅ ${name} completed successfully` : `❌ ${name} failed`
        );
        addLog(
          `${status === 'completed' ? '✅' : '❌'} ${name} agent ${status}`,
          status === 'completed' ? 'success' : 'error'
        );
      });

      setFinalReport({
        agents_completed: data.agents_completed,
        agents_failed: data.agents_failed,
        total_files: 45,
        duration_seconds: data.duration_seconds
      });

      addLog('🎉 All agents completed!', 'success');

    } catch (error) {
      addLog(`❌ Error: ${error.message}`, 'error');
      setAgents(prev => prev.map(a => ({ ...a, status: 'failed' })));
    }

    setIsRunning(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return '#f59e0b';
      case 'completed': return '#10b981';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'running': return '⚡ Running...';
      case 'completed': return '✅ Completed';
      case 'failed': return '❌ Failed';
      default: return '⏳ Idle';
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', fontFamily: 'monospace' }}>

      <div style={{ background: '#1e293b', padding: '20px 40px', borderBottom: '1px solid #334155' }}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#60a5fa' }}>
          🤖 Autonomous Engineering Team
        </h1>
        <p style={{ margin: '5px 0 0', color: '#94a3b8', fontSize: '14px' }}>
          AI agents that build software automatically
        </p>
      </div>

      <div style={{ padding: '30px 40px', maxWidth: '1200px', margin: '0 auto' }}>

        <div style={{ background: '#1e293b', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #334155' }}>
          <h2 style={{ margin: '0 0 16px', color: '#e2e8f0', fontSize: '18px' }}>
            🚀 Describe Your Product
          </h2>
          <textarea
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="Example: A todo app where users can create, edit and delete tasks..."
            style={{
              width: '100%',
              height: '100px',
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '12px',
              color: '#e2e8f0',
              fontSize: '14px',
              resize: 'vertical',
              boxSizing: 'border-box'
            }}
          />
          <button
            onClick={simulateAgents}
            disabled={isRunning}
            style={{
              marginTop: '12px',
              padding: '12px 32px',
              background: isRunning ? '#334155' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              fontFamily: 'monospace'
            }}
          >
            {isRunning ? '⚡ Agents Running...' : '🚀 Start Building'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

          <div style={{ background: '#1e293b', borderRadius: '12px', padding: '24px', border: '1px solid #334155' }}>
            <h2 style={{ margin: '0 0 16px', color: '#e2e8f0', fontSize: '18px' }}>
              🤖 Agents Status
            </h2>
            {agents.map(agent => (
              <div key={agent.id} style={{
                background: '#0f172a',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '8px',
                border: `1px solid ${getStatusColor(agent.status)}33`,
                borderLeft: `3px solid ${getStatusColor(agent.status)}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px' }}>
                    {agent.icon} {agent.name}
                  </span>
                  <span style={{ fontSize: '12px', color: getStatusColor(agent.status) }}>
                    {getStatusText(agent.status)}
                  </span>
                </div>
                {agent.output && (
                  <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                    {agent.output}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div style={{ background: '#1e293b', borderRadius: '12px', padding: '24px', border: '1px solid #334155' }}>
            <h2 style={{ margin: '0 0 16px', color: '#e2e8f0', fontSize: '18px' }}>
              📋 Live Logs
            </h2>
            <div style={{
              background: '#0f172a',
              borderRadius: '8px',
              padding: '12px',
              height: '380px',
              overflowY: 'auto',
              border: '1px solid #334155'
            }}>
              {logs.length === 0 ? (
                <p style={{ color: '#475569', fontSize: '13px' }}>
                  Logs will appear here when agents start running...
                </p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} style={{ marginBottom: '4px', fontSize: '13px' }}>
                    <span style={{ color: '#475569' }}>[{log.timestamp}] </span>
                    <span style={{ color: log.type === 'success' ? '#10b981' : log.type === 'error' ? '#ef4444' : '#e2e8f0' }}>
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
            background: '#1e293b',
            borderRadius: '12px',
            padding: '24px',
            marginTop: '24px',
            border: '1px solid #10b981'
          }}>
            <h2 style={{ margin: '0 0 16px', color: '#10b981', fontSize: '18px' }}>
              🎉 Build Completed!
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {[
                { label: 'Agents Completed', value: `${finalReport.agents_completed}/7`, color: '#10b981' },
                { label: 'Agents Failed', value: finalReport.agents_failed, color: '#ef4444' },
                { label: 'Files Generated', value: finalReport.total_files, color: '#60a5fa' },
                { label: 'Time Taken', value: `${finalReport.duration_seconds}s`, color: '#f59e0b' }
              ].map((stat, i) => (
                <div key={i} style={{
                  background: '#0f172a',
                  borderRadius: '8px',
                  padding: '16px',
                  textAlign: 'center',
                  border: '1px solid #334155'
                }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: stat.color }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;