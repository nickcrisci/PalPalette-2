# PalPalette - IoT Color Sharing Platform

A complete IoT system for sharing color palettes between users through ESP32-powered devices. Users can extract colors from photos, send them to friends, and display them on physical LED devices in real-time.

## 🏗️ System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Mobile App    │◄──►│   Backend API    │◄──►│  ESP32 Device   │
│  (React Native)│    │  (NestJS + WS)   │    │   (Arduino)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
       │                        │                        │
       │                        │                        │
   ┌───▼────┐              ┌────▼────┐              ┌────▼────┐
   │ Camera │              │Database │              │ LED     │
   │Color   │              │(Postgres│              │ Strip   │
   │Extract │              │  + JWT) │              │Display  │
   └────────┘              └─────────┘              └─────────┘
```

## 🚀 Features

### **Mobile App**

- 📱 **Device Management**: Discover, claim, and configure ESP32 devices
- 📷 **Color Extraction**: Extract color palettes from photos using camera
- 👥 **Social Features**: Send color palettes to friends
- 🔧 **Setup Wizard**: Guided device setup with pairing codes
- 💬 **Real-time Messaging**: WebSocket-based color sharing

### **ESP32 Firmware**

- 📡 **WiFi Auto-Setup**: Captive portal for easy network configuration
- 🔐 **Self-Registration**: Automatic device registration with pairing codes
- 🌐 **WebSocket Client**: Real-time communication with backend
- 💾 **Persistent Storage**: Device state stored in EEPROM
- 🎨 **LED Control**: Display received color palettes on WS2812B LEDs

### **Backend API**

- 🔒 **JWT Authentication**: Secure user authentication
- 📊 **Device Management**: Registration, pairing, and status tracking
- 🔌 **WebSocket Server**: Real-time communication with ESP32 devices
- 👫 **Social Features**: Friend connections and color sharing
- 📂 **RESTful API**: Comprehensive API for all system operations

## 📁 Project Structure

```
PalPalette-2/
├── 📱 palpalette-app/          # React Native Mobile App
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── contexts/          # React contexts (Auth, Device)
│   │   ├── pages/             # Main app screens
│   │   ├── services/          # API communication services
│   │   └── hooks/             # Custom React hooks
│   └── docs/                  # Mobile app documentation
│
├── 🖥️  backend/                # NestJS Backend API
│   ├── src/
│   │   ├── modules/           # Feature modules
│   │   │   ├── auth/          # Authentication & JWT
│   │   │   ├── devices/       # Device management
│   │   │   ├── messages/      # Color sharing & WebSocket
│   │   │   └── users/         # User management & social
│   │   ├── migrations/        # Database migrations
│   │   └── seeds/             # Database seeding
│   └── docs/                  # Backend documentation
│
├── 🔧 controller/              # ESP32 Arduino Firmware
│   ├── src/                   # Modular firmware source
│   │   ├── main.ino          # Main application loop
│   │   ├── config.h          # Configuration constants
│   │   ├── WiFiManager.*     # WiFi & captive portal
│   │   ├── DeviceManager.*   # Device registration & pairing
│   │   └── WSClient.*        # WebSocket communication
│   └── docs/                  # Firmware documentation
│
└── 📚 docs/                   # System-wide documentation
    ├── ARCHITECTURE.md        # System architecture overview
    ├── DEPLOYMENT.md          # Deployment instructions
    ├── API.md                 # API documentation
    └── DEVELOPMENT.md         # Development setup guide
```

## 🔧 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Arduino IDE or PlatformIO
- ESP32 development board
- WS2812B LED strip (optional)

### 1. Backend Setup

```bash
cd backend
npm install
docker-compose up -d  # Start PostgreSQL
npm run migration:run
npm run seed:run
npm run start:dev
```

### 2. Mobile App Setup

```bash
cd palpalette-app
npm install
npx ionic serve  # Web development
# OR
npx ionic cap run android  # Android device
```

### 3. ESP32 Firmware Setup

```bash
cd controller
# Open in Arduino IDE
# Install required libraries: ArduinoJson, WiFi, WebSockets, Preferences
# Flash to ESP32 board
```

## 🌟 Key Workflows

### **Device Setup Flow**

1. ESP32 creates WiFi hotspot "PalPalette-Setup"
2. User connects and configures WiFi via web portal
3. ESP32 registers with backend and generates pairing code
4. User claims device in mobile app using pairing code
5. ESP32 receives claim notification and becomes operational

### **Color Sharing Flow**

1. User captures photo and extracts color palette
2. User selects friends and target devices
3. Backend delivers colors via WebSocket to ESP32 devices
4. ESP32 displays colors on LED strip
5. Recipients can replay or acknowledge colors

## 📖 Documentation

- [📋 System Architecture](docs/ARCHITECTURE.md)
- [🚀 Deployment Guide](docs/DEPLOYMENT.md)
- [📡 API Documentation](docs/API.md)
- [💻 Development Setup](docs/DEVELOPMENT.md)

### Component Documentation

- [📱 Mobile App](palpalette-app/docs/README.md)
- [🖥️ Backend API](backend/docs/README.md)
- [🔧 ESP32 Firmware](controller/docs/README.md)

## 🛠️ Development

### Technology Stack

- **Frontend**: React Native, Ionic, TypeScript
- **Backend**: NestJS, TypeORM, PostgreSQL, WebSocket
- **Firmware**: Arduino C++, ESP32, FreeRTOS
- **Infrastructure**: Docker, JWT Authentication

### Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- ESP32 community for excellent hardware support
- NestJS team for the robust backend framework
- Ionic team for cross-platform mobile development
- OpenAI for development assistance

---

**Made with ❤️ for the IoT community**
