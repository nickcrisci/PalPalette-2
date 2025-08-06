# PalPalette Development Guide

## Getting Started

This guide covers setting up a development environment for PalPalette, including all three components: backend API, mobile app, and ESP32 firmware.

## Development Prerequisites

### Required Software

- **Node.js** 18+ and npm (latest LTS version)
- **Docker** and Docker Compose
- **Git** for version control
- **Arduino IDE** 2.0+ or PlatformIO
- **Android Studio** (for mobile development)
- **Xcode** (for iOS development, macOS only)

### Optional Tools

- **VS Code** with recommended extensions
- **Postman** or **Insomnia** for API testing
- **pgAdmin** for database management
- **ESPTool** for ESP32 firmware management

## Project Structure Overview

```
PalPalette-2/
├── backend/              # NestJS Backend
├── palpalette-app/       # Ionic React Mobile App
├── controller/           # ESP32 Arduino Firmware
├── docs/                 # System Documentation
├── docker-compose.yml    # Development services
└── README.md             # Project overview
```

## Environment Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd PalPalette-2
```

### 2. Install Node.js Dependencies

```bash
# Backend dependencies
cd backend
npm install
cd ..

# Mobile app dependencies
cd palpalette-app
npm install
cd ..
```

### 3. Environment Configuration

#### Backend Environment

Create `backend/.env`:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=palpalette
DB_PASSWORD=development
DB_NAME=palpalette_dev

# JWT Configuration
JWT_SECRET=development-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
WS_PORT=3001

# Development Settings
NODE_ENV=development
LOG_LEVEL=debug
```

#### Mobile App Environment

Create `palpalette-app/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:3000",
  wsUrl: "ws://localhost:3001",
};
```

#### ESP32 Configuration

Update `controller/src/config.h`:

```cpp
#ifndef CONFIG_H
#define CONFIG_H

// Development Configuration
#define API_BASE_URL "http://192.168.1.100:3000"  // Your computer's IP
#define WS_HOST "192.168.1.100"                   // Your computer's IP
#define WS_PORT 3001
#define USE_SSL false

// WiFi Configuration for testing
#define DEFAULT_WIFI_SSID "YourWiFiName"
#define DEFAULT_WIFI_PASSWORD "YourWiFiPassword"

// Hardware Configuration
#define LED_PIN 2
#define LED_COUNT 30
#define BUTTON_PIN 0

// Debug Configuration
#define DEBUG_SERIAL true
#define SERIAL_BAUD 115200

#endif
```

## Backend Development

### Database Setup

```bash
cd backend

# Start PostgreSQL with Docker
docker-compose up -d

# Wait for database to be ready
sleep 10

# Run migrations
npm run migration:run

# Seed development data
npm run seed:run
```

### Development Server

```bash
# Start in development mode with hot reload
npm run start:dev

# Or start in debug mode
npm run start:debug
```

### Available Scripts

```bash
npm run start          # Start production build
npm run start:dev      # Start with hot reload
npm run start:debug    # Start with debugger
npm run build          # Build for production
npm run test           # Run unit tests
npm run test:e2e       # Run end-to-end tests
npm run migration:run  # Run database migrations
npm run migration:revert # Revert last migration
npm run seed:run       # Seed database with test data
```

### Database Management

```bash
# Create new migration
npm run migration:create -- src/migrations/AddNewFeature

# Generate migration from entity changes
npm run migration:generate -- src/migrations/UpdateUserEntity

# Show migration status
npm run migration:show
```

### Testing

```bash
# Unit tests
npm run test

# E2E tests (requires running server)
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode for development
npm run test:watch
```

## Mobile App Development

### Development Server

```bash
cd palpalette-app

# Start development server
npx ionic serve

# Or with specific platform
npx ionic serve --lab  # Platform comparison view
```

### Platform-Specific Development

#### Android Development

