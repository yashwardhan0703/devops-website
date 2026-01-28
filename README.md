# DevOps Dashboard - End-to-End Architecture

A comprehensive DevOps platform featuring a React frontend, Node.js backend, and self-healing CI/CD pipeline with automated deployment to localhost using GitHub Actions and DockerHub.

## 🏗️ Architecture Overview

```
GitHub → GitHub Actions → DockerHub → Localhost Deployment
   ↓            ↓              ↓              ↓
 Code      Build/Test    Docker Images    Running Containers
```

### Technology Stack

**Frontend:**
- React 18 with Vite
- Recharts for data visualization
- React Router for navigation
- Lucide React for icons

**Backend:**
- Node.js with Express
- RESTful API architecture
- Compression & security middleware

**Databases:**
- MongoDB - Deployment logs and unstructured data
- PostgreSQL - Structured metrics and analytics
- Redis - Caching and session management

**Infrastructure:**
- Docker & Docker Compose
- NGINX as reverse proxy
- GitHub Actions for CI/CD
- DockerHub for image registry

## 📋 Prerequisites

- Docker Desktop installed and running
- Docker Compose v2.0+
- Git
- DockerHub account
- GitHub account
- Node.js 20+ (for local development)
- 4GB+ RAM available

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd devops-website
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and set your DockerHub username:
```env
DOCKERHUB_USERNAME=your_dockerhub_username
```

### 3. Set Up GitHub Secrets

Go to your GitHub repository → Settings → Secrets and Variables → Actions

Add the following secrets:
- `DOCKERHUB_USERNAME` - Your DockerHub username
- `DOCKERHUB_TOKEN` - Your DockerHub access token

### 4. Local Development Setup

**Option A: Using Docker Compose (Recommended)**

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Option B: Manual Development**

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev

