# Local Development Setup Guide

## 🚀 Quick Start - Local Development

### **1. Backend Setup**

```bash
# Navigate to backend
cd backend

# Copy development environment
cp .env.development .env

# Install dependencies
npm install

# Start PostgreSQL (using Docker)
docker-compose up -d

# Run database migrations
npm run migration:run

# Start development server
npm run start:dev
```

**Backend will be available at**: `http://localhost:3000`
**WebSocket server**: `http://localhost:3001`

### **2. Mobile App Setup**

```bash
# Navigate to mobile app
cd palpalette-app

# Copy development environment
cp .env.development .env

# Install dependencies
npm install

# Start development server
npm run dev
```

**Mobile app will be available at**: `http://localhost:8100`

### **3. Verify Configuration**

Open the mobile app in your browser (`http://localhost:8100`). In the browser console, you should see:

```
🔧 PalPalette API Configuration: {
  BASE_URL: "http://localhost:3000",
  WEBSOCKET_URL: "http://localhost:3001",
  ENVIRONMENT: "development",
  DEBUG_MODE: true
}
```

## 🔧 Environment Configuration

### **Development vs Production**

The app automatically switches configuration based on environment files:

| Environment     | Backend URL                          | WebSocket URL                        | Used For      |
| --------------- | ------------------------------------ | ------------------------------------ | ------------- |
| **Development** | `http://localhost:3000`              | `http://localhost:3001`              | Local testing |
| **Production**  | `http://cides06.gm.fh-koeln.de:3000` | `http://cides06.gm.fh-koeln.de:3001` | Live server   |

### **Environment Files**

**Backend**:

- `.env.development` → Local development with localhost URLs
- `.env.production` → Production with cides06 server URLs
- `.env.example` → Template file

**Mobile App**:

- `.env.development` → Local development configuration
- `.env.production` → Production configuration
- `.env.example` → Template file

## 🎯 Testing the Authentication

### **1. Start Both Services**

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Mobile App
cd palpalette-app
npm run dev
```

### **2. Test Login Flow**

1. Open `http://localhost:8100` in browser
2. Register a new account or login
3. **Observe**: App uses localhost URLs automatically
4. **Network tab**: Requests go to `localhost:3000`
5. **Console**: Shows development configuration

### **3. Test Token Refresh**

1. Login successfully
2. In browser dev tools, go to **Application** → **Storage** → **Capacitor Preferences**
3. Note the `authToken` value
4. Wait 15+ minutes OR modify token expiry in backend for faster testing
5. Make any API request (go to devices page, etc.)
6. **Observe**: Request works seamlessly (token auto-refreshed)
7. **Network tab**: You'll see automatic refresh call + retry

## 📱 Building for Production

### **Web Build (Production)**

```bash
cd palpalette-app
npm run build:prod    # Uses production environment
```

### **Mobile Build (Development)**

```bash
cd palpalette-app
npm run build:mobile:dev    # Uses development environment for testing
```

### **Mobile Build (Production)**

```bash
cd palpalette-app
npm run build:mobile        # Uses production environment
```

## 🔍 Debugging

### **Backend Debugging**

```bash
# Check environment variables
cd backend
node -e "console.log(process.env)"

# Check API endpoints
curl http://localhost:3000/health
```

### **Mobile App Debugging**

1. **Browser Console**: Check configuration logs
2. **Network Tab**: Monitor API calls and responses
3. **Application Tab**: Check stored tokens in Capacitor Preferences

### **Environment Issues**

If you see requests going to wrong URLs:

1. **Check environment file exists**: `.env` in mobile app directory
2. **Restart dev server**: Environment changes require restart
3. **Clear browser cache**: Stored config might be cached
4. **Check console logs**: Look for configuration object

## 🚨 Common Issues

### **CORS Errors**

- Ensure backend `.env` has `CORS_ORIGIN=http://localhost:8100`
- Restart backend after changing CORS settings

### **Database Connection**

- Ensure PostgreSQL is running: `docker-compose up -d`
- Check database credentials in backend `.env`

### **Token Issues**

- Clear stored tokens: Browser → Application → Storage → Clear
- Check JWT secret is set in backend `.env`

### **Environment Not Loading**

- Ensure `.env` files are in correct directories
- Restart development servers after env changes
- Check file names are exactly `.env` (not `.env.txt`)

## 📋 Development Checklist

- [ ] Backend `.env` configured with localhost database
- [ ] Mobile app `.env` configured with localhost URLs
- [ ] PostgreSQL database running
- [ ] Backend development server running on port 3000
- [ ] Mobile app development server running on port 8100
- [ ] Browser console shows correct configuration
- [ ] Login/registration working
- [ ] API requests going to localhost
- [ ] Token refresh working automatically

## 🔄 Switching Environments

### **To Production**

```bash
# Mobile app
cd palpalette-app
cp .env.production .env
npm run dev

# Backend
cd backend
cp .env.production .env
npm run start:dev
```

### **Back to Development**

```bash
# Mobile app
cd palpalette-app
cp .env.development .env
npm run dev

# Backend
cd backend
cp .env.development .env
npm run start:dev
```

Now you can easily test everything locally with `localhost` URLs! 🎉
