# PalPalette Deployment Guide

This guide covers deploying PalPalette to a production server using git clone.

## Prerequisites

- Linux server with Docker and Docker Compose installed
- Git installed on the server
- Open ports: 3000 (API), 3001 (WebSocket)

## Quick Deployment

### 1. Clone Repository

```bash
cd /opt
sudo git clone https://github.com/yourusername/PalPalette-2.git palpalette
cd palpalette
```

### 2. Configure Environment

```bash
# Copy the example environment file
sudo cp .env.production.example .env.production

# Edit the environment file with your values
sudo nano .env.production
```

**Required Changes in .env.production:**

- `DB_PASSWORD`: Set a secure database password
- `JWT_SECRET`: Set a long, random JWT secret (at least 32 characters)
- `CORS_ORIGIN`: Update to match your domain

### 3. Deploy with Docker

```bash
# Build and start all services
sudo docker-compose -f docker-compose.production.yml --env-file .env.production up -d --build

# Check if services are running
sudo docker-compose -f docker-compose.production.yml ps
```

### 4. Verify Deployment

- API: http://your-server:3000/health
- WebSocket: ws://your-server:3001/ws

## Mobile App Configuration

The mobile app is already configured for `cides06.gm.fh-koeln.de`. To use a different server:

1. Edit `palpalette-app/src/config/api.ts`
2. Update `BASE_URL` and `WEBSOCKET_URL`
3. Rebuild the mobile app

## ESP32 Controller Configuration

The ESP32 firmware is already configured for `cides06.gm.fh-koeln.de`. To use a different server:

1. Edit `controller/src/config.h`
2. Update `DEFAULT_SERVER_URL`
3. Flash the updated firmware

## Updates

To update the deployment:

```bash
cd /opt/palpalette
sudo git pull
sudo docker-compose -f docker-compose.production.yml --env-file .env.production up -d --build
```

## Troubleshooting

### Container Issues

```bash
# View logs
sudo docker-compose -f docker-compose.production.yml logs

# Restart services
sudo docker-compose -f docker-compose.production.yml restart
```

### Database Issues

```bash
# Check database connection
sudo docker-compose -f docker-compose.production.yml exec postgres psql -U palpalette_user -d palpalette
```

### Network Issues

- Ensure ports 3000 and 3001 are open in firewall
- Check CORS_ORIGIN in .env.production matches your domain

## Security Notes

- Keep `.env.production` secure and never commit to git
- Use strong passwords for database and JWT secrets
- Consider using a reverse proxy (nginx) for SSL termination
- Regularly update the application with `git pull`
