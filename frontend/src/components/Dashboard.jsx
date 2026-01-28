import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalDeployments: 0,
    successfulDeployments: 0,
    failedDeployments: 0,
    avgDeploymentTime: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/deployments/stats');
      const data = await response.json();
      setStats(data.stats || {
        totalDeployments: 42,
        successfulDeployments: 38,
        failedDeployments: 4,
        avgDeploymentTime: 180
      });

      const activityResponse = await fetch('/api/deployments/recent');
      const activityData = await activityResponse.json();
      setRecentActivity(activityData.deployments || [
        { id: 1, branch: 'main', status: 'success', timestamp: new Date().toISOString(), duration: 165 },
        { id: 2, branch: 'develop', status: 'success', timestamp: new Date(Date.now() - 3600000).toISOString(), duration: 172 },
        { id: 3, branch: 'main', status: 'failed', timestamp: new Date(Date.now() - 7200000).toISOString(), duration: 45 },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const mockChartData = [
    { name: 'Mon', deployments: 4, success: 4, failed: 0 },
    { name: 'Tue', deployments: 3, success: 2, failed: 1 },
    { name: 'Wed', deployments: 6, success: 5, failed: 1 },
    { name: 'Thu', deployments: 8, success: 7, failed: 1 },
    { name: 'Fri', deployments: 5, success: 5, failed: 0 },
    { name: 'Sat', deployments: 2, success: 2, failed: 0 },
    { name: 'Sun', deployments: 1, success: 1, failed: 0 },
  ];

  return (
    <div className="dashboard">
      <h2>System Overview</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Deployments</h3>
            <p className="stat-value">{stats.totalDeployments}</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>Successful</h3>
            <p className="stat-value">{stats.successfulDeployments}</p>
          </div>
        </div>

        <div className="stat-card error">
          <div className="stat-icon">
            <XCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>Failed</h3>
            <p className="stat-value">{stats.failedDeployments}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>Avg Deploy Time</h3>
            <p className="stat-value">{stats.avgDeploymentTime}s</p>
          </div>
        </div>
      </div>

      <div className="chart-container">
        <h3>Deployment Trends (Last 7 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={mockChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="success" stroke="#10b981" strokeWidth={2} />
            <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="recent-activity">
        <h3>Recent Deployments</h3>
        <div className="activity-list">
          {recentActivity.map(activity => (
            <div key={activity.id} className="activity-item">
              <div className={`status-indicator ${activity.status}`}>
                {activity.status === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
              </div>
              <div className="activity-details">
                <p className="branch-name">Branch: {activity.branch}</p>
                <p className="timestamp">{new Date(activity.timestamp).toLocaleString()}</p>
              </div>
              <div className="activity-meta">
                <span className="duration">{activity.duration}s</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
