#!/bin/bash

# DevOps Dashboard Deployment Script
# This script helps deploy the application locally

set -e

echo "🚀 DevOps Dashboard Deployment Script"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if Docker is running
check_docker() {
    print_info "Checking Docker..."
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi
    print_success "Docker is running"
}

# Check if .env file exists
check_env() {
    print_info "Checking environment configuration..."
    if [ ! -f .env ]; then
        print_info "Creating .env file from .env.example..."
        cp .env.example .env
        print_info "Please edit .env and set your DOCKERHUB_USERNAME"
        exit 0
    fi
    print_success "Environment configuration found"
}

# Build images
build_images() {
    print_info "Building Docker images..."
    docker-compose build
    print_success "Images built successfully"
}

# Start services
start_services() {
    print_info "Starting services..."
    docker-compose up -d
    print_success "Services started"
}

# Wait for services to be healthy
wait_for_health() {
    print_info "Waiting for services to be healthy..."
    
    max_attempts=30
    attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if docker-compose ps | grep -q "unhealthy"; then
            attempt=$((attempt + 1))
            echo -n "."
            sleep 2
        else
            echo ""
            print_success "All services are healthy"
            return 0
        fi
    done
    
    echo ""
    print_error "Services did not become healthy in time"
    docker-compose ps
    return 1
}

# Show service status
show_status() {
    print_info "Service Status:"
    docker-compose ps
    echo ""
    print_success "Application is ready!"
    echo ""
    echo "📊 Access Points:"
    echo "   Frontend:    http://localhost"
    echo "   Backend API: http://localhost/api"
    echo "   Health:      http://localhost/api/health"
    echo ""
    echo "📝 Useful Commands:"
    echo "   View logs:    docker-compose logs -f"
    echo "   Stop:         docker-compose down"
    echo "   Restart:      docker-compose restart"
    echo "   Clean:        docker-compose down -v"
}

# Main deployment flow
main() {
    check_docker
    check_env
    
    read -p "Do you want to rebuild images? (y/N): " rebuild
    if [[ $rebuild =~ ^[Yy]$ ]]; then
        build_images
    fi
    
    start_services
    
    if wait_for_health; then
        show_status
    else
        print_error "Deployment failed. Check logs with: docker-compose logs"
        exit 1
    fi
}

# Run main function
main
