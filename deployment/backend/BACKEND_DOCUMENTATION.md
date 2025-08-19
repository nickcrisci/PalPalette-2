# PalPalette Backend - NestJS Module Documentation

## Overview

This backend is built with NestJS, a progressive Node.js framework for building efficient and scalable server-side applications. The architecture follows a modular approach where each feature is organized into its own module.

## Project Structure

```
backend/src/
├── app.module.ts           # Root application module
├── main.ts                 # Application entry point
├── data-source.ts          # TypeORM database configuration
├── common/
│   └── decorators/
│       └── public.decorator.ts  # Custom decorator for public routes
├── modules/
│   ├── auth/               # Authentication & authorization
│   ├── users/              # User management
│   ├── devices/            # Device management
│   ├── messages/           # Message & WebSocket handling
│   └── admin/              # Admin functionality
├── migrations/             # Database schema migrations
└── seeds/                  # Database seed data
```

---

## Core Concepts in NestJS

### Modules

- **Purpose**: Organize related components (controllers, services, entities)
- **Decorator**: `@Module({})`
- **Structure**: Contains imports, providers, controllers, exports

### Controllers

- **Purpose**: Handle HTTP requests and define API endpoints
- **Decorator**: `@Controller('route-prefix')`
- **Methods**: Use HTTP method decorators (`@Get()`, `@Post()`, etc.)

### Services

- **Purpose**: Contain business logic and data access
- **Decorator**: `@Injectable()`
- **Usage**: Injected into controllers and other services

### Entities

- **Purpose**: Define database table structure using TypeORM
- **Decorator**: `@Entity()`
- **Properties**: Use column decorators (`@Column()`, `@PrimaryGeneratedColumn()`)

### DTOs (Data Transfer Objects)

- **Purpose**: Define structure for request/response data
- **Usage**: Validate and transform incoming data

---

## Module Breakdown

## 1. Auth Module (`/modules/auth/`)

### Purpose

Handles user and device authentication using JWT tokens.

### Components

#### `auth.module.ts`

```typescript
@Module({
  imports: [
    UsersModule,          // Import to access UsersService
    JwtModule.registerAsync({...})  // JWT configuration
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController]
})
```

#### `auth.controller.ts`

- **Route**: `/auth`
- **Endpoints**:
  - `POST /auth/login` - Authenticate user/device and return JWT token

#### `auth.service.ts`

- **Dependencies**: `UsersService`, `JwtService`
- **Methods**:
  - `validateUser()` - Verify credentials
  - `login()` - Generate JWT token

#### `jwt-auth.guard.ts`

- **Purpose**: Protect routes that require authentication
- **Usage**: Add `@UseGuards(JwtAuthGuard)` to controllers/methods

#### `jwt.strategy.ts`

- **Purpose**: Define how JWT tokens are validated
- **Integration**: Works with Passport.js

---

## 2. Users Module (`/modules/users/`)

### Purpose

Manages user accounts and profiles.

### Components

#### `users.module.ts`

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([User])],  // Register User entity
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService]  // Allow other modules to use UsersService
})
```

#### `users.controller.ts`

- **Route**: `/users`
- **Endpoints**:
  - `POST /users/register` - Create new user account
  - `GET /users/profile` - Get current user profile (protected)

#### `users.service.ts`

- **Dependencies**: `Repository<User>` (TypeORM)
- **Methods**:
  - `create()` - Create new user
  - `findByEmail()` - Find user by email
  - `findById()` - Find user by ID

#### `entities/user.entity.ts`

```typescript
@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  displayName: string;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### DTOs

- `register-user.dto.ts` - Validation for user registration
- `login-user.dto.ts` - Validation for user login

---

## 3. Devices Module (`/modules/devices/`)

### Purpose

Manages edge devices (ESP32/ESP8266) that connect to the system.

### Components