```bash
# Add Android platform
npx ionic cap add android

# Sync changes to Android
npx ionic cap sync android

# Open in Android Studio
npx ionic cap open android

# Run on connected device
npx ionic cap run android

# Live reload on device
npx ionic cap run android -l --external
```

#### iOS Development (macOS only)

```bash
# Add iOS platform
npx ionic cap add ios

# Sync changes to iOS
npx ionic cap sync ios

# Open in Xcode
npx ionic cap open ios

# Run on simulator
npx ionic cap run ios

# Live reload on device
npx ionic cap run ios -l --external
```

### Available Scripts

```bash
npx ionic serve          # Start development server
npx ionic build          # Build for production
npx ionic cap sync       # Sync web code to native platforms
npx ionic cap copy       # Copy web build to native platforms
npx ionic cap update     # Update Capacitor plugins
npx ionic doctor         # Check development environment
npx ionic info           # Show project information
```

### Testing

```bash
# Unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Component testing
npm run test:components

# E2E tests
npm run e2e
```

## ESP32 Firmware Development

### Arduino IDE Setup

#### Install Required Libraries

1. **ESP32 Board Package**:

   - File → Preferences
   - Additional Board Manager URLs: `https://dl.espressif.com/dl/package_esp32_index.json`
   - Tools → Board → Boards Manager → Search "ESP32" → Install

2. **Required Libraries** (Library Manager):
   - `ArduinoJson` by Benoit Blanchon
   - `WebSockets` by Markus Sattler
   - `WiFiManager` by tzapu
   - `Preferences` (included with ESP32)

#### Board Configuration

- **Board**: ESP32 Dev Module
- **CPU Frequency**: 240MHz
- **Flash Size**: 4MB
- **Partition Scheme**: Default 4MB with spiffs

### PlatformIO Setup (Alternative)

Create `controller/platformio.ini`:

```ini
[env:esp32dev]
platform = espressif32
board = esp32dev
framework = arduino
monitor_speed = 115200

lib_deps =
    bblanchon/ArduinoJson@^6.21.3
    markus-sattler/WebSockets@^2.4.1
    tzapu/WiFiManager@^2.0.16-rc.2

build_flags =
    -DCORE_DEBUG_LEVEL=3
    -DDEBUG_SERIAL=1

monitor_filters = esp32_exception_decoder
```

### Development Workflow

#### 1. Hardware Setup

```cpp
// Basic wiring for development:
// LED Strip (WS2812B):
//   - Data Pin → GPIO 2
//   - VCC → 3.3V or 5V
//   - GND → GND
//
// Optional Button:
//   - Button → GPIO 0 (Boot button)
//   - Pull-up resistor (10kΩ)
```

#### 2. Code Structure

```
controller/src/
├── main.ino           # Main application file
├── config.h           # Configuration constants
├── WiFiManager.h/.cpp # WiFi management
├── DeviceManager.h/.cpp # Device registration/pairing
├── WSClient.h/.cpp    # WebSocket communication
└── LEDController.h/.cpp # LED strip control
```

#### 3. Serial Debugging

```cpp
// Enable debug output in config.h
#define DEBUG_SERIAL true
#define SERIAL_BAUD 115200

// Use debug macros in code
#ifdef DEBUG_SERIAL
  #define DEBUG_PRINT(x) Serial.print(x)
  #define DEBUG_PRINTLN(x) Serial.println(x)
#else
  #define DEBUG_PRINT(x)
  #define DEBUG_PRINTLN(x)
#endif
```

#### 4. Upload and Monitor

```bash
# Upload code
arduino --upload controller/src/main.ino --port /dev/ttyUSB0

# Monitor serial output
arduino --monitor controller/src/main.ino --port /dev/ttyUSB0

# Or use screen (Linux/macOS)
screen /dev/ttyUSB0 115200
```

### Hardware Testing

#### LED Strip Testing

