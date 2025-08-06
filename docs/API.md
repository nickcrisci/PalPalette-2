# PalPalette API Documentation

## Overview

The PalPalette backend API provides RESTful endpoints for mobile app integration and WebSocket connections for ESP32 devices. All API endpoints require authentication except for registration and login.

## Base URLs

- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com`
- **WebSocket**: `ws://localhost:3001` (dev) / `wss://your-domain.com:3001` (prod)

## Authentication

### JWT Token Format

```
Authorization: Bearer <jwt-token>
```

### Token Structure

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "iat": 1640000000,
  "exp": 1640604800
}
```

## API Endpoints

### Authentication Endpoints

#### POST /auth/register

Register a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "securePassword123"
}
```

**Response (201):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "username": "username",
    "createdAt": "2023-12-01T10:00:00.000Z"
  }
}
```

**Error Responses:**

- `400 Bad Request`: Validation errors
- `409 Conflict`: Email or username already exists

---

#### POST /auth/login

Authenticate user and receive JWT token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "username": "username"
  }
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid credentials

---

### Device Management Endpoints

#### GET /devices

Get all devices owned by the authenticated user.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Living Room Display",
    "macAddress": "AA:BB:CC:DD:EE:FF",
    "pairingCode": "123456",
    "isProvisioned": true,
    "isOnline": true,
    "ownerId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-01T11:30:00.000Z"
  }
]
```

---

#### POST /devices/register

Register a new ESP32 device (called by ESP32 firmware).

**Request Body:**

```json
{
  "macAddress": "AA:BB:CC:DD:EE:FF",
  "name": "ESP32 Device"
}
```

**Response (201):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "macAddress": "AA:BB:CC:DD:EE:FF",
  "name": "ESP32 Device",
  "pairingCode": "123456",
  "isProvisioned": false,
  "isOnline": true
}
```

**Error Responses:**

- `400 Bad Request`: Invalid MAC address format
- `409 Conflict`: Device already registered

---

#### POST /devices/claim

Claim a device using its pairing code.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "pairingCode": "123456"
}
```

**Response (200):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Living Room Display",
  "macAddress": "AA:BB:CC:DD:EE:FF",
  "isProvisioned": true,
  "isOnline": true,
  "ownerId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Error Responses:**

- `404 Not Found`: Invalid pairing code
- `409 Conflict`: Device already claimed

---

#### PUT /devices/:id

Update device information.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "name": "New Device Name"
}
```

**Response (200):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "New Device Name",
  "macAddress": "AA:BB:CC:DD:EE:FF",
  "isProvisioned": true,
  "isOnline": true
}
```

---

#### DELETE /devices/:id/reset

Reset device to unclaimed state.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "message": "Device reset successfully",
  "device": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "pairingCode": "789012",
    "isProvisioned": false,
    "ownerId": null
  }
}
```

---

### User Management Endpoints

#### GET /users/profile

Get current user profile.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "username": "username",
  "createdAt": "2023-12-01T10:00:00.000Z"
}
```

---

#### PUT /users/profile

Update user profile.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "username": "newUsername"
}
```

**Response (200):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "username": "newUsername",
  "updatedAt": "2023-12-01T12:00:00.000Z"
}
```

---

#### GET /users/search

Search for users by username or email.

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `q`: Search query string

**Example:** `GET /users/search?q=john`

**Response (200):**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "username": "johndoe",
    "email": "john@example.com"
  }
]
```

---

### Message/Color Sharing Endpoints

#### POST /messages

Send a color palette to friends and their devices.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "receiverIds": ["550e8400-e29b-41d4-a716-446655440002"],
  "deviceIds": ["550e8400-e29b-41d4-a716-446655440003"],
  "colorPalette": {
    "colors": [
      { "r": 255, "g": 0, "b": 0 },
      { "r": 0, "g": 255, "b": 0 },
      { "r": 0, "g": 0, "b": 255 }
    ],
    "name": "Sunset Colors",
    "duration": 5000
  }
}
```

