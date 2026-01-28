# Quick Setup Guide

## Prerequisites Checklist
- [ ] Docker Desktop installed and running
- [ ] Git installed
- [ ] DockerHub account created
- [ ] GitHub account

## Setup Steps

### 1. Initial Setup (5 minutes)

```bash
# Clone or create your repository
cd devops-website

# Copy environment template
cp .env.example .env

# Edit .env and set your DockerHub username
nano .env  # or use any text editor
```

### 2. Configure GitHub Secrets (2 minutes)

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:
   - Name: `DOCKERHUB_USERNAME`
     Value: `your_dockerhub_username`
   - Name: `DOCKERHUB_TOKEN`
     Value: `your_dockerhub_access_token`

To get your DockerHub token:
1. Log in to https://hub.docker.com
2. Click your username → Account Settings
3. Security → New Access Token
4. Name it "GitHub Actions" and copy the token

### 3. Deploy Locally (3 minutes)

**Option A: Using the deployment script (Recommended)**

```bash
chmod +x deploy.sh
./deploy.sh
```

**Option B: Manual deployment**

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Verify Installation (1 minute)

Open your browser and visit:
- http://localhost - Should show the DevOps Dashboard
- http://localhost/api/health - Should return `{"status":"healthy",...}`

### 5. Test CI/CD Pipeline (5 minutes)

```bash
# Make a small change
echo "# Test" >> README.md

# Commit and push
git add .
git commit -m "Test CI/CD pipeline"
git push origin main

# Go to GitHub → Actions tab to watch the pipeline
```

## Common Issues & Solutions

### Issue: Port 80 already in use
**Solution:**
```bash
# Find what's using port 80
sudo lsof -i :80

# Stop the service or change NGINX port in docker-compose.yml
```

### Issue: Docker containers fail to start
**Solution:**
```bash
# Clean restart
docker-compose down -v
docker-compose up -d

# Check logs
docker-compose logs
```

### Issue: Cannot connect to databases
**Solution:**
```bash
# Restart database services
docker-compose restart mongodb postgres redis

# Check they're healthy
docker-compose ps
```

### Issue: GitHub Actions failing
**Solution:**
1. Verify GitHub Secrets are correct
2. Check you pushed to the `main` branch
3. Review logs in GitHub Actions tab
4. Ensure tests pass locally first

## Next Steps

After successful setup:

1. ✅ Explore the dashboard at http://localhost
2. ✅ Check out the API endpoints at http://localhost/api/health
3. ✅ Review deployment logs in the Deployments tab
4. ✅ Monitor system metrics in the Metrics tab
5. ✅ Make a code change and watch the CI/CD pipeline work

## Development Workflow

```bash
# Start development
docker-compose up -d

# Make changes to code
# Files in frontend/src and backend/ will auto-reload

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Run tests
cd frontend && npm test
cd backend && npm test

# Stop services
docker-compose down
```

## Cleanup

To completely remove the project:

```bash
# Stop and remove containers
docker-compose down

# Remove volumes (WARNING: deletes all data)
docker-compose down -v

# Remove images
docker rmi $(docker images | grep 'devops-' | awk '{print $3}')
```

## Getting Help

- Check the main README.md for detailed documentation
- Review ARCHITECTURE.md for system design
- Check Docker logs: `docker-compose logs [service_name]`
- GitHub Actions logs: Repository → Actions tab

---

**Total Setup Time: ~15 minutes**

Happy DevOps! 🚀