```cpp
// Test LED functionality
void testLEDs() {
  // Red
  for(int i = 0; i < LED_COUNT; i++) {
    strip.setPixelColor(i, strip.Color(255, 0, 0));
  }
  strip.show();
  delay(1000);

  // Green
  for(int i = 0; i < LED_COUNT; i++) {
    strip.setPixelColor(i, strip.Color(0, 255, 0));
  }
  strip.show();
  delay(1000);

  // Blue
  for(int i = 0; i < LED_COUNT; i++) {
    strip.setPixelColor(i, strip.Color(0, 0, 255));
  }
  strip.show();
  delay(1000);

  // Off
  strip.clear();
  strip.show();
}
```

## Integrated Development

### Full System Testing

#### 1. Start All Services

```bash
# Terminal 1: Start backend
cd backend
npm run start:dev

# Terminal 2: Start mobile app
cd palpalette-app
npx ionic serve

# Terminal 3: Upload ESP32 firmware
# Flash firmware to ESP32 device
```

#### 2. Test Device Flow

1. **ESP32 Setup**:

   - Connect to "PalPalette-Setup" WiFi hotspot
   - Configure WiFi through captive portal
   - Verify device registration in backend logs

2. **Mobile App Testing**:

   - Register/login user account
   - Check devices list for new pairing code
   - Claim device using pairing code
   - Verify device appears as "claimed"

3. **Color Sharing Test**:
   - Extract colors from camera in mobile app
   - Send colors to claimed device
   - Verify LED strip displays received colors

### Development Tools

#### API Testing with curl

```bash
# Test backend API
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@palpalette.com","password":"password123"}'

# Test device registration
curl -X POST http://localhost:3000/devices/register \
  -H "Content-Type: application/json" \
  -d '{"macAddress":"AA:BB:CC:DD:EE:FF","name":"Test Device"}'
```

#### WebSocket Testing

```bash
# Install wscat for WebSocket testing
npm install -g wscat

# Connect to WebSocket server
wscat -c ws://localhost:3001/ws

# Send test message
{"type":"register","data":{"macAddress":"AA:BB:CC:DD:EE:FF","name":"Test Device"}}
```

#### Database Testing

```bash
# Connect to development database
docker-compose exec postgres psql -U palpalette -d palpalette_dev

# Common queries
SELECT * FROM users;
SELECT * FROM devices;
SELECT * FROM messages;
```

## Debugging

### Backend Debugging

#### VS Code Launch Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Backend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/backend/src/main.ts",
      "args": [],
      "runtimeArgs": ["-r", "ts-node/register"],
      "cwd": "${workspaceFolder}/backend",
      "envFile": "${workspaceFolder}/backend/.env",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "restart": true,
      "protocol": "inspector"
    }
  ]
}
```

#### Common Debug Commands

```bash
# Debug with inspect
npm run start:debug

# View logs
tail -f logs/combined.log

# Database queries with explain
\x on
EXPLAIN ANALYZE SELECT * FROM devices WHERE owner_id = 'uuid';
```

### Mobile App Debugging

#### Browser DevTools

```bash
# Open app in browser with DevTools
npx ionic serve --devapp

# Remote debugging Android
chrome://inspect/#devices

# Safari Web Inspector (iOS)
# Develop → Device → Inspector
```

#### Device Debugging

```bash
# Android debugging
npx ionic cap run android --livereload --external

# iOS debugging (macOS)
npx ionic cap run ios --livereload --external

# View device logs
adb logcat | grep Chromium  # Android
# Use Xcode console for iOS
```

### ESP32 Debugging

#### Serial Monitor

```cpp
// Add debug output throughout code
DEBUG_PRINTLN("WiFi connected");
DEBUG_PRINT("IP address: ");
DEBUG_PRINTLN(WiFi.localIP());

DEBUG_PRINT("WebSocket message: ");
DEBUG_PRINTLN(payload);
```

#### Common Issues

```cpp
// WiFi connection issues
if (WiFi.status() != WL_CONNECTED) {
  DEBUG_PRINTLN("WiFi disconnected, attempting reconnect...");
  WiFi.reconnect();
}

