// Base API client
export { default as BaseAPIClient } from "./BaseAPIClient";

// Device management API
export { DevicesAPI, devicesAPI } from "./devices.api";
export type {
  Device,
  SetupStep,
  SetupStatus,
  DeviceNetwork,
  PairingCodeResponse,
  ClaimDeviceRequest,
  UpdateDeviceRequest,
} from "./devices.api";

// Lighting system API
export { LightingAPI, lightingAPI } from "./lighting.api";
export type {
  LightingConfig,
  LightingStatus,
  ColorPalette,
  UpdateLightingRequest,
} from "./lighting.api";
