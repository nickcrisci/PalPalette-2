// Core services (keep these as they're not API-related)
export { CameraService } from "./CameraService";
export { ColorExtractionService } from "./ColorExtractionService";
export { WebSocketService } from "./WebSocketService";
export { LightingSystemService } from "./LightingSystemService";

// Notification service
export {
  UserNotificationService,
  userNotificationService,
} from "./UserNotificationService";

// API configuration - only wrapper we need
export {
  configureApiClient,
  setApiToken,
  clearApiToken,
  getApiToken,
} from "./api-config";

// Generated OpenAPI services - use these directly!
export {
  AuthenticationService,
  UsersService,
  DevicesService,
  MessagesService,
} from "./openapi";

// All generated types and models
export * from "./openapi";

// Type exports
export type { CameraPhoto } from "./CameraService";
export type { ExtractedColor, ColorPalette } from "./ColorExtractionService";
export type {
  UserNotification,
  NotificationAction,
  DeviceAuthenticationState,
} from "./UserNotificationService";

// Re-export common generated types for convenience
export type {
  LoginRequestDto,
  RegisterUserDto,
  Device,
  User,
  Message,
  CreateColorPaletteDto,
  SendPaletteToFriendsDto,
  ClaimByCodeDto,
} from "./openapi";