# Terminal 3 - Databases
docker-compose up mongodb postgres redis
```

### 5. Access the Application

- **Frontend:** http://localhost
- **Backend API:** http://localhost/api
- **Direct Frontend:** http://localhost:3000 (dev mode)
- **Direct Backend:** http://localhost:5000 (dev mode)

## 🔧 Configuration

### NGINX Configuration

The NGINX reverse proxy routes traffic:
- `/` → React Frontend (port 3000)
- `/api/*` → Node.js Backend (port 5000)

### Health Checks

All services include health checks:
- **NGINX:** `http://localhost/health`
- **Backend:** `http://localhost/api/health`
- **MongoDB:** Internal Docker health check
- **PostgreSQL:** `pg_isready` check
- **Redis:** `redis-cli ping` check

### Database Initialization

PostgreSQL automatically initializes with:
- Tables for metrics, deployments, API performance, and error logs
- Sample data for testing
- Optimized indexes
- Useful views

## 🔄 CI/CD Pipeline

### Pipeline Stages

1. **Test Frontend**
   - Checkout code
   - Install dependencies
   - Run linting
   - Run tests
   - Build application

2. **Test Backend**
   - Checkout code
   - Setup test databases
   - Install dependencies
   - Run linting
   - Run tests

3. **Build and Push**
   - Build Docker images
   - Tag with branch and SHA
   - Push to DockerHub
   - Security scanning with Trivy

4. **Deploy**
   - Pull latest images
   - Deploy with Docker Compose
   - Health checks
   - Smoke tests

5. **Self-Healing**
   - Automatic rollback on failure
   - Health monitoring
   - Log collection

6. **Monitoring**
   - Post-deployment health checks
   - Container status monitoring
   - Log aggregation

### Self-Healing Features

1. **Automatic Restarts**: Containers restart on failure
2. **Health Monitoring**: Continuous health checks every 30s
3. **Rollback Mechanism**: Automatic rollback on deployment failure
4. **Smoke Tests**: Validates deployment before completion
5. **Graceful Shutdown**: Clean database disconnections

### Triggering Deployments

```bash
# Push to main branch triggers full pipeline
git push origin main

# Push to develop triggers tests only
git push origin develop

# Manual trigger via GitHub Actions UI
```

## 📊 API Endpoints

### Health & Status
```
GET  /api/health                 - System health check
```

### Deployments
```
GET  /api/deployments            - List all deployments (paginated)
GET  /api/deployments/stats      - Deployment statistics
GET  /api/deployments/recent     - Recent deployments
POST /api/deployments            - Create new deployment
PATCH /api/deployments/:id       - Update deployment
```

### Metrics
```
GET  /api/metrics                - System metrics (MongoDB, PostgreSQL, Redis)
GET  /api/metrics/performance    - Performance metrics
POST /api/metrics/cache          - Set cache value
GET  /api/metrics/cache/:key     - Get cache value
```

## 🗄️ Database Schemas

### MongoDB - Deployments Collection
```javascript
{
  branch: String,
  commit: String,
  author: String,
  status: String, // pending, success, failed, rollback
  message: String,
  duration: Number,
  logs: String,
  environment: String,
  createdAt: Date,
  updatedAt: Date
}
```

### PostgreSQL - Main Tables
- `system_metrics` - System performance metrics
- `deployment_metrics` - Deployment tracking
- `api_performance` - API response times
- `error_logs` - Error tracking

### Redis - Cache Keys
- `deployments:page:*` - Paginated deployment data
- `deployments:stats` - Deployment statistics
- Custom keys via API

## 🛠️ Development Commands

### Docker Commands
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f [service_name]

# Restart a service
docker-compose restart [service_name]

# Stop all services
docker-compose down

# Remove volumes (clean slate)
docker-compose down -v

# Execute commands in containers
docker-compose exec backend npm run lint
docker-compose exec mongodb mongosh
docker-compose exec postgres psql -U devops_user -d devops_db
```

### Frontend Commands
```bash
cd frontend
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Lint code
npm test            # Run tests
```

### Backend Commands
```bash
cd backend
npm run dev          # Development with nodemon
npm start           # Production start
npm run lint        # Lint code
npm test           # Run tests
```

## 📈 Monitoring & Debugging

### View Container Status
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Database Access

**MongoDB:**
```bash
docker-compose exec mongodb mongosh
use devops
db.deployments.find().limit(5)
```

**PostgreSQL:**
```bash
docker-compose exec postgres psql -U devops_user -d devops_db
SELECT * FROM deployment_metrics LIMIT 5;
```

**Redis:**
```bash
docker-compose exec redis redis-cli
KEYS *
GET deployments:stats
```

### Health Check All Services
```bash
# NGINX
curl http://localhost/health

# Backend
curl http://localhost/api/health

# Get metrics
curl http://localhost/api/metrics
```

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **Secrets Management**: Use GitHub Secrets for sensitive data
3. **Docker Security**: Non-root users in containers
4. **Network Isolation**: Services communicate via Docker network
5. **Rate Limiting**: API rate limiting configured in NGINX
6. **Headers**: Security headers configured (X-Frame-Options, etc.)
7. **Scanning**: Automated vulnerability scanning with Trivy

## 🐛 Troubleshooting

### Services Won't Start
```bash
# Check Docker is running
docker --version
docker-compose --version

# Check ports are available
lsof -i :80
lsof -i :3000
lsof -i :5000

# Clean restart
docker-compose down -v
docker-compose up -d
```

### Database Connection Issues
```bash
# Check database containers are healthy
docker-compose ps

# Restart databases
docker-compose restart mongodb postgres redis

# Check logs
docker-compose logs mongodb
docker-compose logs postgres
docker-compose logs redis
```

### Frontend Not Loading
```bash
# Check NGINX logs
docker-compose logs nginx

# Check frontend logs
docker-compose logs frontend

# Rebuild frontend
docker-compose build frontend
docker-compose up -d frontend
```

### GitHub Actions Failing
1. Verify GitHub Secrets are set correctly
2. Check DockerHub credentials
3. Review workflow logs in GitHub Actions tab
4. Ensure tests pass locally first

## 📝 Project Structure

```
devops-website/
├── .github/
│   └── workflows/
│       └── ci-cd.yml           # GitHub Actions workflow
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── App.jsx            # Main App component
│   │   ├── App.css            # Styles
│   │   └── main.jsx           # Entry point
│   ├── Dockerfile             # Frontend Docker image
│   ├── nginx.conf             # Frontend NGINX config
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── config/                # Database configurations
│   ├── models/                # MongoDB models
│   ├── routes/                # API routes
│   ├── server.js              # Main server file
│   ├── Dockerfile             # Backend Docker image
│   └── package.json
├── nginx/
│   └── nginx.conf             # Main NGINX configuration
├── scripts/
│   └── init-postgres.sql      # PostgreSQL initialization
├── docker-compose.yml         # Docker Compose configuration
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## 🚦 Testing the Self-Healing Pipeline

### Simulate a Failed Deployment

1. Introduce a bug in the code
2. Push to main branch
3. Watch GitHub Actions detect the failure
4. Observe automatic rollback

### Test Health Checks

```bash
# Stop backend service
docker-compose stop backend

# Watch it automatically restart
docker-compose ps

# View restart logs
docker-compose logs backend
```

### Test Cache Functionality

```bash
# Set a cache value
curl -X POST http://localhost/api/metrics/cache \
  -H "Content-Type: application/json" \
  -d '{"key":"test","value":"hello world","ttl":60}'

# Get the cache value
curl http://localhost/api/metrics/cache/test
```

## 🎯 Next Steps

1. **Add Monitoring**: Integrate Prometheus and Grafana
2. **Implement Logging**: Add ELK stack for centralized logging
3. **Kubernetes**: Migrate to Kubernetes for production
4. **SSL/TLS**: Add HTTPS support with Let's Encrypt
5. **Authentication**: Implement JWT-based auth
6. **Notifications**: Add Slack/Discord webhooks for deployment notifications

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [React Documentation](https://react.dev/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)

## 📄 License

MIT License - Feel free to use this project for learning and development.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Built with ❤️ for DevOps Engineers**
