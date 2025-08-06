# PalPalette System Architecture

## Overview

PalPalette is a distributed IoT system that enables users to share color palettes between mobile devices and physical LED displays through ESP32-powered devices. The system follows a client-server architecture with real-time WebSocket communication.

## System Components

### 1. Mobile Application (React Native/Ionic)

**Purpose**: User interface for color extraction, device management, and social features

**Key Responsibilities**:

- Camera integration for photo capture and color extraction
- Device discovery and claiming via pairing codes
- User authentication and profile management
- Friend connections and social features
- Real-time color sharing interface

**Technology Stack**:

- React Native with Ionic framework
- TypeScript for type safety
- Capacitor for native device access
- Camera API for color extraction
- HTTP client for API communication

### 2. Backend API (NestJS)

**Purpose**: Central server providing authentication, device management, and message routing

**Key Responsibilities**:

- JWT-based user authentication
- Device registration and pairing code generation
- WebSocket server for real-time ESP32 communication
- RESTful API for mobile app interactions
- Database management (PostgreSQL)
- Friend connections and social features

**Technology Stack**:

- NestJS framework with TypeScript
- TypeORM for database operations
- PostgreSQL for data persistence
- JWT for authentication
- Raw WebSocket server for ESP32 communication
- Docker for containerization

### 3. ESP32 Firmware (Arduino C++)

**Purpose**: Physical device that receives and displays color palettes on LED strips

**Key Responsibilities**:

- WiFi connectivity with captive portal setup
- Device self-registration with backend
- WebSocket client for real-time communication
- LED strip control (WS2812B)
- Persistent state management in EEPROM
- Color animation and display logic

**Technology Stack**:

- Arduino framework for ESP32
- WiFiManager for network configuration
- ArduinoJson for data serialization
- WebSockets library for real-time communication
- Preferences library for persistent storage

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Data Flow Diagram                        │
└─────────────────────────────────────────────────────────────────┘

1. DEVICE SETUP FLOW:
   ESP32 → WiFi Hotspot → User Config → Backend Registration → Pairing Code

2. DEVICE CLAIMING FLOW:
   Mobile App → Backend API → WebSocket Notification → ESP32 State Update

3. COLOR SHARING FLOW:
   Mobile Camera → Color Extract → Backend API → WebSocket → ESP32 Display

┌──────────────┐  HTTP/REST   ┌─────────────┐  WebSocket   ┌─────────────┐
│  Mobile App  │◄────────────►│   Backend   │◄────────────►│    ESP32    │
│              │              │     API     │              │   Device    │
│ - Color UI   │              │ - Auth      │              │ - LED Strip │
│ - Camera     │              │ - Device    │              │ - WiFi      │
│ - Social     │              │ - Messages  │              │ - Storage   │
└──────────────┘              └─────────────┘              └─────────────┘
                                     │
                                     ▼
                              ┌─────────────┐
                              │ PostgreSQL  │
                              │  Database   │
                              │ - Users     │
                              │ - Devices   │
                              │ - Messages  │
                              └─────────────┘
```

## Communication Protocols

### Mobile App ↔ Backend

- **Protocol**: HTTP/HTTPS REST API
- **Authentication**: JWT Bearer tokens
- **Content-Type**: JSON
- **Endpoints**:
  - `/auth/*` - Authentication endpoints
  - `/users/*` - User management
  - `/devices/*` - Device management
  - `/messages/*` - Color sharing

### Backend ↔ ESP32

- **Protocol**: Raw WebSocket (port 3001)
- **Format**: JSON messages
- **Message Types**:
  - `deviceClaimed` - Notify device of successful claiming
  - `colorPalette` - Send color data for display
  - `deviceStatus` - Request/update device status

## Database Schema

### Users Table

```sql
users {
  id: UUID (PK)
  email: VARCHAR(255) UNIQUE
  username: VARCHAR(50) UNIQUE
  passwordHash: VARCHAR(255)
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}
```

### Devices Table

```sql
devices {
  id: UUID (PK)
  macAddress: VARCHAR(17) UNIQUE
  name: VARCHAR(100)
  pairingCode: VARCHAR(6)
  isProvisioned: BOOLEAN
  isOnline: BOOLEAN
  ownerId: UUID (FK → users.id)
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}
```

### Messages Table

```sql
messages {
  id: UUID (PK)
  senderId: UUID (FK → users.id)
  receiverId: UUID (FK → users.id)
  deviceId: UUID (FK → devices.id)
  colorPalette: JSON
  sentAt: TIMESTAMP
  readAt: TIMESTAMP
}
```

## Security Architecture

### Authentication Flow

1. User registers/logs in via mobile app
2. Backend validates credentials and generates JWT
3. Mobile app stores JWT securely (keychain/keystore)
4. All API requests include JWT in Authorization header
5. Backend validates JWT for protected endpoints

### Device Security

1. ESP32 generates unique MAC address identifier
2. Backend creates cryptographically secure 6-digit pairing code
3. User claims device within time window (15 minutes)
4. WebSocket connection authenticated via device registration
5. Device state persisted securely in ESP32 EEPROM

### Network Security

- HTTPS for all mobile app communications
- WebSocket over secure connection (WSS in production)
- JWT tokens with expiration times
- Rate limiting on API endpoints
- Input validation and sanitization

## Scalability Considerations

### Horizontal Scaling

- Backend API can be load-balanced across multiple instances
- Database connection pooling for concurrent connections
- WebSocket server can be clustered with Redis pub/sub
- Mobile app supports offline mode with local storage

### Performance Optimization

- Database indexes on frequently queried fields
- Connection pooling for WebSocket management
- Efficient color data compression for transmission
- ESP32 memory management for color animations

## Error Handling & Reliability

### Mobile App

- Network connectivity detection
- Retry logic for failed API calls
- Offline storage for pending operations
- User-friendly error messages

### Backend

- Comprehensive error logging
- Database transaction rollbacks
- WebSocket connection recovery
- Health check endpoints

### ESP32

- WiFi reconnection logic
- WebSocket auto-reconnect
- Graceful error recovery
- Watchdog timer for stability

## Development & Deployment

### Local Development

- Docker Compose for backend services
- Ionic development server for mobile app
- Arduino IDE for ESP32 development
- PostgreSQL database with test data

### Production Deployment

- Containerized backend with Docker
- Mobile app distributed via app stores
- ESP32 firmware flashed to physical devices
- Cloud database with automated backups

## Future Enhancements

### Planned Features

- Multi-device color synchronization
- Cloud-based color palette library
- Advanced LED animation patterns
- Voice control integration
- Admin dashboard for system monitoring

### Technical Improvements

- GraphQL API for improved mobile performance
- Redis caching for frequent operations
- WebRTC for direct device communication
- Machine learning for color recommendation
