import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Activity, Database, GitBranch, Server, Shield } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Deployments from './components/Deployments';
import Metrics from './components/Metrics';
import './App.css';

function App() {
  const [health, setHealth] = useState({ status: 'checking...' });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        setHealth(data);
      } catch (error) {
        setHealth({ status: 'error', message: error.message });
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <div className="app">
        <header className="header">
          <div className="header-content">
            <div className="logo">
              <Shield size={32} />
              <h1>DevOps Dashboard</h1>
            </div>
            <div className="health-status">
              <Activity size={20} />
              <span className={`status-badge ${health.status}`}>
                {health.status}
              </span>
            </div>
          </div>
        </header>

        <div className="main-container">
          <aside className="sidebar">
            <nav className="nav">
              <Link to="/" className="nav-item">
                <Server size={20} />
                <span>Dashboard</span>
              </Link>
              <Link to="/deployments" className="nav-item">
                <GitBranch size={20} />
                <span>Deployments</span>
              </Link>
              <Link to="/metrics" className="nav-item">
                <Database size={20} />
                <span>Metrics</span>
              </Link>
            </nav>
          </aside>

          <main className="content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/deployments" element={<Deployments />} />
              <Route path="/metrics" element={<Metrics />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
