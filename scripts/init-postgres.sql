-- PostgreSQL Initialization Script for DevOps Dashboard

-- Create tables for metrics and system data
CREATE TABLE IF NOT EXISTS system_metrics (
    id SERIAL PRIMARY KEY,
    metric_type VARCHAR(50) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC NOT NULL,
    unit VARCHAR(20),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

CREATE INDEX idx_system_metrics_type ON system_metrics(metric_type);
CREATE INDEX idx_system_metrics_recorded_at ON system_metrics(recorded_at DESC);

-- Create table for deployment metrics
CREATE TABLE IF NOT EXISTS deployment_metrics (
    id SERIAL PRIMARY KEY,
    deployment_id VARCHAR(100) NOT NULL,
    branch VARCHAR(100) NOT NULL,
    commit_hash VARCHAR(40) NOT NULL,
    status VARCHAR(20) NOT NULL,
    duration_seconds INTEGER,
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    author VARCHAR(100),
    message TEXT,
    environment VARCHAR(50) DEFAULT 'production'
);

CREATE INDEX idx_deployment_metrics_status ON deployment_metrics(status);
CREATE INDEX idx_deployment_metrics_started_at ON deployment_metrics(started_at DESC);
CREATE INDEX idx_deployment_metrics_branch ON deployment_metrics(branch);

-- Create table for API performance tracking
CREATE TABLE IF NOT EXISTS api_performance (
    id SERIAL PRIMARY KEY,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    response_time_ms INTEGER NOT NULL,
    status_code INTEGER NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT
);

CREATE INDEX idx_api_performance_endpoint ON api_performance(endpoint);
CREATE INDEX idx_api_performance_timestamp ON api_performance(timestamp DESC);

-- Create table for error logs
CREATE TABLE IF NOT EXISTS error_logs (
    id SERIAL PRIMARY KEY,
    service VARCHAR(50) NOT NULL,
    error_type VARCHAR(100) NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    severity VARCHAR(20) DEFAULT 'error',
    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT FALSE,
    metadata JSONB
);

CREATE INDEX idx_error_logs_service ON error_logs(service);
CREATE INDEX idx_error_logs_occurred_at ON error_logs(occurred_at DESC);
CREATE INDEX idx_error_logs_resolved ON error_logs(resolved);

-- Insert sample data
INSERT INTO system_metrics (metric_type, metric_name, metric_value, unit) VALUES
('cpu', 'usage', 45.5, 'percent'),
('memory', 'usage', 62.3, 'percent'),
('disk', 'usage', 38.7, 'percent'),
('network', 'throughput', 125.4, 'mbps');

INSERT INTO deployment_metrics (deployment_id, branch, commit_hash, status, duration_seconds, started_at, completed_at, author, message) VALUES
('deploy-001', 'main', 'a1b2c3d4', 'success', 165, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour' + INTERVAL '165 seconds', 'john.doe', 'Initial deployment'),
('deploy-002', 'develop', 'e5f6g7h8', 'success', 172, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours' + INTERVAL '172 seconds', 'jane.smith', 'Feature update'),
('deploy-003', 'main', 'i9j0k1l2', 'failed', 45, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours' + INTERVAL '45 seconds', 'bob.wilson', 'Failed deployment');

-- Create views for common queries
CREATE OR REPLACE VIEW deployment_summary AS
SELECT 
    branch,
    COUNT(*) as total_deployments,
    SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
    SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
    AVG(duration_seconds) as avg_duration
FROM deployment_metrics
GROUP BY branch;

CREATE OR REPLACE VIEW recent_errors AS
SELECT 
    service,
    error_type,
    error_message,
    severity,
    occurred_at
FROM error_logs
WHERE resolved = FALSE
ORDER BY occurred_at DESC
LIMIT 100;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO devops_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO devops_user;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'PostgreSQL database initialized successfully!';
END $$;