**Response (201):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440004",
  "senderId": "550e8400-e29b-41d4-a716-446655440000",
  "colorPalette": {
    "colors": [
      { "r": 255, "g": 0, "b": 0 },
      { "r": 0, "g": 255, "b": 0 },
      { "r": 0, "g": 0, "b": 255 }
    ],
    "name": "Sunset Colors",
    "duration": 5000
  },
  "sentAt": "2023-12-01T12:30:00.000Z",
  "deliveredDevices": ["550e8400-e29b-41d4-a716-446655440003"]
}
```

---

#### GET /messages

Get messages for the authenticated user.

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `type`: Filter by 'sent' or 'received'

**Example:** `GET /messages?type=received&page=1&limit=10`

**Response (200):**

```json
{
  "messages": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "senderId": "550e8400-e29b-41d4-a716-446655440002",
      "sender": {
        "username": "johndoe"
      },
      "colorPalette": {
        "colors": [
          { "r": 255, "g": 0, "b": 0 },
          { "r": 0, "g": 255, "b": 0 }
        ],
        "name": "Ocean Blues"
      },
      "sentAt": "2023-12-01T12:30:00.000Z",
      "readAt": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

---

#### PUT /messages/:id/read

Mark a message as read.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440004",
  "readAt": "2023-12-01T13:00:00.000Z"
}
```

---

## WebSocket API (ESP32 Communication)

### Connection

```
ws://localhost:3001/ws
```

### Message Format

All WebSocket messages use JSON format:

```json
{
  "type": "messageType",
  "data": { ... },
  "timestamp": "2023-12-01T12:30:00.000Z"
}
```

### ESP32 → Backend Messages

#### Device Registration

```json
{
  "type": "register",
  "data": {
    "macAddress": "AA:BB:CC:DD:EE:FF",
    "name": "ESP32 Device"
  }
}
```

#### Status Update

```json
{
  "type": "status",
  "data": {
    "macAddress": "AA:BB:CC:DD:EE:FF",
    "isOnline": true,
    "batteryLevel": 85,
    "wifiSignal": -45
  }
}
```

### Backend → ESP32 Messages

#### Device Claimed Notification

```json
{
  "type": "deviceClaimed",
  "data": {
    "deviceId": "550e8400-e29b-41d4-a716-446655440001",
    "ownerId": "550e8400-e29b-41d4-a716-446655440000",
    "ownerName": "username"
  }
}
```

#### Color Palette Display

```json
{
  "type": "colorPalette",
  "data": {
    "messageId": "550e8400-e29b-41d4-a716-446655440004",
    "colors": [
      { "r": 255, "g": 0, "b": 0 },
      { "r": 0, "g": 255, "b": 0 },
      { "r": 0, "g": 0, "b": 255 }
    ],
    "name": "Sunset Colors",
    "duration": 5000,
    "animation": "fade"
  }
}
```

#### Device Reset

```json
{
  "type": "resetDevice",
  "data": {
    "deviceId": "550e8400-e29b-41d4-a716-446655440001"
  }
}
```

## Error Handling

### HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (already exists)
- `422 Unprocessable Entity`: Validation errors
- `500 Internal Server Error`: Server error

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email must be a valid email address"
      }
    ]
  },
  "timestamp": "2023-12-01T12:30:00.000Z",
  "path": "/auth/register"
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Request validation failed
- `AUTHENTICATION_ERROR`: Invalid or missing authentication
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `RESOURCE_NOT_FOUND`: Requested resource not found
- `RESOURCE_CONFLICT`: Resource already exists
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server-side error

## Rate Limiting

### Limits

- Authentication endpoints: 5 requests per minute per IP
- API endpoints: 100 requests per 15 minutes per authenticated user
- WebSocket connections: 1 connection per device MAC address

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

## Pagination

### Query Parameters

- `page`: Page number (1-based, default: 1)
- `limit`: Items per page (max: 100, default: 20)
- `sort`: Sort field and direction (e.g., `createdAt:desc`)

### Response Format

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Data Validation

### Common Validation Rules

- **Email**: Valid email format, max 255 characters
- **Username**: 3-50 characters, alphanumeric + underscore
- **Password**: Minimum 8 characters, at least one number
- **MAC Address**: Valid MAC format (XX:XX:XX:XX:XX:XX)
- **Pairing Code**: 6 digits exactly
- **Color Values**: RGB values 0-255
- **UUID**: Valid UUID v4 format

### Color Palette Format

```json
{
  "colors": [
    { "r": 255, "g": 128, "b": 0 },
    { "r": 0, "g": 255, "b": 128 }
  ],
  "name": "Color Name",
  "duration": 5000,
  "animation": "fade"
}
```

**Validation Rules:**

- `colors`: Array of 1-10 RGB color objects
- `name`: Optional string, max 100 characters
- `duration`: Optional number, 1000-30000 ms
- `animation`: Optional enum: 'fade', 'pulse', 'rainbow'

## Testing

### Test User Accounts

Development environment includes test accounts:

```json
{
  "email": "test@palpalette.com",
  "password": "password123",
  "username": "testuser"
}
```

### Example API Calls

#### Using curl

```bash
# Register user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"password123"}'

# Login
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | jq -r '.access_token')

# Get devices
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/devices
```

#### Using JavaScript/Fetch

```javascript
// Login and get token
const response = await fetch("http://localhost:3000/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "test@example.com",
    password: "password123",
  }),
});

const { access_token } = await response.json();

// Make authenticated request
const devicesResponse = await fetch("http://localhost:3000/devices", {
  headers: {
    Authorization: `Bearer ${access_token}`,
  },
});

const devices = await devicesResponse.json();
```

## SDK Examples

### Mobile App Integration

```typescript
// services/api.service.ts
export class ApiService {
  private baseUrl = "http://localhost:3000";
  private token: string | null = null;

  async login(email: string, password: string) {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    this.token = data.access_token;
    return data;
  }

  async getDevices() {
    const response = await fetch(`${this.baseUrl}/devices`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return response.json();
  }

  async claimDevice(pairingCode: string) {
    const response = await fetch(`${this.baseUrl}/devices/claim`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pairingCode }),
    });
    return response.json();
  }
}
```

### ESP32 Integration

```cpp
// WebSocket message handling
void handleWebSocketMessage(String payload) {
  DynamicJsonDocument doc(1024);
  deserializeJson(doc, payload);

  String type = doc["type"];

  if (type == "deviceClaimed") {
    String ownerId = doc["data"]["ownerId"];
    String ownerName = doc["data"]["ownerName"];

    // Save claimed state
    preferences.putString("ownerId", ownerId);
    preferences.putString("ownerName", ownerName);
    preferences.putBool("isProvisioned", true);

    Serial.println("Device claimed by: " + ownerName);

  } else if (type == "colorPalette") {
    JsonArray colors = doc["data"]["colors"];

    // Display colors on LED strip
    for (int i = 0; i < colors.size(); i++) {
      uint8_t r = colors[i]["r"];
      uint8_t g = colors[i]["g"];
      uint8_t b = colors[i]["b"];

      strip.setPixelColor(i, strip.Color(r, g, b));
    }
    strip.show();
  }
}
```
