# DevOps Architecture - Visual Deployment Flow

## Complete CI/CD Pipeline Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                 DEVELOPER                                    │
│                                                                              │
│  1. Write Code  →  2. Git Commit  →  3. Git Push to GitHub                 │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            GITHUB REPOSITORY                                 │
│                                                                              │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Frontend  │  │  Backend   │  │   .github/   │  │  Docker      │       │
│  │   (React)  │  │ (Node.js)  │  │  workflows   │  │  Compose     │       │
│  └────────────┘  └────────────┘  └──────────────┘  └──────────────┘       │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │ (Webhook Trigger)
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         GITHUB ACTIONS (CI/CD)                               │
│                                                                              │
│  ╔═══════════════════════════════════════════════════════════════════════╗ │
│  ║  STAGE 1: TESTING                                                     ║ │
│  ╠═══════════════════════════════════════════════════════════════════════╣ │
│  ║  ┌─────────────────────┐      ┌─────────────────────┐               ║ │
│  ║  │  Test Frontend      │      │  Test Backend       │               ║ │
│  ║  │  ─────────────      │      │  ────────────       │               ║ │
│  ║  │  • Checkout code    │      │  • Checkout code    │               ║ │
│  ║  │  • Install deps     │      │  • Setup DBs        │               ║ │
│  ║  │  • Run linting      │      │  • Install deps     │               ║ │
│  ║  │  • Run tests        │      │  • Run linting      │               ║ │
│  ║  │  • Build app        │      │  • Run tests        │               ║ │
│  ║  └─────────────────────┘      └─────────────────────┘               ║ │
│  ╚═══════════════════════════════════════════════════════════════════════╝ │
│                                 │                                            │
│                                 │ (Tests Pass)                               │
│                                 ▼                                            │
│  ╔═══════════════════════════════════════════════════════════════════════╗ │
│  ║  STAGE 2: BUILD & PUSH                                                ║ │
│  ╠═══════════════════════════════════════════════════════════════════════╣ │
│  ║  1. Setup Docker Buildx                                               ║ │
│  ║  2. Login to DockerHub                                                ║ │
│  ║  3. Build Frontend Image → Tag → Push to DockerHub                   ║ │
│  ║  4. Build Backend Image  → Tag → Push to DockerHub                   ║ │
│  ║  5. Security Scan (Trivy)                                             ║ │
│  ╚═══════════════════════════════════════════════════════════════════════╝ │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             DOCKERHUB REGISTRY                               │
│                                                                              │
│  ┌──────────────────────────────┐    ┌──────────────────────────────┐      │
│  │  your-username/              │    │  your-username/              │      │
│  │  devops-frontend:latest      │    │  devops-backend:latest       │      │
│  │  devops-frontend:main-a1b2c3 │    │  devops-backend:main-a1b2c3  │      │
│  └──────────────────────────────┘    └──────────────────────────────┘      │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 │ (Pull Images)
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    GITHUB ACTIONS - DEPLOYMENT STAGE                         │
│                                                                              │
│  ╔═══════════════════════════════════════════════════════════════════════╗ │
│  ║  STAGE 3: DEPLOY                                                      ║ │
│  ╠═══════════════════════════════════════════════════════════════════════╣ │
│  ║  1. Save current deployment state                                     ║ │
│  ║  2. Pull latest images from DockerHub                                 ║ │
│  ║  3. docker-compose down (stop old containers)                         ║ │
│  ║  4. docker-compose up -d (start new containers)                       ║ │
│  ║  5. Wait for health checks (30 seconds)                               ║ │
│  ║  6. Run smoke tests:                                                  ║ │
│  ║     • Test NGINX health endpoint                                      ║ │
│  ║     • Test Backend API health                                         ║ │
│  ║     • Test Frontend loading                                           ║ │
│  ╚═══════════════════════════════════════════════════════════════════════╝ │
│                                 │                                            │
│                    ┌────────────┴────────────┐                              │
│                    │                         │                              │
│              (Success)                 (Failure)                             │
│                    │                         │                              │
│                    ▼                         ▼                              │
│  ╔══════════════════════════╗   ╔════════════════════════════════════════╗ │
│  ║  Continue Deployment     ║   ║  SELF-HEALING: ROLLBACK                ║ │
│  ║  ────────────────────    ║   ║  ───────────────────────               ║ │
│  ║  Post-deployment         ║   ║  1. Stop failed containers             ║ │
│  ║  monitoring              ║   ║  2. Pull previous stable images        ║ │
│  ║                          ║   ║  3. Restore previous deployment        ║ │
│  ║                          ║   ║  4. Send failure notification          ║ │
│  ╚══════════════════════════╝   ╚════════════════════════════════════════╝ │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 │ (Deploy to Localhost)
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LOCALHOST DEPLOYMENT                                 │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                    NGINX (Reverse Proxy) :80                          │ │
│  │  ─────────────────────────────────────────────────────────────────── │ │
│  │  • Routes / to Frontend                                               │ │
│  │  • Routes /api to Backend                                             │ │
│  │  • Rate limiting                                                      │ │
│  │  • Security headers                                                   │ │
│  │  • Health check endpoint                                              │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                    │                                   │                     │
│                    │                                   │                     │
│          ┌─────────┴──────────┐              ┌────────┴────────┐           │
│          ▼                    │              │                 ▼            │
│  ┌───────────────┐            │              │         ┌──────────────┐    │
│  │   Frontend    │            │              │         │   Backend    │    │
│  │   (React)     │            │              │         │  (Node.js)   │    │
│  │   Port 3000   │◄───────────┼──────────────┼────────►│  Port 5000   │    │
│  │               │            │              │         │              │    │
│  │ • Dashboard   │            │              │         │ • REST APIs  │    │
│  │ • Deployments │            │              │         │ • Auth       │    │
│  │ • Metrics     │            │              │         │ • Business   │    │
│  │ • Charts      │            │              │         │   Logic      │    │
│  └───────────────┘            │              │         └──────┬───────┘    │
│                               │              │                │            │
│                               │              │      ┌─────────┼────────┐   │
│                               │              │      │         │        │   │
│                               │              │      ▼         ▼        ▼   │
│                               │              │  ┌────────┐ ┌────────┐ ┌───┐ │
│                               │              │  │MongoDB │ │Postgre │ │Red│ │
│                               │              │  │:27017  │ │SQL     │ │is │ │
│                               │              │  │        │ │:5432   │ │:63│ │
│                               │              │  │Deploy  │ │Metrics │ │79 │ │
│                               │              │  │Logs    │ │Analyti │ │Cac│ │
│                               │              │  │History │ │cs      │ │he │ │
│                               │              │  └────────┘ └────────┘ └───┘ │
│                               │              │                               │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │              SELF-HEALING & MONITORING                                 │ │
│  │  ────────────────────────────────────────────────────────────────────  │ │
│  │  • Health Checks: Every 30 seconds for all containers                 │ │
│  │  • Auto Restart: Container restarts on failure (restart: unless-stop) │ │
│  │  • Resource Limits: CPU and memory limits per container               │ │
│  │  • Log Aggregation: Centralized logging via docker-compose logs       │ │
│  │  • Graceful Shutdown: Proper cleanup on SIGTERM/SIGINT                │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘

## Data Flow Diagram

┌──────────┐
│  User    │
│ Browser  │
└────┬─────┘
     │ HTTP Request
     │ http://localhost
     ▼
┌────────────────┐
│  NGINX :80     │
│  Reverse Proxy │
└────┬───────────┘
     │
     ├─────► / requests ────────┐
     │                          │
     └─────► /api requests ──┐  │
                             │  │
                             ▼  ▼
              ┌──────────────┐ ┌──────────────┐
              │   Backend    │ │   Frontend   │
              │   :5000      │ │   :3000      │
              └──────┬───────┘ └──────────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
         ▼           ▼           ▼
    ┌────────┐ ┌─────────┐ ┌────────┐
    │MongoDB │ │PostgreSQL│ │ Redis  │
    │Logs &  │ │Metrics & │ │Cache & │
    │History │ │Analytics │ │Session │
    └────────┘ └─────────┘ └────────┘

## Network Architecture

Docker Network: devops-network (Bridge Driver)

┌─────────────────────────────────────────────────────────┐
│  Host Machine (localhost)                               │
│                                                          │
│  Port Mapping:                                           │
│  • 80    → nginx:80       (Public Access)               │
│  • 3000  → frontend:80    (Direct Access)               │
│  • 5000  → backend:5000   (Direct Access)               │
│  • 27017 → mongodb:27017  (DB Access)                   │
│  • 5432  → postgres:5432  (DB Access)                   │
│  • 6379  → redis:6379     (Cache Access)                │
│                                                          │
│  Internal Network (devops-network):                      │
│  ┌────────────────────────────────────────────────────┐ │
│  │  All containers can communicate using service names│ │
│  │  Examples:                                          │ │
│  │  • backend → mongodb:27017                         │ │
│  │  • backend → postgres:5432                         │ │
│  │  • backend → redis:6379                            │ │
│  │  • nginx → frontend:80                             │ │
│  │  • nginx → backend:5000                            │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

## Self-Healing Mechanisms

┌──────────────────────────────────────────────────────────┐
│  1. CONTAINER-LEVEL                                      │
│     • Health checks every 30s                            │
│     • Auto-restart on failure                            │
│     • Graceful shutdown with cleanup                     │
│                                                          │
│  2. DEPLOYMENT-LEVEL                                     │
│     • Pre-deployment tests                               │
│     • Smoke tests post-deployment                        │
│     • Automatic rollback on failure                      │
│                                                          │
│  3. APPLICATION-LEVEL                                    │
│     • Database connection retry logic                    │
│     • Circuit breakers for external calls                │
│     • Graceful degradation                               │
│                                                          │
│  4. MONITORING                                           │
│     • Real-time health monitoring                        │
│     • Log aggregation                                    │
│     • Performance metrics                                │
└──────────────────────────────────────────────────────────┘

## Deployment Timeline

0:00  Developer pushes code to GitHub
0:05  GitHub Actions triggered
0:10  Tests start (Frontend & Backend in parallel)
1:30  Tests complete
1:35  Docker images build
3:00  Images pushed to DockerHub
3:15  Deployment stage starts
3:20  Images pulled to localhost
3:25  Old containers stopped
3:30  New containers started
3:35  Health checks begin
4:05  Health checks pass
4:10  Smoke tests run
4:15  ✅ Deployment complete

Total Time: ~4-5 minutes (typical)
