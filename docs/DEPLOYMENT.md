# PalPalette Deployment Guide

## Overview

This guide covers deployment options for PalPalette, from local development to production environments. The system consists of three main components that can be deployed independently.

## Prerequisites

### Development Environment

- Node.js 18+ and npm
- Docker and Docker Compose
- Arduino IDE or PlatformIO
- Git for version control

### Production Environment

- Linux server (Ubuntu 20.04+ recommended)
- Docker and Docker Compose
- SSL certificate for HTTPS
- Domain name for backend API
- PostgreSQL database (local or cloud)

## Local Development Deployment

### 1. Clone Repository

```bash
git clone <repository-url>
cd PalPalette-2
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Start PostgreSQL with Docker
docker-compose up -d

# Run database migrations
npm run migration:run

# Seed initial data
npm run seed:run

# Start development server
npm run start:dev
```

The backend will be available at:

- API: http://localhost:3000
- WebSocket: ws://localhost:3001

### 3. Mobile App Setup

```bash
cd palpalette-app

# Install dependencies
npm install

# Start web development server
npx ionic serve

# Or run on Android device
npx ionic cap add android
npx ionic cap run android
```

### 4. ESP32 Development

```bash
cd controller

# Open in Arduino IDE
# Install required libraries:
# - ArduinoJson
# - WiFi
# - WebSockets
# - Preferences

# Configure in config.h:
# - API_BASE_URL
# - WS_HOST and WS_PORT

# Flash to ESP32 board
```

## Production Deployment

### Backend Deployment (Docker)

#### Option 1: Docker Compose (Recommended)

```yaml
# docker-compose.prod.yml
version: "3.8"
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@postgres:5432/palpalette
      - JWT_SECRET=your-secure-jwt-secret
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=palpalette
      - POSTGRES_USER=palpalette
      - POSTGRES_PASSWORD=secure-password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

#### Deploy Commands

```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# Run migrations in production
docker-compose exec backend npm run migration:run

# View logs
docker-compose logs -f backend
```

#### Option 2: Cloud Platforms

##### AWS Deployment

```bash
# Using AWS ECS with Fargate
aws ecs create-cluster --cluster-name palpalette

# Create task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service --cluster palpalette --service-name backend --task-definition palpalette-backend
```

##### Google Cloud Platform

```bash
# Using Google Cloud Run
gcloud run deploy palpalette-backend \
  --image gcr.io/project-id/palpalette-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

##### Heroku Deployment

```bash
# Install Heroku CLI and login
heroku login

# Create app
heroku create palpalette-backend

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-jwt-secret

# Deploy
git push heroku main

# Run migrations
heroku run npm run migration:run
```

### Mobile App Deployment

#### Android Build

```bash
cd palpalette-app

# Build for production
npx ionic build --prod

# Add Android platform
npx ionic cap add android

# Sync changes
npx ionic cap sync android

# Open in Android Studio
npx ionic cap open android

# Build signed APK in Android Studio
# OR use command line:
cd android
./gradlew assembleRelease
```

#### iOS Build

```bash
# Add iOS platform (macOS only)
npx ionic cap add ios

# Sync changes
npx ionic cap sync ios

# Open in Xcode
npx ionic cap open ios

# Build and publish through Xcode
```

#### Configuration for Production

```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: "https://your-domain.com/api",
  wsUrl: "wss://your-domain.com:3001",
};
```

### ESP32 Firmware Deployment

#### Production Configuration

```cpp
// config.h
#define API_BASE_URL "https://your-domain.com"
#define WS_HOST "your-domain.com"
#define WS_PORT 3001
#define USE_SSL true
```

#### Batch Firmware Deployment

```bash
# Using PlatformIO for batch programming
pio run --target upload --upload-port /dev/ttyUSB0

# Or create a script for multiple devices
for port in /dev/ttyUSB*; do
  pio run --target upload --upload-port $port
done
```

## Environment Configuration

### Backend Environment Variables

```bash
# .env.production
NODE_ENV=production
PORT=3000
WS_PORT=3001

# Database
DATABASE_URL=postgresql://user:pass@host:5432/palpalette
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=palpalette
DB_PASSWORD=secure-password
DB_NAME=palpalette

# JWT
JWT_SECRET=your-very-secure-jwt-secret-key
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://your-frontend-domain.com

# SSL (if using HTTPS)
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/key.pem
```

