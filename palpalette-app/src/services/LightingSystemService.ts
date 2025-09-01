import type { LightingSystemConfigDto } from "./openapi/models/LightingSystemConfigDto";
import type { LightingSystemStatusDto } from "./openapi/models/LightingSystemStatusDto";
import type { UpdateLightingSystemDto } from "./openapi/models/UpdateLightingSystemDto";
import type { Device } from "./openapi/models/Device";

// Re-export types for convenience
export type LightingSystemConfig = LightingSystemConfigDto;
export type LightingSystemStatus = LightingSystemStatusDto;
export type LightingConfig = LightingSystemConfigDto;
export type LightingSystemType = string;

// Supported systems response type
export interface SupportedSystemsResponse {
  systems: string[];
}

// Test result type
export interface TestResult {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
  testRequested?: boolean;
  deviceConnected?: boolean;
}

// Device lighting system type
export interface DeviceLightingSystem {
  deviceId: string;
  lightingSystem: LightingSystemConfigDto;
}

export class LightingSystemService {
  /**
   * Get supported lighting systems and their capabilities
   */
  static async getSupportedSystems(): Promise<unknown> {
    try {
      const { DevicesService } = await import(
        "./openapi/services/DevicesService"
      );
      return await DevicesService.devicesControllerGetSupportedLightingSystems();
    } catch (error) {
      console.error("Error fetching supported systems:", error);
      throw error;
    }
  }

  /**
   * Get default configuration for a lighting system type
   */
  static async getDefaultConfig(
    systemType: string
  ): Promise<Record<string, unknown>> {
    try {
      const { DevicesService } = await import(
        "./openapi/services/DevicesService"
      );
      return await DevicesService.devicesControllerGetDefaultLightingConfig(
        systemType
      );
    } catch (error) {
      console.error("Error fetching default config:", error);
      throw error;
    }
  }

  /**
   * Configure lighting system for a device
   */
  static async configureLightingSystem(
    deviceId: string,
    config: LightingSystemConfigDto
  ): Promise<Device> {
    try {
      const { DevicesService } = await import(
        "./openapi/services/DevicesService"
      );
      return await DevicesService.devicesControllerConfigureLightingSystem(
        deviceId,
        config
      );
    } catch (error) {
      console.error("Error configuring lighting system:", error);
      throw error;
    }
  }

  /**
   * Update lighting system configuration
   */
  static async updateLightingSystem(
    deviceId: string,
    updates: UpdateLightingSystemDto
  ): Promise<unknown> {
    try {
      const { DevicesService } = await import(
        "./openapi/services/DevicesService"
      );
      return await DevicesService.devicesControllerUpdateLightingSystem(
        deviceId,
        updates
      );
    } catch (error) {
      console.error("Error updating lighting system:", error);
      throw error;
    }
  }

  /**
   * Get lighting system status for a device
   */
  static async getLightingSystemStatus(
    deviceId: string
  ): Promise<LightingSystemStatusDto> {
    try {
      const { DevicesService } = await import(
        "./openapi/services/DevicesService"
      );
      return await DevicesService.devicesControllerGetLightingSystemStatus(
        deviceId
      );
    } catch (error) {
      console.error("Error fetching lighting status:", error);
      throw error;
    }
  }

  /**
   * Test lighting system connectivity
   */
  static async testLightingSystem(deviceId: string): Promise<TestResult> {
    try {
      const { DevicesService } = await import(
        "./openapi/services/DevicesService"
      );
      return await DevicesService.devicesControllerTestLightingSystem(deviceId);
    } catch (error) {
      console.error("Error testing lighting system:", error);
      throw error;
    }
  }

  /**
   * Reset lighting system to default
   */
  static async resetLightingSystem(deviceId: string): Promise<Device> {
    try {
      const { DevicesService } = await import(
        "./openapi/services/DevicesService"
      );
      return await DevicesService.devicesControllerResetLightingSystem(
        deviceId
      );
    } catch (error) {
      console.error("Error resetting lighting system:", error);
      throw error;
    }
  }

  /**
   * Get lighting systems for all user devices
   */
  static async getAllDevicesLightingSystems(): Promise<
    LightingSystemStatusDto[]
  > {
    try {
      const { DevicesService } = await import(
        "./openapi/services/DevicesService"
      );
      return await DevicesService.devicesControllerGetMyDevicesLightingSystems();
    } catch (error) {
      console.error("Error fetching all lighting systems:", error);
      throw error;
    }
  }

  /**
   * Get display name for lighting system type
   */
  static getLightingSystemDisplayName(systemType: string): string {
    switch (systemType) {
      case "nanoleaf":
        return "Nanoleaf Panels";
      case "wled":
        return "WLED LED Strips";
      case "ws2812":
        return "WS2812B LED Strip";
      default:
        return systemType.toUpperCase();
    }
  }

  /**
   * Get status color for lighting system status
   */
  static getStatusColor(status: string): string {
    switch (status) {
      case "working":
        return "success";
      case "error":
        return "danger";
      case "authentication_required":
        return "warning";
      default:
        return "medium";
    }
  }

  /**
   * Get status display text
   */
  static getStatusDisplayText(status: string): string {
    switch (status) {
      case "working":
        return "Working";
      case "error":
        return "Error";
      case "authentication_required":
        return "Auth Required";
      case "unknown":
        return "Unknown";
      default:
        return status;
    }
  }
}
