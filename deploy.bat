@echo off
REM Deployment script for PalPalette to cides06.gm.fh-koeln.de
REM Run this script on your local machine to prepare files for deployment

echo 🚀 Preparing PalPalette for deployment to cides06.gm.fh-koeln.de

REM Create deployment directory
if not exist deployment mkdir deployment

REM Copy necessary files
copy docker-compose.production.yml deployment\docker-compose.yml
xcopy backend deployment\backend\ /E /I /Y
copy backend\.env.production deployment\backend\.env

echo ✅ Files prepared in .\deployment directory
echo.
echo 📋 Next steps:
echo 1. Copy the .\deployment directory to your server
echo 2. On the server, run: docker-compose up -d
echo 3. Update your mobile app with the new server URL
echo 4. Flash updated firmware to ESP32 devices
echo.
echo 🔧 Server commands:
echo    scp -r .\deployment user@cides06.gm.fh-koeln.de:/opt/palpalette/
echo    ssh user@cides06.gm.fh-koeln.de
echo    cd /opt/palpalette
echo    docker-compose up -d
