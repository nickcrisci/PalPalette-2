# PalPalette Mobile App Documentation

## Overview

The PalPalette mobile app is a cross-platform React Native application built with Ionic framework. It provides users with camera-based color extraction, device management, and social color sharing features.

## Architecture

### Technology Stack

- **Framework**: Ionic 7 with React 18
- **Language**: TypeScript
- **Navigation**: React Router
- **State Management**: React Context API
- **Native Features**: Capacitor 5
- **UI Components**: Ionic React components
- **Camera**: Capacitor Camera plugin
- **HTTP**: Axios for API communication

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── camera/         # Camera and color extraction
│   ├── devices/        # Device management components
│   └── ui/             # Common UI elements
├── contexts/           # React Context providers
│   ├── AuthContext.tsx # Authentication state
│   └── DeviceContext.tsx # Device management state
├── hooks/              # Custom React hooks
│   ├── useAuth.ts      # Authentication hook
│   └── useCamera.ts    # Camera functionality hook
├── pages/              # Main application screens
│   ├── auth/           # Login/Register pages
│   ├── devices/        # Device management pages
│   ├── camera/         # Color extraction pages
│   └── messages/       # Message history pages
├── services/           # API and external service integrations
│   ├── api.service.ts  # HTTP API client
│   ├── devices.service.ts # Device API calls
│   └── auth.service.ts # Authentication API calls
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── environments/       # Environment configuration
```

## Core Features

### 1. Authentication System

#### Login/Register Flow

- Email and password authentication
- JWT token storage in secure storage
- Automatic token refresh
- Biometric authentication (planned)

**Implementation**: `src/contexts/AuthContext.tsx`

```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}
```

### 2. Device Management

#### Device Discovery and Claiming

- View available devices with pairing codes
- Claim devices using 6-digit pairing codes
- Device status monitoring (online/offline)
- Device settings and configuration

**Implementation**: `src/contexts/DeviceContext.tsx`

```typescript
interface DeviceContextType {
  devices: Device[];
  loading: boolean;
  refreshDevices: () => Promise<void>;
  claimDeviceByCode: (pairingCode: string) => Promise<void>;
  resetDevice: (deviceId: string) => Promise<void>;
  updateDevice: (deviceId: string, data: UpdateDeviceData) => Promise<void>;
}
```

#### Key Components

- `PairingCodeModal` - Device claiming interface
- `SetupWizardModal` - Guided device setup
- `DeviceSettingsModal` - Device configuration
- `DeviceCard` - Device display component

### 3. Camera and Color Extraction

#### Color Palette Generation

- Camera integration for photo capture
- Real-time color extraction from images
- Dominant color detection algorithms
- Color palette preview and editing

**Implementation**: `src/hooks/useCamera.ts`

```typescript
interface CameraHook {
  capturePhoto: () => Promise<string>;
  extractColors: (imageUrl: string) => Promise<Color[]>;
  isCapturing: boolean;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
}
```

#### Color Extraction Algorithm

```typescript
interface Color {
  r: number;
  g: number;
  b: number;
  hex: string;
  frequency: number;
}

