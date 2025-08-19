# PalPalette Lighting System API Documentation

## Overview

The PalPalette backend now supports comprehensive lighting system management for ESP32 devices. This allows users to configure, monitor, and control different types of lighting hardware through a unified API.

## Supported Lighting Systems

- **Nanoleaf**: Aurora, Canvas, and Shapes panels with authentication
- **WLED**: ESP8266/ESP32 devices running WLED firmware
- **WS2812**: Direct-connected LED strips via GPIO

## API Endpoints

### 1. Get Supported Lighting Systems

**GET** `/devices/lighting/supported-systems`

Returns available lighting systems and their default configurations.

**Response:**

```json
{
  "systems": ["nanoleaf", "wled", "ws2812"],
  "capabilities": {
    "nanoleaf": {
      "port": 16021,
      "transitionTime": 10,
      "enableExternalControl": true,
      "defaultBrightness": 100
    },
    "wled": {
      "port": 80,
      "segments": [{ "id": 0, "start": 0, "stop": 30 }],
      "defaultBrightness": 128
    },
    "ws2812": {
      "ledPin": 2,
      "ledCount": 30,
      "brightness": 255,
      "colorOrder": "GRB"
    }
  }
}
```

### 2. Get Default Configuration for System Type

**GET** `/devices/lighting/{systemType}/default-config`

**Parameters:**

- `systemType`: `nanoleaf`, `wled`, or `ws2812`

**Response:**

```json
{
  "port": 16021,
  "transitionTime": 10,
  "enableExternalControl": true,
  "defaultBrightness": 100
}
```

### 3. Configure Device Lighting System

**POST** `/devices/{deviceId}/lighting/configure`

**Headers:**

- `Authorization: Bearer {jwt_token}`

**Body:**

```json
{
  "lightingSystemType": "nanoleaf",
  "lightingHostAddress": "192.168.1.100",
  "lightingPort": 16021,
  "lightingAuthToken": "",
  "lightingCustomConfig": {
    "transitionTime": 10,
    "enableExternalControl": true
  }
}
```

**Response:**

```json
{
  "id": "device-uuid",
  "name": "Living Room Light",
  "lightingSystemType": "nanoleaf",
  "lightingHostAddress": "192.168.1.100",
  "lightingPort": 16021,
  "lightingSystemConfigured": true,
  "lightingStatus": "unknown",
  "lightingCustomConfig": {
    "transitionTime": 10,
    "enableExternalControl": true
  }
}
```

### 4. Update Lighting System Configuration

**PATCH** `/devices/{deviceId}/lighting`

**Headers:**

- `Authorization: Bearer {jwt_token}`

**Body:**

```json
{
  "lightingStatus": "working",
  "lightingSystemConfigured": true,
  "lightingAuthToken": "new-auth-token"
}
```

### 5. Get Lighting System Status

**GET** `/devices/{deviceId}/lighting/status`

**Headers:**

- `Authorization: Bearer {jwt_token}`

**Response:**

```json
{
  "lightingSystemType": "nanoleaf",
  "lightingHostAddress": "192.168.1.100",
  "lightingPort": 16021,
  "lightingSystemConfigured": true,
  "lightingStatus": "working",
  "lightingLastTestAt": "2025-01-28T10:30:00Z",
  "requiresAuthentication": true,
  "capabilities": {
    "maxPanels": 50,
    "animations": ["static", "fade", "wheel", "flow"],
    "brightness": true,
    "networkRequired": true,
    "authentication": true
  }
}
```

### 6. Test Lighting System

**POST** `/devices/{deviceId}/lighting/test`

**Headers:**

- `Authorization: Bearer {jwt_token}`

Requests the ESP32 device to test its lighting system connection.

**Response:**

```json
{
  "testRequested": true,
  "deviceConnected": true
}
```

### 7. Reset Lighting System

**DELETE** `/devices/{deviceId}/lighting`

**Headers:**

- `Authorization: Bearer {jwt_token}`

Resets lighting system to default WS2812 configuration.

**Response:**

