import axios from "axios";
import { getApiUrl } from "../config/api";
import { Preferences } from "@capacitor/preferences";

export interface LightingSystemConfig {
  lightingSystemType: "nanoleaf" | "wled" | "ws2812";
  lightingHostAddress?: string;
  lightingPort?: number;
  lightingAuthToken?: string;
  lightingCustomConfig?: Record<string, unknown>;
}

export interface LightingSystemStatus {
  lightingSystemType: string;
  lightingHostAddress?: string;
  lightingPort?: number;
  lightingSystemConfigured: boolean;
  lightingStatus: "unknown" | "working" | "error" | "authentication_required";
  lightingLastTestAt?: string;
  requiresAuthentication: boolean;
  capabilities?: LightingSystemCapabilities;
}

export interface LightingSystemCapabilities {
  maxPanels?: number;
  maxLeds?: number;
  animations?: string[];
  segments?: boolean;
  effects?: boolean;
  brightness?: boolean;
  networkRequired?: boolean;
  authentication?: boolean;
}

export interface SupportedSystemsResponse {
  systems: string[];
  capabilities: {
    [key: string]: Record<string, unknown>;
  };
}

export interface DeviceLightingSystem extends LightingSystemStatus {
  deviceId: string;
  deviceName: string;
}

export interface TestResult {
  testRequested: boolean;
  deviceConnected: boolean;
}

export interface Device {
  id: string;
  name: string;
  type: string;
  status: string;
  macAddress?: string;
  ipAddress?: string;
  isOnline: boolean;
  isProvisioned: boolean;
  user?: {
    id: string;
    email: string;
    displayName: string;
  };
  pairingCode?: string;
  pairingCodeExpiresAt?: string;
  lastSeenAt?: string;
  createdAt: string;
  updatedAt: string;
}

export class LightingSystemService {
  private static async getAuthHeader() {
    const { value: token } = await Preferences.get({ key: "authToken" });
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Get supported lighting systems and their capabilities
   */
  static async getSupportedSystems(): Promise<SupportedSystemsResponse> {
    try {
      const response = await axios.get(getApiUrl("/devices/lighting/supported-systems"));
      return response.data;
    } catch (error) {
      console.error("Error fetching supported systems:", error);
      throw error;
    }
  }

  /**
   * Get default configuration for a lighting system type
   */
  static async getDefaultConfig(systemType: string): Promise<Record<string, unknown>> {
    try {
      const response = await axios.get(getApiUrl(`/devices/lighting/${systemType}/default-config`));
      return response.data;
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
    config: LightingSystemConfig
  ): Promise<Device> {
    try {
      const headers = await this.getAuthHeader();
      const response = await axios.post(
        getApiUrl(`/devices/${deviceId}/lighting/configure`),
        config,
        { headers }
      );
      return response.data;
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
    updates: Partial<LightingSystemConfig>
  ): Promise<Device> {
    try {
      const headers = await this.getAuthHeader();
      const response = await axios.patch(
        getApiUrl(`/devices/${deviceId}/lighting`),
        updates,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating lighting system:", error);
      throw error;
    }
  }

  /**
   * Get lighting system status for a device
   */
  static async getLightingSystemStatus(deviceId: string): Promise<LightingSystemStatus> {
    try {
      const headers = await this.getAuthHeader();
      const response = await axios.get(
        getApiUrl(`/devices/${deviceId}/lighting/status`),
        { headers }
      );
      return response.data;
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
      const headers = await this.getAuthHeader();
      const response = await axios.post(
        getApiUrl(`/devices/${deviceId}/lighting/test`),
        {},
        { headers }
      );
      return response.data;
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
      const headers = await this.getAuthHeader();
      const response = await axios.delete(
        getApiUrl(`/devices/${deviceId}/lighting`),
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error("Error resetting lighting system:", error);
      throw error;
    }
  }

  /**
   * Get lighting systems for all user devices
   */
  static async getAllDevicesLightingSystems(): Promise<DeviceLightingSystem[]> {
    try {
      const headers = await this.getAuthHeader();
      const response = await axios.get(
        getApiUrl("/devices/my-devices/lighting-systems"),
        { headers }
      );
      return response.data;
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
