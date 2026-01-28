import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Database, Cpu, HardDrive, Activity } from 'lucide-react';

const Metrics = () => {
  const [systemMetrics, setSystemMetrics] = useState({
    mongodb: { status: 'healthy', connections: 5, storage: '2.3 GB' },
    postgres: { status: 'healthy', connections: 3, storage: '1.8 GB' },
    redis: { status: 'healthy', keys: 1247, memory: '45 MB' },
  });

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/metrics');
      const data = await response.json();
      if (data.metrics) {
        setSystemMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const performanceData = [
    { name: 'Frontend', responseTime: 120, requests: 1500 },
    { name: 'Backend', responseTime: 180, requests: 2300 },
    { name: 'MongoDB', responseTime: 15, requests: 890 },
    { name: 'PostgreSQL', responseTime: 25, requests: 650 },
    { name: 'Redis', responseTime: 5, requests: 3400 },
  ];

  return (
    <div className="metrics">
      <h2>System Metrics</h2>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <Database size={24} className="metric-icon mongodb" />
            <h3>MongoDB</h3>
            <span className={`status-badge ${systemMetrics.mongodb.status}`}>
              {systemMetrics.mongodb.status}
            </span>
          </div>
          <div className="metric-details">
            <div className="metric-row">
              <span>Connections:</span>
              <strong>{systemMetrics.mongodb.connections}</strong>
            </div>
            <div className="metric-row">
              <span>Storage:</span>
              <strong>{systemMetrics.mongodb.storage}</strong>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <Database size={24} className="metric-icon postgres" />
            <h3>PostgreSQL</h3>
            <span className={`status-badge ${systemMetrics.postgres.status}`}>
              {systemMetrics.postgres.status}
            </span>
          </div>
          <div className="metric-details">
            <div className="metric-row">
              <span>Connections:</span>
              <strong>{systemMetrics.postgres.connections}</strong>
            </div>
            <div className="metric-row">
              <span>Storage:</span>
              <strong>{systemMetrics.postgres.storage}</strong>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <Activity size={24} className="metric-icon redis" />
            <h3>Redis</h3>
            <span className={`status-badge ${systemMetrics.redis.status}`}>
              {systemMetrics.redis.status}
            </span>
          </div>
          <div className="metric-details">
            <div className="metric-row">
              <span>Keys:</span>
              <strong>{systemMetrics.redis.keys}</strong>
            </div>
            <div className="metric-row">
              <span>Memory:</span>
              <strong>{systemMetrics.redis.memory}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="chart-container">
        <h3>Performance Metrics</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="responseTime" fill="#8884d8" name="Avg Response Time (ms)" />
            <Bar yAxisId="right" dataKey="requests" fill="#82ca9d" name="Requests/min" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="resource-usage">
        <h3>Resource Usage</h3>
        <div className="usage-grid">
          <div className="usage-card">
            <Cpu size={20} />
            <div>
              <p>CPU Usage</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '45%' }}></div>
              </div>
              <span>45%</span>
            </div>
          </div>

          <div className="usage-card">
            <HardDrive size={20} />
            <div>
              <p>Memory Usage</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '62%' }}></div>
              </div>
              <span>62%</span>
            </div>
          </div>

          <div className="usage-card">
            <Database size={20} />
            <div>
              <p>Disk Usage</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '38%' }}></div>
              </div>
              <span>38%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Metrics;