const extractDominantColors = (
  imageData: ImageData,
  count: number = 5
): Color[] => {
  // K-means clustering algorithm for color extraction
  // Returns dominant colors with RGB values and frequency
};
```

### 4. Social Features

#### Color Sharing

- Send color palettes to friends
- Select target devices for display
- Message history and status tracking
- Real-time delivery notifications

**Components**:

- `ColorSharingModal` - Send colors interface
- `FriendSelector` - Choose recipients
- `DeviceSelector` - Choose target devices
- `MessageHistory` - View sent/received colors

## User Interface

### Design System

- **Theme**: Ionic default theme with custom color palette
- **Typography**: System fonts with consistent sizing
- **Spacing**: 8px grid system
- **Colors**: Brand colors matching PalPalette theme
- **Icons**: Ionic icons with custom device icons

### Key Screens

#### 1. Authentication Screens

- **Login Page** (`src/pages/auth/Login.tsx`)

  - Email/password form
  - Login validation
  - Navigation to register
  - "Remember me" option

- **Register Page** (`src/pages/auth/Register.tsx`)
  - User registration form
  - Email/username validation
  - Password strength indicator
  - Terms of service agreement

#### 2. Device Management Screens

- **Devices Page** (`src/pages/devices/Devices.tsx`)

  - Device list with status indicators
  - Add device button
  - Device quick actions
  - Search and filter options

- **Device Detail Page** (`src/pages/devices/DeviceDetail.tsx`)
  - Device information and settings
  - Connection status
  - Recent color history
  - Device actions (rename, reset, remove)

#### 3. Camera Screens

- **Camera Page** (`src/pages/camera/Camera.tsx`)

  - Live camera preview
  - Capture button
  - Gallery access
  - Flash and camera switching

- **Color Extraction Page** (`src/pages/camera/ColorExtraction.tsx`)
  - Image preview
  - Extracted color palette
  - Color editing tools
  - Share/send options

#### 4. Messages Screens

- **Messages Page** (`src/pages/messages/Messages.tsx`)
  - Message history
  - Sent/received filter
  - Message status indicators
  - Search functionality

### Modal Components

#### PairingCodeModal

```typescript
interface PairingCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (code: string) => Promise<void>;
}
```

- 6-digit code input with auto-formatting
- Code validation and error handling
- Loading states during claim process
- Success/error feedback

#### SetupWizardModal

```typescript
interface SetupWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  device?: Device;
}
```

- Step-by-step device setup guide
- WiFi connection instructions
- Pairing code entry
- Setup completion confirmation

## State Management

### React Context Architecture

#### AuthContext

Manages user authentication state and provides authentication methods.

```typescript
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback(async (email: string, password: string) => {
    // Login implementation with API call
    // Store JWT token securely
    // Update user state
  }, []);

  // Other authentication methods...
};
```

#### DeviceContext

Manages device state and provides device management methods.

```typescript
const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshDevices = useCallback(async () => {
    // Fetch devices from API
    // Update devices state
  }, []);

  // Other device methods...
};
```

### Performance Optimizations

- `useCallback` hooks for stable function references
- `useMemo` for expensive calculations
- Proper dependency arrays to prevent infinite loops
- Optimized re-rendering with React.memo

## API Integration

### HTTP Client Configuration

```typescript
// src/services/api.service.ts
class ApiService {
  private baseURL = environment.apiUrl;
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor for authentication
    this.client.interceptors.request.use((config) => {
      const token = this.getStoredToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => this.handleError(error)
    );
  }
}
```

### Service Classes

#### DevicesService

```typescript
export class DevicesService {
  async getDevices(): Promise<Device[]> {
    const response = await ApiService.get("/devices");
    return response.data;
  }

  async claimDevice(pairingCode: string): Promise<Device> {
    const response = await ApiService.post("/devices/claim", { pairingCode });
    return response.data;
  }

  async updateDevice(
    deviceId: string,
    data: UpdateDeviceData
  ): Promise<Device> {
    const response = await ApiService.put(`/devices/${deviceId}`, data);
    return response.data;
  }
}
```

## Native Features

### Capacitor Plugins

#### Camera Plugin

```typescript
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

const capturePhoto = async (): Promise<string> => {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.Uri,
    source: CameraSource.Camera,
  });

  return image.webPath!;
};
```

#### Storage Plugin

```typescript
import { Storage } from "@capacitor/storage";

const setStorageItem = async (key: string, value: string): Promise<void> => {
  await Storage.set({ key, value });
};

const getStorageItem = async (key: string): Promise<string | null> => {
  const result = await Storage.get({ key });
  return result.value;
};
```

### Platform-Specific Features

#### Android

- Material Design components
- Android-specific navigation patterns
- Hardware back button handling
- Deep linking support

#### iOS

- iOS design guidelines compliance
- Native navigation transitions
- iOS-specific gesture handling
- App Store submission requirements

## Development

### Getting Started

```bash
# Install dependencies
npm install

