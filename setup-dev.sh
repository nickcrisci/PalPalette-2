#!/bin/bash

# PalPalette Local Development Setup Script

echo "🎨 Setting up PalPalette for local development..."

# Check if we're in the right directory
if [[ ! -f "package.json" ]] || [[ ! -d "backend" ]] || [[ ! -d "palpalette-app" ]]; then
    echo "❌ Please run this script from the PalPalette-2 root directory"
    exit 1
fi

echo "📁 Setting up environment files..."

# Backend environment setup
if [[ ! -f "backend/.env" ]]; then
    echo "🔧 Creating backend/.env from development template..."
    cp backend/.env.development backend/.env
    echo "✅ Created backend/.env"
else
    echo "ℹ️  backend/.env already exists"
fi

# Mobile app environment setup  
if [[ ! -f "palpalette-app/.env" ]]; then
    echo "📱 Creating palpalette-app/.env from development template..."
    cp palpalette-app/.env.development palpalette-app/.env
    echo "✅ Created palpalette-app/.env"
else
    echo "ℹ️  palpalette-app/.env already exists"
fi

echo ""
echo "📦 Installing dependencies..."

# Backend dependencies
echo "🔧 Installing backend dependencies..."
cd backend
npm install
cd ..

# Mobile app dependencies
echo "📱 Installing mobile app dependencies..."
cd palpalette-app  
npm install
cd ..

echo ""
echo "🐳 Starting PostgreSQL database..."
cd backend
docker-compose up -d
echo "⏳ Waiting for database to be ready..."
sleep 5

echo ""
echo "🗄️ Running database migrations..."
npm run migration:run

cd ..

echo ""
echo "✅ Setup complete! 🎉"
echo ""
echo "🚀 To start development:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend"
echo "  npm run start:dev"
echo ""
echo "Terminal 2 (Mobile App):"  
echo "  cd palpalette-app"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:8100"
echo ""
echo "🔧 Configuration:"
echo "  - Backend: http://localhost:3000"
echo "  - WebSocket: http://localhost:3001"  
echo "  - Mobile App: http://localhost:8100"
echo "  - Database: localhost:5432"
