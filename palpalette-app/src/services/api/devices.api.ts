import BaseAPIClient from "./BaseAPIClient";

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

export interface ClaimDeviceRequest {
  pairingCode: string;
  deviceName?: string;
}

export interface ClaimByCodeRequest {
  pairingCode: string;
  deviceName: string;
}

export interface UnpairedDevice {
  id: string;
  name: string;
  deviceType: string;
  firmwareVersion: string;
  ipAddress: string;
  macAddress: string;
  lastSeen: string;
  pairingCodeExpires: string;
  isActive: boolean;
}

export interface DeviceDiscoveryResponse {
  devices: UnpairedDevice[];
}

export interface UpdateDeviceRequest {
  name?: string;
  settings?: Record<string, unknown>;
}

/**
 * Device management API service
 */
export class DevicesAPI extends BaseAPIClient {
  /**
   * Get user's devices
   */
  async getDevices(): Promise<Device[]> {
    return this.get<Device[]>("/devices/my-devices");
  }

  /**
   * Claim a device using 6-digit pairing code
   */
  async claimDevice(data: ClaimDeviceRequest): Promise<Device> {
    return this.post<Device>("/devices/claim-by-code", data);
  }

  /**
   * Claim a device by ID and pairing code
   */
  async claimByCode(data: ClaimByCodeRequest): Promise<Device> {
    return this.post<Device>("/devices/claim-by-code", data);
  }

  /**
   * Discover unpaired devices on the network
   */
  async discoverUnpairedDevices(): Promise<DeviceDiscoveryResponse> {
    return this.get<DeviceDiscoveryResponse>("/devices/discover/unpaired");
  }

  /**
   * Get pairing information for a specific device
   */
  async getDevicePairingInfo(deviceId: string): Promise<{
    deviceId: string;
    pairingCode: string;
    deviceName: string;
    firmwareVersion: string;
    pairingExpires: string;
  }> {
    return this.get(`/devices/${deviceId}/pairing-info`);
  }

  /**
   * Update device information
   */
  async updateDevice(id: string, data: UpdateDeviceRequest): Promise<Device> {
    return this.put<Device>(`/devices/${id}`, data);
  }

  /**
   * Reset device to unclaimed state
   */
  async resetDevice(id: string): Promise<void> {
    return this.delete<void>(`/devices/${id}/reset`);
  }

  /**
   * Get device networks (for setup)
   */
  async getDeviceNetworks(deviceId: string): Promise<DeviceNetwork[]> {
    return this.get<DeviceNetwork[]>(`/devices/${deviceId}/networks`);
  }

  /**
   * Configure device WiFi
   */
  async configureDeviceWiFi(
    deviceId: string,
    ssid: string,
    password: string
  ): Promise<void> {
    return this.post<void>(`/devices/${deviceId}/configure-wifi`, {
      ssid,
      password,
    });
  }

  /**
   * Send color palette to device
   */
  async sendColorToDevice(deviceId: string, color: string): Promise<void> {
    return this.post<void>(`/devices/${deviceId}/send-color`, { color });
  }

  /**
   * Get device setup status
   */
  async getDeviceSetupStatus(deviceId: string): Promise<SetupStatus> {
    return this.get<SetupStatus>(`/devices/${deviceId}/setup-status`);
  }
}

// Export singleton instance
export const devicesAPI = new DevicesAPI();
