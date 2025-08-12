# CIMS Docker Setup

This document explains how to run the CIMS (Candidate Information Management System) using Docker containers.

## Prerequisites

- Docker and Docker Compose installed
- At least 4GB RAM available
- Ports 3000, 8000, and 5432 available on your machine

## Environment Setup

### 1. Environment Variables

Copy the example environment file and configure your settings:

```bash
# Copy the example file
cp .env.example .env

# Edit the .env file with your actual values
nano .env  # or use your preferred editor
```

### 2. Required Environment Variables

The following environment variables must be configured in your `.env` file:

```env
# Database Configuration
POSTGRES_DB=cims_db
POSTGRES_USER=cims_user
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# Backend Application Configuration
SECRET_KEY=your-super-secret-key-at-least-32-characters-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# MCP Configuration
MCP_HOST=localhost
MCP_PORT=8001

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://frontend:3000

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NODE_ENV=production
```

**⚠️ Security Note**: Never commit `.env` files to version control. They contain sensitive information like passwords and secret keys.

## Quick Start

### Development Environment

For development with hot reload and volume mounting:

```bash
# 1. Setup environment variables
cp .env.example .env.dev
# Edit .env.dev with development settings

# 2. Start development environment
docker-compose --env-file .env.dev -f docker-compose.dev.yml up --build

# Or run in background
docker-compose --env-file .env.dev -f docker-compose.dev.yml up -d --build
```

### Production Environment

For production deployment:

```bash
# 1. Setup environment variables
cp .env.example .env
# Edit .env with production settings (strong passwords, secure secrets)

# 2. Start production environment
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

This will start:
- **Frontend**: http://localhost:3000 (Optimized Next.js build)
- **Backend**: http://localhost:8000 (FastAPI production mode)
- **Database**: PostgreSQL on port 5432
- **Nginx**: http://localhost (Reverse proxy with load balancing)

## Services Overview

### 🗄️ PostgreSQL Database
- **Image**: postgres:15-alpine
- **Port**: 5432
- **Database**: cims_db
- **User**: cims_user
- **Password**: cims_password

### 🚀 Backend (FastAPI)
- **Port**: 8000
- **Features**: Auto-reload in dev mode, API documentation at `/docs`
- **Environment**: Configurable via environment variables

### 🎨 Frontend (Next.js)
- **Port**: 3000
- **Features**: Hot reload in dev mode, optimized build in production
- **Turbopack**: Enabled for faster development builds

### 🔄 Nginx (Production Only)
- **Port**: 80
- **Features**: Reverse proxy, rate limiting, security headers
- **Routes**: 
  - `/` → Frontend
  - `/api` → Backend

## Environment Variables

All environment variables are now managed through `.env` files for better security and maintainability.

### Environment Files

- **`.env`**: Production environment variables
- **`.env.dev`**: Development environment variables  
- **`.env.example`**: Template showing all required variables

### Database Environment Variables

```env
POSTGRES_DB=cims_db
POSTGRES_USER=cims_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
```

### Backend Environment Variables

```env
SECRET_KEY=your-super-secret-key-at-least-32-characters-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
MCP_HOST=localhost
MCP_PORT=8001
CORS_ORIGINS=http://localhost:3000,http://frontend:3000
```

### Frontend Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NODE_ENV=development|production
```

### Container Configuration

```env
POSTGRES_CONTAINER_NAME=cims_postgres
BACKEND_CONTAINER_NAME=cims_backend
FRONTEND_CONTAINER_NAME=cims_frontend
NGINX_CONTAINER_NAME=cims_nginx
```

### Port Configuration

```env
POSTGRES_EXTERNAL_PORT=5432
BACKEND_EXTERNAL_PORT=8000
FRONTEND_EXTERNAL_PORT=3000
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443
```

## Useful Commands

### Development

```bash
# Start development environment with custom env file
docker-compose --env-file .env.dev -f docker-compose.dev.yml up

# Rebuild containers
docker-compose --env-file .env.dev -f docker-compose.dev.yml up --build

# View logs
docker-compose --env-file .env.dev -f docker-compose.dev.yml logs -f

# Stop all services
docker-compose --env-file .env.dev -f docker-compose.dev.yml down

# Stop and remove volumes
docker-compose --env-file .env.dev -f docker-compose.dev.yml down -v
```

### Production

```bash
# Start production environment (uses .env by default)
docker-compose up

# Rebuild containers
docker-compose up --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Individual Services

```bash
# Start only database
docker-compose up postgres

# Start backend and database
docker-compose up postgres backend

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Execute commands in running containers
docker-compose exec backend bash
docker-compose exec frontend sh
docker-compose exec postgres psql -U cims_user -d cims_db
```

## Development Workflow

1. **Setup environment variables**:
   ```bash
   cp .env.example .env.dev
   # Edit .env.dev with development settings
   ```

2. **Start development environment**:
   ```bash
   docker-compose --env-file .env.dev -f docker-compose.dev.yml up
   ```

3. **Make changes to your code** - changes will be automatically reflected due to volume mounting

4. **Access the applications**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

5. **Database access**:
   ```bash
   docker-compose exec postgres psql -U ${POSTGRES_USER} -d ${POSTGRES_DB}
   ```

## Production Deployment

1. **Setup environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

2. **Set strong passwords** and secret keys in `.env`

3. **Configure SSL certificates** in the nginx configuration (optional)

4. **Start production environment**:
   ```bash
   docker-compose up -d --build
   ```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 3000, 8000, and 5432 are not in use
2. **Permission issues**: On Linux, you might need to run with `sudo`
3. **Database connection**: Wait for database health check to pass before backend starts

### Checking Service Health

```bash
# Check container status
docker-compose ps

# Check logs
docker-compose logs

# Check database connectivity
docker-compose exec postgres pg_isready -U cims_user -d cims_db

# Test backend API
curl http://localhost:8000/health

# Test frontend
curl http://localhost:3000
```

### Rebuilding Images

```bash
# Rebuild all images
docker-compose build --no-cache

# Rebuild specific service
docker-compose build --no-cache backend
```

## File Structure

```
cims/
├── backend/
│   ├── Dockerfile              # Backend container configuration
│   ├── src/                    # FastAPI application source
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── Dockerfile              # Frontend container configuration
│   ├── src/                    # Next.js application source
│   ├── package.json            # Node.js dependencies
│   └── next.config.ts          # Next.js configuration
├── docker-compose.yml          # Production configuration
├── docker-compose.dev.yml      # Development configuration
├── nginx.conf                  # Nginx reverse proxy configuration
└── DOCKER_README.md           # This file
```

## Security Notes

- Change default passwords in production
- Use environment files for sensitive data
- Configure SSL/TLS for production deployments
- Review and customize nginx security headers
- Implement proper backup strategies for the database

## Performance Optimization

- Use Docker BuildKit for faster builds
- Implement multi-stage builds for smaller images
- Configure proper resource limits
- Use Docker volumes for persistent data
- Monitor container resource usage

For more information, refer to the individual service documentation in their respective directories.
