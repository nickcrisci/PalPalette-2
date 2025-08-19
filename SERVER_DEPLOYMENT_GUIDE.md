# Server Deployment Guide for PalPalette

## Prerequisites on Server (cides06.gm.fh-koeln.de)

1. **Install Docker and Docker Compose:**

```bash
# Update system
sudo apt update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
# Log out and back in for this to take effect
```

2. **Configure Firewall:**

```bash
# Allow HTTP traffic
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow PalPalette ports
sudo ufw allow 3000/tcp  # Backend API
sudo ufw allow 3001/tcp  # WebSocket for ESP32 devices
sudo ufw allow 5432/tcp  # PostgreSQL (optional, only if accessing externally)

# Enable firewall
sudo ufw enable
```

## Deployment Steps

1. **Copy files to server:**

```bash
# From your local machine
scp -r ./deployment user@cides06.gm.fh-koeln.de:/opt/palpalette/
```

2. **Deploy on server:**

```bash
# SSH to server
ssh user@cides06.gm.fh-koeln.de

# Navigate to deployment directory
cd /opt/palpalette

# Start the application
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f backend
```

3. **Verify deployment:**

```bash
# Test backend API
curl http://cides06.gm.fh-koeln.de:3000/health

# Test WebSocket (install wscat: npm install -g wscat)
wscat -c ws://cides06.gm.fh-koeln.de:3001/ws
```

## Mobile App Deployment

After server deployment, rebuild and deploy your mobile app:

```bash
# In palpalette-app directory
npm run build

# For Android
npx ionic cap sync android
npx ionic cap run android

# For iOS
npx ionic cap sync ios
npx ionic cap run ios
```

## ESP32 Controller Update

1. Open your Arduino IDE or PlatformIO
2. The config.h file has been updated with the new server URL
3. Flash the updated firmware to your ESP32 devices
4. Devices should automatically connect to the new server

## Monitoring and Maintenance

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f postgres

# Restart services
docker-compose restart backend

# Update application
docker-compose pull
docker-compose up -d --build

# Backup database
docker-compose exec postgres pg_dump -U postgres palpalette > backup.sql
```

## Troubleshooting

### If devices can't connect:

1. Check firewall settings: `sudo ufw status`
2. Verify ports are listening: `netstat -tlnp | grep -E '3000|3001'`
3. Check Docker containers: `docker-compose ps`

### If mobile app can't connect:

1. Verify backend is running: `curl http://cides06.gm.fh-koeln.de:3000/health`
2. Check CORS configuration in backend/main.ts
3. Verify mobile app config in palpalette-app/src/config/api.ts

### Database issues:

1. Check PostgreSQL logs: `docker-compose logs postgres`
2. Connect to database: `docker-compose exec postgres psql -U postgres -d palpalette`
3. Reset database: `docker-compose down -v && docker-compose up -d`