#### `devices.module.ts`

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([Device]),
    JwtModule.registerAsync({...})  // For generating device tokens
  ],
  providers: [DevicesService],
  controllers: [DevicesController],
  exports: [DevicesService]
})
```

#### `devices.controller.ts`

- **Route**: `/devices`
- **Endpoints**:
  - `POST /devices` - Register new device (public, returns JWT token)
  - `GET /devices` - List all devices (protected)
  - `GET /devices/:id` - Get specific device (protected)
  - `PATCH /devices/:id` - Update device (protected)
  - `DELETE /devices/:id` - Remove device (protected)

#### `devices.service.ts`

- **Dependencies**: `Repository<Device>`, `JwtService`
- **Methods**:
  - `create()` - Register device and generate JWT token
  - `findAll()` - Get all devices
  - `findOne()` - Get device by ID
  - `update()` - Update device information
  - `remove()` - Delete device

#### `entities/device.entity.ts`

```typescript
@Entity()
export class Device {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string; // Human-readable device name

  @Column()
  type: string; // Device type (esp32, esp8266, etc.)

  @Column({ default: "offline" })
  status: string; // online, offline, error

  @Column({ nullable: true })
  lastSeenAt: Date;

  // Relations
  @ManyToOne(() => User, { nullable: true })
  user: User; // Which user owns this device

  @OneToMany(() => Message, (message) => message.device)
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;
}
```

#### DTOs

- `create-device.dto.ts` - Validation for device registration
- `update-device.dto.ts` - Validation for device updates

---

## 4. Messages Module (`/modules/messages/`)

### Purpose

Handles color message creation, storage, and real-time delivery via WebSocket.

### Components

#### `messages.module.ts`

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([Message, User, Device])],
  providers: [MessagesService, MessagesGateway],
  controllers: [MessagesController]
})
```

#### `messages.controller.ts`

- **Route**: `/messages`
- **Endpoints**:
  - `POST /messages` - Send color message (protected)
  - `GET /messages` - List messages with optional device filter (protected)

#### `messages.service.ts`

- **Dependencies**: `Repository<Message>`, `Repository<User>`, `Repository<Device>`, `MessagesGateway`
- **Methods**:
  - `create()` - Create message and trigger WebSocket delivery
  - `findAll()` - Get all messages
  - `findById()` - Get message by ID
  - `findByRecipient()` - Get messages for specific recipient

#### `messages.gateway.ts` (WebSocket)

- **Purpose**: Real-time communication with edge devices
- **URL**: `ws://localhost:3000` (Socket.IO)
- **Authentication**: JWT token via `auth` payload
- **Events**:
  - `color-message` - Sent to devices when new color is available
  - `message` - General message broadcasting

#### `entities/message.entity.ts`

```typescript
@Entity()
export class Message {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("simple-array")
  colors: string[]; // Array of hex color codes

  // Relations
  @ManyToOne(() => User)
  sender: User;

  @ManyToOne(() => User)
  recipient: User;

  @ManyToOne(() => Device)
  device: Device; // Target device for color display

  @CreateDateColumn()
  createdAt: Date;
}
```

#### DTOs

- `create-message.dto.ts` - Validation for message creation

---

## 5. Admin Module (`/modules/admin/`)

### Purpose

Provides administrative functionality (currently empty, ready for expansion).

### Components

#### `admin.module.ts`

```typescript
@Module({})  // Currently empty
```

**Future features could include**:

- Device monitoring dashboard
- User management
- System logs
- Analytics

---

## Common Decorators and Guards

### `@Public()` Decorator (`/common/decorators/public.decorator.ts`)

- **Purpose**: Mark routes as public (bypass JWT authentication)
- **Usage**: `@Public()` above controller methods
- **Example**: Device registration endpoint

### JWT Authentication Flow

1. Client sends credentials to `/auth/login`
2. Server validates and returns JWT token
3. Client includes token in `Authorization: Bearer <token>` header
4. `JwtAuthGuard` validates token on protected routes

---

## Database Relationships

```
User (1) ←→ (many) Device
User (1) ←→ (many) Message (as sender)
User (1) ←→ (many) Message (as recipient)
Device (1) ←→ (many) Message
```

---

## Environment Configuration

### Required Environment Variables (`.env`)

```bash
# Database
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=palpalette

# JWT
JWT_SECRET=secret_password
JWT_EXPIRES_IN=3600s
```

