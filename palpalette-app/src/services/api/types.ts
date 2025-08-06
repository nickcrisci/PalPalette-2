// API Types for PalPalette App

export interface Device {
  id: string;
  name: string;
  isOnline: boolean;
  batteryLevel?: number;
  lastSeen?: Date;
  firmwareVersion?: string;
  deviceType?: string;
  status?: "active" | "inactive" | "offline" | "setup";

  // Network information
  ipAddress?: string;
  wifiRSSI?: number;
  macAddress?: string;

  // System statistics
  systemStats?: {
    freeHeap?: number;
    uptime?: number;
    lastUpdate?: Date;
  };

  // Device setup
  isProvisioned?: boolean;
  pairingCode?: string;
  pairingCodeExpiresAt?: string;

  // Lighting system
  lightingSystemType?: string;
  lightingSystemConfigured?: boolean;
  lightingStatus?: string;
  lightingHostAddress?: string;
  lightingPort?: number;
  lightingAuthToken?: string;
  lightingCustomConfig?: Record<string, unknown>;
  lightingCapabilities?: Record<string, unknown>;
  lightingLastStatusUpdate?: Date;
  lightingLastTestAt?: Date;

  colorCapabilities?: {
    supportsRGB: boolean;
    supportsWhite: boolean;
    supportsBrightness: boolean;
  };
  settings?: {
    brightness: number;
    currentColor: string;
    autoMode: boolean;
  };
}

export interface User {
  id: string;
  username: string;
  email?: string;
  role?: "user" | "admin";
  createdAt?: Date;
  lastLogin?: Date;
}

export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  sender: string;
  recipient?: string;
  deviceId?: string;
  type?: "user" | "system" | "device";
  status?: "sent" | "delivered" | "read";
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
  success: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, unknown>;
}

// Device-specific types
export interface DeviceClaimRequest {
  pairingCode: string;
  name: string;
}

export interface DeviceResetRequest {
  deviceId: string;
  force?: boolean;
}

export interface ColorCommand {
  deviceId: string;
  color: string;
  brightness?: number;
  duration?: number;
}

// Lighting system types
export interface LightingPreset {
  id: string;
  name: string;
  colors: string[];
  duration: number;
  pattern: "solid" | "fade" | "rainbow" | "strobe";
}

// User notification types
export interface UserNotification {
  id?: string;
  deviceId: string;
  deviceName?: string;
  action: string;
  instructions: string;
  timeout?: number;
  type?: string;
  systemType?: string;
  displayMessage?: string;
  timestamp: number;
  isRead?: boolean;
}

// Device WebSocket event types
export interface DeviceStatusEvent {
  deviceId: string;
  isOnline: boolean;
  isProvisioned: boolean;
  firmwareVersion?: string;
  ipAddress?: string;
  macAddress?: string;
  wifiRSSI?: number;
  freeHeap?: number;
  uptime?: number;
  timestamp: number;
}

export interface LightingSystemStatusEvent {
  deviceId: string;
  hasLightingSystem: boolean;
  isReady: boolean;
  systemType?: string;
  status?: string;
  capabilities?: Record<string, unknown>;
  timestamp: number;
}

export interface LightingSchedule {
  id: string;
  name: string;
  preset: string;
  startTime: string;
  endTime: string;
  days: string[];
  enabled: boolean;
}