# Start development server
npx ionic serve

# Run on Android
npx ionic cap add android
npx ionic cap run android

# Run on iOS (macOS only)
npx ionic cap add ios
npx ionic cap run ios
```

### Development Tools

#### Live Reload

```bash
# Android with live reload
npx ionic cap run android -l --external

# iOS with live reload
npx ionic cap run ios -l --external
```

#### Debugging

```bash
# Browser DevTools
npx ionic serve

# Remote debugging for Android
chrome://inspect/#devices

# Safari Web Inspector for iOS
```

### Testing

#### Unit Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

#### E2E Testing

```bash
# Cypress E2E tests
npm run e2e

# Headless E2E tests
npm run e2e:headless
```

## Build and Deployment

### Production Build

```bash
# Build for production
npx ionic build --prod

# Sync to native platforms
npx ionic cap sync
```

### Android Deployment

```bash
# Generate signed APK
cd android
./gradlew assembleRelease

# Upload to Google Play Console
# Follow Google Play publishing guidelines
```

### iOS Deployment

```bash
# Open in Xcode
npx ionic cap open ios

# Archive and upload to App Store Connect
# Follow Apple App Store guidelines
```

## Configuration

### Environment Configuration

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: "http://localhost:3000",
  wsUrl: "ws://localhost:3001",
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: "https://api.palpalette.com",
  wsUrl: "wss://api.palpalette.com:3001",
};
```

### Capacitor Configuration

```typescript
// capacitor.config.ts
import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.palpalette.app",
  appName: "PalPalette",
  webDir: "build",
  bundledWebRuntime: false,
  plugins: {
    Camera: {
      permissions: ["camera", "photos"],
    },
    Storage: {
      group: "PalPaletteGroup",
    },
  },
};

export default config;
```

## Performance Optimization

### Image Optimization

```typescript
const optimizeImage = (
  imageUrl: string,
  maxSize: number = 300
): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const img = new Image();

    img.onload = () => {
      const ratio = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };

    img.src = imageUrl;
  });
};
```

### Memory Management

```typescript
// Cleanup event listeners and timeouts
useEffect(() => {
  const cleanup = () => {
    // Remove event listeners
    // Clear timeouts/intervals
    // Cancel pending requests
  };

  return cleanup;
}, []);
```

## Security

### Secure Storage

```typescript
// Store sensitive data securely
const storeSecureData = async (key: string, value: string): Promise<void> => {
  await Storage.set({
    key,
    value: btoa(value), // Basic encoding, use proper encryption in production
  });
};
```

### Input Validation

```typescript
// Validate user inputs
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePairingCode = (code: string): boolean => {
  const codeRegex = /^\d{6}$/;
  return codeRegex.test(code);
};
```

## Troubleshooting

### Common Issues

#### Camera Permissions

```typescript
// Request camera permissions
const requestCameraPermission = async (): Promise<boolean> => {
  const permission = await Camera.checkPermissions();

  if (permission.camera !== "granted") {
    const request = await Camera.requestPermissions({
      permissions: ["camera"],
    });
    return request.camera === "granted";
  }

  return true;
};
```

#### Network Connectivity

```typescript
// Check network status
import { Network } from "@capacitor/network";

const checkNetworkStatus = async (): Promise<boolean> => {
  const status = await Network.getStatus();
  return status.connected;
};
```

#### Build Issues

```bash
# Clear Ionic cache
npx ionic cache clear

# Clean and rebuild
rm -rf node_modules package-lock.json
npm install
npx ionic build
```

## Future Enhancements

### Planned Features

- Push notifications for color sharing
- Offline mode with local storage
- Advanced color editing tools
- Color palette templates
- Social features (friends, groups)
- Augmented reality color preview
- Voice commands for accessibility
- Dark mode theme
- Multi-language support

### Technical Improvements

- State management with Redux Toolkit
- React Query for better data fetching
- Storybook for component documentation
- Automated testing pipeline
- Performance monitoring
- Crash reporting
- Analytics integration
- Progressive Web App features
