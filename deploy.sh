#!/bin/bash

# PalPalette Deployment Script
# This script can be used for local deployment or as reference for GitHub Actions

set -e  # Exit on any error

SERVER_HOST="cides06.gm.fh-koeln.de"
SERVER_PATH="/opt/palpalette"

echo "🚀 PalPalette Deployment Script"
echo "================================"

# Check if we should use GitHub Actions instead
if [[ "${1}" == "--help" || "${1}" == "-h" ]]; then
    echo "Usage: $0 [--local|--github-setup]"
    echo ""
    echo "Options:"
    echo "  --local        Deploy directly from this machine (requires SSH access)"
    echo "  --github-setup Show GitHub Actions setup instructions"
    echo "  --help         Show this help message"
    echo ""
    echo "Recommended: Use GitHub Actions for automated deployment!"
    echo "Run: $0 --github-setup"
    exit 0
fi

if [[ "${1}" == "--github-setup" ]]; then
    echo "🔧 GitHub Actions Setup"
    echo "======================="
    echo ""
    echo "For automated deployment, follow these steps:"
    echo "1. Read GITHUB_ACTIONS_SETUP.md for detailed instructions"
    echo "2. Configure GitHub secrets (SSH key, server credentials)"
    echo "3. Push to main branch to trigger automatic deployment"
    echo ""
    echo "Benefits of GitHub Actions:"
    echo "  ✅ Automatic deployment on every push"
    echo "  ✅ Built-in testing before deployment"
    echo "  ✅ Mobile app and firmware building"
    echo "  ✅ Deployment verification"
    echo "  ✅ No need for local server access"
    echo ""
    echo "📖 See GITHUB_ACTIONS_SETUP.md for full setup guide"
    exit 0
fi

if [[ "${1}" == "--local" ]]; then
    echo "📦 Local deployment to ${SERVER_HOST}"
    echo ""
    
    # Check if we have the required tools
    if ! command -v scp &> /dev/null; then
        echo "❌ scp not found. Please install OpenSSH client."
        exit 1
    fi
    
    if ! command -v ssh &> /dev/null; then
        echo "❌ ssh not found. Please install OpenSSH client."
        exit 1
    fi
    
    # Create deployment directory
    echo "📁 Preparing deployment files..."
    mkdir -p deployment/backend
    
    # Copy files
    cp docker-compose.production.yml deployment/docker-compose.yml
    cp -r backend/* deployment/backend/
    
    # Create production environment file (you'll need to edit this)
    cat > deployment/backend/.env << EOF
# Production Environment - EDIT THESE VALUES!
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_secure_database_password_here
DB_DATABASE=palpalette

JWT_SECRET=your_very_long_jwt_secret_here_at_least_32_characters
JWT_EXPIRES_IN=7d

NODE_ENV=production
PORT=3000
WS_PORT=3001

CORS_ORIGIN=http://${SERVER_HOST}
EOF
    
    echo "⚠️  IMPORTANT: Edit deployment/backend/.env with your production credentials!"
    echo "Press Enter to continue after editing the .env file..."
    read
    
    # Deploy to server
    echo "� Deploying to server..."
    
    # Copy files
    echo "📤 Copying files to server..."
    scp -r deployment/* ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/
    
    # Deploy on server
    echo "🔧 Starting deployment on server..."
    ssh ${SERVER_USER}@${SERVER_HOST} << EOF
        cd ${SERVER_PATH}
        echo "Stopping existing containers..."
        docker-compose down || true
        
        echo "Building and starting services..."
        docker-compose build --no-cache backend
        docker-compose up -d
        
        echo "Waiting for services to start..."
        sleep 30
        
        echo "Checking service status..."
        docker-compose ps
        docker-compose logs --tail=20 backend
EOF
    
    # Verify deployment
    echo "✅ Verifying deployment..."
    sleep 10
    
    if curl -f http://${SERVER_HOST}:3000/health &> /dev/null; then
        echo "✅ Backend health check passed!"
    else
        echo "❌ Backend health check failed!"
        exit 1
    fi
    
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo "Backend: http://${SERVER_HOST}:3000"
    echo "WebSocket: ws://${SERVER_HOST}:3001"
    
else
    echo "🤖 Automated Deployment with GitHub Actions (Recommended)"
    echo "========================================================"
    echo ""
    echo "Instead of manual deployment, we recommend using GitHub Actions"
    echo "for automated, reliable deployments."
    echo ""
    echo "Quick start:"
    echo "1. $0 --github-setup    # Setup instructions"
    echo "2. $0 --local          # Manual local deployment"
    echo "3. $0 --help           # Show all options"
    echo ""
    echo "🚀 GitHub Actions will automatically:"
    echo "  • Test your code"
    echo "  • Deploy to server on every push to main"
    echo "  • Build mobile apps and firmware"
    echo "  • Verify deployment health"
fi