```json
{
  "id": "device-uuid",
  "lightingSystemType": "ws2812",
  "lightingHostAddress": null,
  "lightingPort": null,
  "lightingSystemConfigured": false,
  "lightingStatus": "unknown",
  "lightingCustomConfig": {
    "ledPin": 2,
    "ledCount": 30,
    "brightness": 255,
    "colorOrder": "GRB"
  }
}
```

### 8. Get All User Devices' Lighting Systems

**GET** `/devices/my-devices/lighting-systems`

**Headers:**

- `Authorization: Bearer {jwt_token}`

**Response:**

```json
[
  {
    "deviceId": "device-uuid-1",
    "deviceName": "Living Room Light",
    "lightingSystemType": "nanoleaf",
    "lightingHostAddress": "192.168.1.100",
    "lightingSystemConfigured": true,
    "lightingStatus": "working",
    "requiresAuthentication": true,
    "capabilities": {...}
  },
  {
    "deviceId": "device-uuid-2",
    "deviceName": "Bedroom Strip",
    "lightingSystemType": "wled",
    "lightingHostAddress": "192.168.1.101",
    "lightingSystemConfigured": true,
    "lightingStatus": "working",
    "requiresAuthentication": false,
    "capabilities": {...}
  }
]
```

## WebSocket Events (ESP32 Communication)

### Device to Server Events

#### 1. Lighting System Status Update

```json
{
  "event": "lightingSystemStatus",
  "data": {
    "deviceId": "device-uuid",
    "status": "working",
    "configured": true,
    "systemType": "nanoleaf",
    "customConfig": {...}
  }
}
```

#### 2. Lighting System Test Result

```json
{
  "event": "lightingSystemTest",
  "data": {
    "deviceId": "device-uuid",
    "success": true,
    "errorMessage": null,
    "systemType": "nanoleaf",
    "timestamp": 1674567890000
  }
}
```

### Server to Device Events

#### 1. Lighting System Configuration

```json
{
  "event": "lightingSystemConfig",
  "data": {
    "systemType": "nanoleaf",
    "hostAddress": "192.168.1.100",
    "port": 16021,
    "authToken": "auth-token-here",
    "customConfig": {
      "transitionTime": 10,
      "enableExternalControl": true
    }
  }
}
```

#### 2. Test Lighting System Request

```json
{
  "event": "testLightingSystem",
  "data": {
    "deviceId": "device-uuid",
    "timestamp": 1674567890000
  }
}
```

#### 3. Color Palette Display (Enhanced)

```json
{
  "event": "colorPalette",
  "messageId": "msg-uuid",
  "senderId": "user-uuid",
  "senderName": "Alice",
  "colors": [{ "hex": "#FF5733" }, { "hex": "#33FF57" }, { "hex": "#3357FF" }],
  "timestamp": 1674567890000
}
```

## Lighting System Types

### Nanoleaf Configuration

```json
{
  "lightingSystemType": "nanoleaf",
  "lightingHostAddress": "192.168.1.100",
  "lightingPort": 16021,
  "lightingAuthToken": "", // Generated during authentication
  "lightingCustomConfig": {
    "transitionTime": 10,
    "enableExternalControl": true,
    "defaultAnimation": "fade",
    "defaultBrightness": 100
  }
}
```

**Authentication Flow:**

1. Configure with empty auth token
2. ESP32 initiates authentication with Nanoleaf
3. User presses button on Nanoleaf controller
4. ESP32 receives auth token and reports back via WebSocket
5. Backend updates device with auth token

### WLED Configuration

```json
{
  "lightingSystemType": "wled",
  "lightingHostAddress": "192.168.1.101",
  "lightingPort": 80,
  "lightingCustomConfig": {
    "segments": [{ "id": 0, "start": 0, "stop": 30 }],
    "defaultBrightness": 128,
    "effects": ["Solid", "Rainbow", "Fire"]
  }
}
```

### WS2812 Configuration

```json
{
  "lightingSystemType": "ws2812",
  "lightingCustomConfig": {
    "ledPin": 2,
    "ledCount": 60,
    "brightness": 255,
    "colorOrder": "GRB"
  }
}
```