// WebSocket connection issues
if (!webSocket.isConnected()) {
  DEBUG_PRINTLN("WebSocket disconnected, attempting reconnect...");
  connectWebSocket();
}

// Memory issues
DEBUG_PRINT("Free heap: ");
DEBUG_PRINTLN(ESP.getFreeHeap());
```

## Performance Optimization

### Backend Optimization

```typescript
// Database query optimization
const devices = await this.deviceRepository.find({
  where: { ownerId },
  select: ["id", "name", "isOnline"], // Only select needed fields
  cache: true, // Enable query caching
});

// WebSocket connection pooling
const maxConnections = 1000;
if (this.connections.size > maxConnections) {
  this.closeOldestConnection();
}
```

### Mobile App Optimization

```typescript
// Image optimization for color extraction
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

// Resize image for faster processing
const maxSize = 300;
const ratio = Math.min(maxSize / image.width, maxSize / image.height);
canvas.width = image.width * ratio;
canvas.height = image.height * ratio;

ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
```

### ESP32 Optimization

```cpp
// Optimize LED updates
void updateLEDs(uint32_t* colors, int count) {
  // Batch LED updates
  for(int i = 0; i < count && i < LED_COUNT; i++) {
    strip.setPixelColor(i, colors[i]);
  }
  strip.show(); // Single update call
}

// Memory management
void processMessage(String& payload) {
  DynamicJsonDocument doc(1024);

  if (deserializeJson(doc, payload) == DeserializationError::Ok) {
    handleMessage(doc);
  }

  // Clear JSON document to free memory
  doc.clear();
  payload = String(); // Clear string
}
```

## Troubleshooting

### Common Development Issues

#### Backend Issues

```bash
# Port already in use
ERROR: Port 3000 is already in use
# Solution:
lsof -ti:3000 | xargs kill -9

# Database connection failed
# Solution: Check if PostgreSQL is running
docker-compose ps
docker-compose up -d postgres
```

#### Mobile App Issues

```bash
# Node modules issues
# Solution: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Capacitor sync issues
npx ionic cap sync --clear
npx ionic cap copy
```

#### ESP32 Issues

```cpp
// WiFi connection timeout
// Solution: Increase timeout and add retry logic
WiFi.begin(ssid, password);
unsigned long startTime = millis();
while (WiFi.status() != WL_CONNECTED && millis() - startTime < 30000) {
  delay(500);
  DEBUG_PRINT(".");
}

// WebSocket connection failed
// Solution: Check firewall and network configuration
```

## Code Style and Standards

### TypeScript/JavaScript

```typescript
// Use ESLint and Prettier configuration
// .eslintrc.js and .prettierrc in project root

// Follow naming conventions
class DeviceService {
  private readonly deviceRepository: Repository<Device>;

  async findDevicesByOwner(ownerId: string): Promise<Device[]> {
    return this.deviceRepository.find({ where: { ownerId } });
  }
}
```

### C++ (ESP32)

```cpp
// Follow Arduino style guidelines
// Use consistent naming and indentation

class DeviceManager {
private:
  String deviceId;
  bool isProvisioned;

public:
  bool initializeDevice();
  void handlePairingMode();
  String generatePairingCode();
};

// Use const for read-only values
const int LED_PIN = 2;
const char* DEVICE_NAME = "PalPalette Device";
```

## Contributing

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/device-animations

# Make changes and commit
git add .
git commit -m "feat: add LED animation patterns"

# Push and create pull request
git push origin feature/device-animations
```

### Commit Message Format

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: adding tests
chore: maintenance tasks
```

### Pull Request Process

1. Create feature branch from main
2. Make changes with tests
3. Update documentation
4. Create pull request with description
5. Address review comments
6. Merge after approval

This completes the development setup guide for PalPalette. Each component can be developed independently while maintaining integration points for full system testing.
