#!/bin/bash

# CIMS Environment Setup Script

echo "🐳 CIMS Docker Environment Setup"
echo "================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Setup environment files
echo ""
echo "📝 Setting up environment files..."

if [ ! -f ".env" ]; then
    echo "Creating production .env file..."
    cp .env.example .env
    echo "✅ Created .env file from .env.example"
    echo "⚠️  Please edit .env with your production settings"
else
    echo "ℹ️  .env file already exists"
fi

if [ ! -f ".env.dev" ]; then
    echo "Creating development .env.dev file..."
    cp .env.example .env.dev
    # Update some defaults for development
    sed -i 's/POSTGRES_DB=cims_db/POSTGRES_DB=cims_db_dev/' .env.dev
    sed -i 's/POSTGRES_PASSWORD=your_secure_password_here/POSTGRES_PASSWORD=cims_password_dev/' .env.dev
    sed -i 's/SECRET_KEY=your-super-secret-key-at-least-32-characters-long/SECRET_KEY=dev-secret-key-only-for-development/' .env.dev
    sed -i 's/NODE_ENV=production/NODE_ENV=development/' .env.dev
    sed -i 's/POSTGRES_CONTAINER_NAME=cims_postgres/POSTGRES_CONTAINER_NAME=cims_postgres_dev/' .env.dev
    sed -i 's/BACKEND_CONTAINER_NAME=cims_backend/BACKEND_CONTAINER_NAME=cims_backend_dev/' .env.dev
    sed -i 's/FRONTEND_CONTAINER_NAME=cims_frontend/FRONTEND_CONTAINER_NAME=cims_frontend_dev/' .env.dev
    echo "✅ Created .env.dev file with development defaults"
else
    echo "ℹ️  .env.dev file already exists"
fi

echo ""
echo "🚀 Setup complete!"
echo ""
echo "Next steps:"
echo "1. For development:"
echo "   docker-compose --env-file .env.dev -f docker-compose.dev.yml up --build"
echo ""
echo "2. For production:"
echo "   - Edit .env with your production settings"
echo "   - docker-compose up --build"
echo ""
echo "📚 For more information, see DOCKER_README.md"