## Error Handling

### Common Error Responses

#### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Device not found"
}
```

#### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Host address is required for nanoleaf",
  "error": "Bad Request"
}
```

#### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

## Database Schema

### Device Entity Updates

```sql
ALTER TABLE device ADD COLUMN lighting_system_type VARCHAR DEFAULT 'ws2812';
ALTER TABLE device ADD COLUMN lighting_host_address VARCHAR;
ALTER TABLE device ADD COLUMN lighting_port INTEGER;
ALTER TABLE device ADD COLUMN lighting_auth_token VARCHAR;
ALTER TABLE device ADD COLUMN lighting_custom_config JSON;
ALTER TABLE device ADD COLUMN lighting_system_configured BOOLEAN DEFAULT false;
ALTER TABLE device ADD COLUMN lighting_last_test_at TIMESTAMP;
ALTER TABLE device ADD COLUMN lighting_status VARCHAR DEFAULT 'unknown';
```

### Lighting Status Values

- `unknown`: Status not yet determined
- `working`: System functioning correctly
- `error`: System has errors/not responding
- `authentication_required`: Needs auth token (Nanoleaf)

## Integration Guide

### Frontend Integration

1. **Device Setup Flow:**

   ```typescript
   // Get supported systems
   const systems = await api.get("/devices/lighting/supported-systems");

   // Configure device
   await api.post(`/devices/${deviceId}/lighting/configure`, {
     lightingSystemType: "nanoleaf",
     lightingHostAddress: "192.168.1.100",
     lightingPort: 16021,
   });

   // Test connection
   await api.post(`/devices/${deviceId}/lighting/test`);
   ```

2. **Status Monitoring:**

   ```typescript
   // Get current status
   const status = await api.get(`/devices/${deviceId}/lighting/status`);

   // Get all user devices' lighting systems
   const allSystems = await api.get("/devices/my-devices/lighting-systems");
   ```

### ESP32 Integration

1. **Status Reporting:**

   ```cpp
   // Report lighting system status
   webSocket.send(JSON.stringify({
     event: "lightingSystemStatus",
     data: {
       deviceId: deviceId,
       status: lightManager.getStatus(),
       configured: lightManager.isConfigured(),
       systemType: lightManager.getCurrentSystemType(),
       customConfig: lightManager.getCustomConfig()
     }
   }));
   ```

2. **Configuration Handling:**
   ```cpp
   // Handle configuration from server
   if (message.event == "lightingSystemConfig") {
     lightManager.configure(
       message.data.systemType,
       message.data.hostAddress,
       message.data.port,
       message.data.authToken,
       message.data.customConfig
     );
   }
   ```

## Testing

### Unit Tests

- Lighting system configuration validation
- WebSocket message handling
- Database operations
- API endpoint authorization

### Integration Tests

- Full lighting system setup flow
- ESP32 communication
- Error handling scenarios
- Multi-user device management

### Manual Testing Checklist

- [ ] Configure Nanoleaf system with authentication
- [ ] Configure WLED system without authentication
- [ ] Configure WS2812 system with custom parameters
- [ ] Test lighting system connectivity
- [ ] Verify WebSocket communication
- [ ] Test error scenarios (invalid configs, unauthorized access)
- [ ] Verify color palette display on different systems

## Security Considerations

1. **Authentication Tokens:** Nanoleaf auth tokens are stored securely and only transmitted over HTTPS/WSS
2. **Device Authorization:** Users can only modify lighting systems for their own devices
3. **Input Validation:** All configuration parameters are validated before storage
4. **Network Security:** WebSocket connections should use WSS in production
5. **Rate Limiting:** Consider rate limiting lighting system test requests

## Performance Considerations

1. **WebSocket Efficiency:** Lighting configurations are sent only when devices connect or configuration changes
2. **Database Indexing:** Consider indexing on device.lightingSystemType for queries
3. **Caching:** Device capabilities and default configurations could be cached
4. **Batch Operations:** Support bulk lighting system configuration for multiple devices
