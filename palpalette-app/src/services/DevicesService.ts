import axios from "axios";
import { getApiUrl } from "../config/api";
import { Preferences } from "@capacitor/preferences";

export interface SetupStep {
  id: string;
  name: string;
  completed: boolean;
}

export interface SetupStatus {
  status: string;
  steps: SetupStep[];
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

export interface DeviceNetwork {
  ssid: string;
  signal: number;
  security: string;
  isDeviceAP: boolean;
}

export interface PairingCodeResponse {
  success: boolean;
  device?: Device;
  message: string;
}

export class DevicesService {
  private static async getAuthHeader() {
    const { value: token } = await Preferences.get({ key: "authToken" });
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Get user's devices
   */
  static async getMyDevices(): Promise<Device[]> {
    try {
      const headers = await this.getAuthHeader();
      const response = await axios.get(getApiUrl("/devices/my-devices"), {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching devices:", error);
      throw error;
    }
  }

  /**
   * Claim a device using 6-digit pairing code (NEW)
   */
  static async claimDeviceByCode(
    pairingCode: string,
    deviceName: string
  ): Promise<Device> {
    try {
      const headers = await this.getAuthHeader();
      const response = await axios.post(
        getApiUrl("/devices/claim-by-code"),
        { pairingCode, deviceName },
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error("Error claiming device by code:", error);
      throw error;
    }
  }

  /**
   * Reset device to unclaimed state (NEW)
   */
  static async resetDevice(deviceId: string): Promise<void> {
    try {
      const headers = await this.getAuthHeader();
      await axios.delete(getApiUrl(`/devices/${deviceId}/reset`), {
        headers,
      });
    } catch (error) {
      console.error("Error resetting device:", error);
      throw error;
    }
  }

  /**
   * Get device pairing code (if available) (NEW)
   */
  static async getDevicePairingCode(deviceId: string): Promise<string | null> {
    try {
      const response = await axios.get(
        getApiUrl(`/devices/pairing-code/${deviceId}`)
      );
      return response.data.pairingCode;
    } catch (error) {
      console.error("Error getting pairing code:", error);
      return null;
    }
  }

  /**
   * Validate pairing code format
   */
  static validatePairingCode(code: string): boolean {
    // 6-digit alphanumeric code
    return /^[A-Z0-9]{6}$/.test(code.toUpperCase());
  }

  // /**
  //  * LEGACY: Claim a device by ID (DEPRECATED - Remove after migration)
  //  */
  // static async claimDevice(
  //   deviceId: string,
  //   deviceName: string
  // ): Promise<Device> {
  //   try {
  //     const headers = await this.getAuthHeader();
  //     const response = await axios.post(
  //       getApiUrl("/devices/claim"),
  //       { deviceId, name: deviceName },
  //       { headers }
  //     );
  //     return response.data;
  //   } catch (error) {
  //     console.error("Error claiming device:", error);
  //     throw error;
  //   }
  // }

  // /**
  //  * LEGACY: Mark device setup as complete (DEPRECATED)
  //  */
  // static async markSetupComplete(deviceId: string): Promise<Device> {
  //   try {
  //     const headers = await this.getAuthHeader();
  //     const response = await axios.post(
  //       getApiUrl("/devices/setup-complete"),
  //       { deviceId },
  //       { headers }
  //     );
  //     return response.data;
  //   } catch (error) {
  //     console.error("Error marking setup complete:", error);
  //     throw error;
  //   }
  // }

  // /**
  //  * LEGACY: Get device setup status (DEPRECATED)
  //  */
  // static async getSetupStatus(deviceId: string): Promise<SetupStatus> {
  //   try {
  //     const headers = await this.getAuthHeader();
  //     const response = await axios.get(
  //       getApiUrl(`/devices/setup-status/${deviceId}`),
  //       { headers }
  //     );
  //     return response.data;
  //   } catch (error) {
  //     console.error("Error getting setup status:", error);
  //     throw error;
  //   }
  // }
}