---

## API Authentication

### For Users

1. Register: `POST /users/register`
2. Login: `POST /auth/login`
3. Use returned JWT token in headers

### For Devices

1. Register: `POST /devices` (public)
2. Receive JWT token in response
3. Use token for WebSocket connection and API calls

---

## WebSocket Integration

### Connection (JavaScript example)

```javascript
const io = require("socket.io-client");
const socket = io("ws://localhost:3000", {
  auth: { token: "YOUR_JWT_TOKEN" },
});

socket.on("color-message", (data) => {
  // Handle color data: { deviceId, color, timestamp }
});
```

### Connection (ESP32/Arduino)

```cpp
#include <ArduinoWebsockets.h>
WebsocketsClient client;
client.addHeader("Authorization", "Bearer YOUR_JWT_TOKEN");
client.connect("ws://your-host:3000");
```

---

## Testing

### Running Tests

```bash
npm test                    # All tests
npm test -- --watch        # Watch mode
npm test -- messages       # Specific module
```

### Test Structure

- Unit tests for services (`*.spec.ts`)
- Integration tests for controllers
- Mocks for external dependencies (repositories, gateways)

---

## Development Workflow

### Adding New Features

1. **Create Module**: `nest g module feature-name`
2. **Add Controller**: `nest g controller feature-name`
3. **Add Service**: `nest g service feature-name`
4. **Define Entity**: Create in `entities/` folder
5. **Create DTOs**: Define request/response structures
6. **Update Module**: Add imports, providers, exports
7. **Write Tests**: Add unit and integration tests

### Common Commands

```bash
npm run start:dev          # Development server
npm run build              # Production build
npm run test              # Run tests
npm run migration:run     # Apply database migrations
npm run migration:generate # Generate new migration
```

---

## Troubleshooting

### Common Issues

#### Circular Dependencies

- **Problem**: Service A depends on Service B, which depends on Service A
- **Solution**: Use `forwardRef()` in both services

```typescript
@Inject(forwardRef(() => OtherService))
private otherService: OtherService
```

#### Missing Dependencies

- **Problem**: `Nest can't resolve dependencies`
- **Solution**: Ensure service is in module's `providers` array and imported modules export needed services

#### Database Connection

- **Problem**: Can't connect to PostgreSQL
- **Solution**: Check environment variables and ensure database is running

---

## Next Steps for Development

1. **Edge Device Setup Flow**: QR code + WiFi hotspot setup process ✅
2. **Mobile App Integration**: Create endpoints for mobile app authentication and color sending
3. **Friend System**: Add user relationships and friend management
4. **Device Groups**: Allow multiple devices per user
5. **Push Notifications**: Implement real-time notifications
6. **Analytics**: Add logging and monitoring
7. **Security**: Implement rate limiting, input sanitization
8. **Testing**: Add end-to-end tests for complete workflows

---

## Edge Device Setup Flow

### Overview

Users receive edge devices with QR codes and set them up through the PalPalette mobile app using a hybrid QR + WiFi hotspot approach.

### Setup Process

1. **Device Ships Pre-configured**: Each device has unique device ID and setup secret
2. **QR Code Scanning**: User scans QR code with PalPalette app
3. **Device Hotspot**: Device creates temporary WiFi hotspot for configuration
4. **App Configuration**: App connects to device and sends WiFi credentials + user account info
5. **Device Online**: Device connects to user's WiFi and registers with backend
6. **Ready to Use**: Device appears in user's device list and can receive colors

### Backend Endpoints for Setup

- `POST /devices/claim` - Associate device with user account
- `GET /devices/setup-status/:deviceId` - Check setup progress
- `POST /devices/setup-complete` - Mark device setup as complete
- `GET /users/my-devices` - List user's devices

### Security Features

- Time-limited setup tokens (30 minutes)
- Setup secrets prevent unauthorized claiming
- Ownership verification and transfer support

This documentation should give you a solid foundation to continue developing the PalPalette backend without assistance. Each module is designed to be independent and follows NestJS best practices.
