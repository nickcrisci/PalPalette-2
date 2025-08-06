# PalPalette Backend Integration Guide for Edge Device

## Backend State (July 2025)

---

### Overview

This guide describes how to integrate an edge device with the PalPalette backend for real-time color delivery and device management. The backend is built with NestJS, TypeORM, PostgreSQL, JWT authentication, and Socket.IO for WebSocket communication.

---

### Backend API Summary

- **REST Endpoints:** Device registration, authentication, message delivery, user management.
- **WebSocket Gateway:** Real-time color message delivery to devices.
- **Authentication:** JWT-based, with public/private route handling.

---

### Device Registration & Authentication

1. **Register Device (REST):**
   - `POST /devices`
   - Body: `{ name: string, type: string }`
   - Response: Device info + JWT token
2. **Authenticate Device (REST):**
   - `POST /auth/login`
   - Body: `{ deviceId: string, secret: string }`
   - Response: JWT token
3. **Token Usage:**
   - Include JWT in `Authorization: Bearer <token>` header for all requests and WebSocket connection.

---

### WebSocket Integration

1. **Connect to Gateway:**
   - URL: `ws://<backend-host>:<port>/ws`
   - Auth: Send JWT token as part of connection (Socket.IO `auth` payload or header).
2. **Receive Color Messages:**
   - Event: `color-message`
   - Payload: `{ deviceId: string, color: string, timestamp: string }`
3. **Example (Socket.IO JS client):**
   ```js
   const socket = io("ws://<backend-host>:<port>/ws", {
     auth: { token: "<JWT_TOKEN>" },
   });
   socket.on("color-message", (data) => {
     // Handle color delivery
   });
   ```

---

### REST API Endpoints

#### Device

- `POST /devices` — Register new device
- `GET /devices/:id` — Get device info
- `PUT /devices/:id` — Update device
- `DELETE /devices/:id` — Remove device

#### Message

- `POST /messages` — Send color message to device
- `GET /messages?deviceId=...` — List messages for device

#### Auth

- `POST /auth/login` — Authenticate device/user

#### User

- `POST /users` — Register user
- `GET /users/profile` — Get user profile

---

### Example Device Integration Flow

1. Register device via REST API, store JWT token.
2. Connect to WebSocket gateway using JWT.
3. Listen for `color-message` events and update device color accordingly.
4. Optionally, send status or telemetry via REST endpoints.

---

### Security Notes

- Always use HTTPS/WSS in production.
- Store JWT tokens securely on device.
- Validate all incoming messages.

---

### Troubleshooting

- **401 Unauthorized:** Check JWT token validity and header.
- **WebSocket disconnects:** Ensure token is sent, check backend logs.
- **No color messages:** Confirm device registration and backend message creation.

---

### Contact & Support

For backend API changes or integration support, contact the PalPalette backend team.