### Nginx Configuration

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:3000;
    }

    upstream websocket {
        server backend:3001;
    }

    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl;
        server_name your-domain.com;

        ssl_certificate /etc/ssl/certs/cert.pem;
        ssl_certificate_key /etc/ssl/certs/key.pem;

        # API routes
        location /api/ {
            proxy_pass http://backend/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # WebSocket routes
        location /ws {
            proxy_pass http://websocket;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
        }
    }
}
```

## Database Management

### Production Database Setup

```sql
-- Create production database
CREATE DATABASE palpalette;
CREATE USER palpalette WITH ENCRYPTED PASSWORD 'secure-password';
GRANT ALL PRIVILEGES ON DATABASE palpalette TO palpalette;
```

### Backup Strategy

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U palpalette -d palpalette > backup_$DATE.sql

# Keep only last 7 days
find /backups -name "backup_*.sql" -mtime +7 -delete
```

### Migration in Production

```bash
# Run migrations safely
docker-compose exec backend npm run migration:run

# Rollback if needed
docker-compose exec backend npm run migration:revert
```

## Monitoring & Logging

### Application Logging

```typescript
// logger.config.ts
import { WinstonModule } from "nest-winston";
import * as winston from "winston";

export const loggerConfig = WinstonModule.createLogger({
  transports: [
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
    }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});
```

### Health Checks

```typescript
// health.controller.ts
@Controller("health")
export class HealthController {
  @Get()
  healthCheck() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
```

### Monitoring with Docker

```bash
# View container stats
docker stats

# Monitor logs
docker-compose logs -f --tail=100 backend

# Container health
docker inspect --format='{{.State.Health.Status}}' backend
```

## SSL/TLS Configuration

### Let's Encrypt (Free SSL)

```bash
# Install certbot
sudo apt install certbot

# Generate certificate
sudo certbot certonly --standalone -d your-domain.com

# Auto-renewal
sudo crontab -e
0 12 * * * /usr/bin/certbot renew --quiet
```

### SSL for WebSocket

```typescript
// Enable WSS in production
const httpsServer = https.createServer(
  {
    cert: fs.readFileSync("/path/to/cert.pem"),
    key: fs.readFileSync("/path/to/key.pem"),
  },
  app
);

const wss = new WebSocket.Server({ server: httpsServer });
```

## Performance Optimization

### Backend Optimization

```typescript
// Enable compression
app.use(compression());

// Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);

// Database connection pooling
const dataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  extra: {
    max: 20, // maximum number of connections
    min: 5, // minimum number of connections
  },
});
```

### Database Optimization

```sql
-- Add indexes for performance
CREATE INDEX idx_devices_mac_address ON devices(mac_address);
CREATE INDEX idx_devices_owner_id ON devices(owner_id);
CREATE INDEX idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX idx_messages_sent_at ON messages(sent_at);
```

## Troubleshooting

### Common Issues

#### Backend Won't Start

```bash
# Check logs
docker-compose logs backend

# Verify environment variables
docker-compose exec backend env | grep -E '(DB_|JWT_)'

# Test database connection
docker-compose exec backend npm run migration:show
```

#### WebSocket Connection Issues

```bash
# Test WebSocket connection
wscat -c ws://localhost:3001

# Check firewall rules
sudo ufw status
sudo ufw allow 3001/tcp
```

#### Database Connection Errors

```bash
# Test database connectivity
docker-compose exec postgres psql -U palpalette -d palpalette -c "\dt"

# Check database logs
docker-compose logs postgres
```

### Performance Issues

```bash
# Monitor resource usage
docker stats

# Database query analysis
docker-compose exec postgres psql -U palpalette -d palpalette
EXPLAIN ANALYZE SELECT * FROM devices WHERE owner_id = 'uuid';
```

## Security Checklist

- [ ] JWT secret is cryptographically secure
- [ ] Database passwords are strong and unique
- [ ] SSL/TLS certificates are valid and auto-renewing
- [ ] CORS is configured for specific domains
- [ ] Rate limiting is enabled
- [ ] Database access is restricted to application only
- [ ] Firewall rules are properly configured
- [ ] Regular security updates are applied
- [ ] Backups are encrypted and tested
- [ ] Logs don't contain sensitive information

## Maintenance

### Regular Tasks

- Weekly database backups verification
- Monthly dependency updates
- Quarterly security audits
- SSL certificate renewal (automated)
- Log rotation and cleanup
- Performance monitoring review

### Update Procedures

```bash
# Update backend dependencies
npm audit fix
npm update

# Rebuild and redeploy
docker-compose build --no-cache
docker-compose up -d

# Test deployment
curl https://your-domain.com/health
```
