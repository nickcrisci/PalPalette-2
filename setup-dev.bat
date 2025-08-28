@echo off
REM PalPalette Local Development Setup Script for Windows

echo 🎨 Setting up PalPalette for local development...

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Please run this script from the PalPalette-2 root directory
    exit /b 1
)
if not exist "backend" (
    echo ❌ Please run this script from the PalPalette-2 root directory
    exit /b 1
)
if not exist "palpalette-app" (
    echo ❌ Please run this script from the PalPalette-2 root directory
    exit /b 1
)

echo 📁 Setting up environment files...

REM Backend environment setup
if not exist "backend\.env" (
    echo 🔧 Creating backend\.env from development template...
    copy "backend\.env.development" "backend\.env" >nul
    echo ✅ Created backend\.env
) else (
    echo ℹ️  backend\.env already exists
)

REM Mobile app environment setup
if not exist "palpalette-app\.env" (
    echo 📱 Creating palpalette-app\.env from development template...
    copy "palpalette-app\.env.development" "palpalette-app\.env" >nul
    echo ✅ Created palpalette-app\.env
) else (
    echo ℹ️  palpalette-app\.env already exists
)

echo.
echo 📦 Installing dependencies...

REM Backend dependencies
echo 🔧 Installing backend dependencies...
cd backend
call npm install
cd ..

REM Mobile app dependencies
echo 📱 Installing mobile app dependencies...
cd palpalette-app
call npm install
cd ..

echo.
echo 🐳 Starting PostgreSQL database...
cd backend
docker-compose up -d
echo ⏳ Waiting for database to be ready...
timeout /t 5 /nobreak >nul

echo.
echo 🗄️ Running database migrations...
call npm run migration:run

cd ..

echo.
echo ✅ Setup complete! 🎉
echo.
echo 🚀 To start development:
echo.
echo Terminal 1 (Backend):
echo   cd backend
echo   npm run start:dev
echo.
echo Terminal 2 (Mobile App):
echo   cd palpalette-app
echo   npm run dev
echo.
echo Then open: http://localhost:8100
echo.
echo 🔧 Configuration:
echo   - Backend: http://localhost:3000
echo   - WebSocket: http://localhost:3001
echo   - Mobile App: http://localhost:8100
echo   - Database: localhost:5432

pause
