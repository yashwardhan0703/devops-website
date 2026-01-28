import React, { useState, useEffect } from 'react';
import { GitBranch, Calendar, Clock, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const Deployments = () => {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeployments();
  }, []);

  const fetchDeployments = async () => {
    try {
      const response = await fetch('/api/deployments');
      const data = await response.json();
      setDeployments(data.deployments || mockDeployments);
    } catch (error) {
      console.error('Error fetching deployments:', error);
      setDeployments(mockDeployments);
    } finally {
      setLoading(false);
    }
  };

  const mockDeployments = [
    {
      id: 1,
      branch: 'main',
      commit: 'a1b2c3d',
      author: 'john.doe',
      status: 'success',
      timestamp: new Date().toISOString(),
      duration: 165,
      message: 'Add new dashboard features'
    },
    {
      id: 2,
      branch: 'develop',
      commit: 'e4f5g6h',
      author: 'jane.smith',
      status: 'success',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      duration: 172,
      message: 'Fix authentication bug'
    },
    {
      id: 3,
      branch: 'main',
      commit: 'i7j8k9l',
      author: 'bob.wilson',
      status: 'failed',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      duration: 45,
      message: 'Update dependencies'
    },
    {
      id: 4,
      branch: 'feature/api-v2',
      commit: 'm0n1o2p',
      author: 'alice.johnson',
      status: 'rollback',
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      duration: 120,
      message: 'API v2 implementation - rolled back due to errors'
    },
    {
      id: 5,
      branch: 'main',
      commit: 'q3r4s5t',
      author: 'john.doe',
      status: 'success',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      duration: 158,
      message: 'Performance optimizations'
    },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="status-icon success" size={20} />;
      case 'failed':
        return <XCircle className="status-icon error" size={20} />;
      case 'rollback':
        return <AlertCircle className="status-icon warning" size={20} />;
      default:
        return <Clock className="status-icon" size={20} />;
    }
  };

  if (loading) {
    return <div className="loading">Loading deployments...</div>;
  }

  return (
    <div className="deployments">
      <div className="page-header">
        <h2>Deployment History</h2>
        <button className="btn-primary" onClick={fetchDeployments}>
          Refresh
        </button>
      </div>

      <div className="deployments-list">
        {deployments.map(deployment => (
          <div key={deployment.id} className="deployment-card">
            <div className="deployment-header">
              <div className="deployment-info">
                {getStatusIcon(deployment.status)}
                <div>
                  <h3>{deployment.message}</h3>
                  <div className="deployment-meta">
                    <span className="meta-item">
                      <GitBranch size={14} />
                      {deployment.branch}
                    </span>
                    <span className="meta-item">
                      <User size={14} />
                      {deployment.author}
                    </span>
                    <span className="meta-item">
                      <code>{deployment.commit}</code>
                    </span>
                  </div>
                </div>
              </div>
              <div className="deployment-status">
                <span className={`status-badge ${deployment.status}`}>
                  {deployment.status}
                </span>
              </div>
            </div>

            <div className="deployment-footer">
              <span className="timestamp">
                <Calendar size={14} />
                {new Date(deployment.timestamp).toLocaleString()}
              </span>
              <span className="duration">
                <Clock size={14} />
                {deployment.duration}s
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Deployments;
