# DevOps End-to-End Architecture
## Static Website with Self-Healing CI/CD Pipeline

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         GitHub Repository                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Frontend   │  │   Backend    │  │  CI/CD Config│          │
│  │   (React)    │  │  (Node.js)   │  │ (.github)    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      GitHub Actions (CI/CD)                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 1. Code Checkout → 2. Tests → 3. Build → 4. Docker Build│  │
│  │ 5. Push to DockerHub → 6. Self-Healing Checks           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DockerHub Registry                       │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │ Frontend Img │  │ Backend Img  │                            │
│  └──────────────┘  └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Localhost Deployment (Docker)                  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐│
│  │                       NGINX (Reverse Proxy)                 ││
│  │                     Port 80 → Routing                       ││
│  └────────────────────────────────────────────────────────────┘│
│                      │                    │                      │
│         ┌────────────┘                    └────────────┐         │
│         ▼                                              ▼         │
│  ┌─────────────┐                              ┌─────────────┐  │
│  │   React     │                              │   Node.js   │  │
│  │  Frontend   │◄────────────────────────────►│   Backend   │  │
│  │  Port 3000  │    API Calls (Port 5000)     │  Port 5000  │  │
│  └─────────────┘                              └─────────────┘  │
│                                                       │          │
│                                    ┌─────────────────┼─────┐    │
│                                    │                 │     │    │
│                                    ▼                 ▼     ▼    │
│                            ┌──────────┐   ┌──────────┐ ┌──────┐│
│                            │ MongoDB  │   │Postgres  │ │Redis ││
│                            │Port 27017│   │Port 5432 │ │6379  ││
│                            └──────────┘   └──────────┘ └──────┘│
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐│
│  │        Health Check & Self-Healing Monitoring               ││
│  │  - Container Health Checks                                  ││
│  │  - Auto Restart on Failure                                  ││
│  │  - Rollback on Deployment Failure                           ││
│  └────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Components Breakdown

### 1. Frontend (React)
- **Technology**: React 18+
- **Port**: 3000
- **Containerized**: Yes (Nginx serves static build)
- **Features**: 
  - Dashboard for DevOps metrics
  - Real-time monitoring UI
  - Pipeline status visualization

### 2. Backend (Node.js)
- **Technology**: Node.js with Express
- **Port**: 5000
- **Containerized**: Yes
- **APIs**:
  - `/api/health` - Health check endpoint
  - `/api/deployments` - Deployment history (MongoDB)
  - `/api/metrics` - System metrics (PostgreSQL)
  - `/api/cache` - Cache management (Redis)

### 3. Data Storage

#### MongoDB (Port 27017)
- Stores deployment logs and history
- Unstructured data for CI/CD events

#### PostgreSQL (Port 5432)
- Stores structured metrics and analytics
- User data and system configurations

#### Redis (Port 6379)
- Caching layer for API responses
- Session management
- Real-time metrics

### 4. NGINX (Port 80)
- Reverse proxy for routing
- SSL termination (optional)
- Load balancing
- Static file serving

### 5. CI/CD Pipeline (GitHub Actions)
- Automated testing
- Docker image building
- DockerHub push
- Self-healing mechanisms
- Automated rollback

## Self-Healing Features

1. **Container Health Checks**: Each container has health endpoints
2. **Auto-restart Policy**: Containers restart on failure
3. **Rolling Deployments**: Zero-downtime deployments
4. **Automated Rollback**: Revert to previous version on failure
5. **Monitoring & Alerts**: Real-time health monitoring

## Network Architecture

```
Internet → Port 80 (NGINX) → {
    / → React Frontend (Port 3000)
    /api → Node.js Backend (Port 5000) → {
        MongoDB (27017)
        PostgreSQL (5432)
        Redis (6379)
    }
}
```

## Data Flow

1. User accesses localhost:80
2. NGINX routes to React app (/)
3. React makes API calls to /api/*
4. NGINX proxies API calls to Node.js backend
5. Backend processes requests using:
   - MongoDB for logs/history
   - PostgreSQL for structured data
   - Redis for caching
6. Response flows back through NGINX to user

## Deployment Workflow

1. Developer pushes code to GitHub
2. GitHub Actions triggered
3. Run tests (unit, integration)
4. Build Docker images
5. Push images to DockerHub
6. Pull images on localhost
7. Docker Compose orchestrates deployment
8. Health checks verify deployment
9. If failed, automatic rollback initiated
10. Notifications sent on completion

## Security Considerations

- Environment variables for secrets
- Docker secrets management
- Network isolation between containers
- NGINX as security gateway
- Database access restricted to backend only
