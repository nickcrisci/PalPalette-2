import BaseAPIClient from "./BaseAPIClient";

export interface LightingConfig {
  lightingSystemType: string;
  lightingHostAddress: string;
  lightingPort: number;
  lightingCustomConfig?: Record<string, unknown>;
}

export interface LightingStatus {
  deviceId: string;
  lightingSystemType?: string;
  lightingSystemConfigured: boolean;
  isAuthenticated: boolean;
  lastCommandAt?: string;
  errorMessage?: string;
}

export interface ColorPalette {
  colors: string[];
  name?: string;
  duration?: number;
  animation?: string;
}

export interface UpdateLightingRequest {
  lightingHostAddress?: string;
  lightingPort?: number;
  lightingCustomConfig?: Record<string, unknown>;
}

/**
 * Lighting system API service
 */
export class LightingAPI extends BaseAPIClient {
  /**
   * Configure lighting system for a device
   */
  async configureLighting(
    deviceId: string,
    config: LightingConfig
  ): Promise<LightingStatus> {
    return this.post<LightingStatus>(
      `/devices/${deviceId}/lighting/configure`,
      config
    );
  }

  /**
   * Update lighting system configuration
   */
  async updateLighting(
    deviceId: string,
    updates: UpdateLightingRequest
  ): Promise<LightingStatus> {
    return this.put<LightingStatus>(`/devices/${deviceId}/lighting`, updates);
  }

  /**
   * Get lighting system status
   */
  async getLightingStatus(deviceId: string): Promise<LightingStatus> {
    return this.get<LightingStatus>(`/devices/${deviceId}/lighting/status`);
  }

  /**
   * Send color palette to lighting system
   */
  async sendColorPalette(
    deviceId: string,
    palette: ColorPalette
  ): Promise<void> {
    return this.post<void>(`/devices/${deviceId}/lighting/palette`, palette);
  }

  /**
   * Test lighting system connection
   */
  async testLightingConnection(deviceId: string): Promise<boolean> {
    const result = await this.post<{ success: boolean }>(
      `/devices/${deviceId}/lighting/test`,
      {}
    );
    return result.success;
  }

  /**
   * Get supported lighting system types
   */
  async getSupportedLightingSystems(): Promise<string[]> {
    return this.get<string[]>("/lighting/supported-systems");
  }

  /**
   * Get lighting system capabilities
   */
  async getLightingCapabilities(
    systemType: string
  ): Promise<Record<string, unknown>> {
    return this.get<Record<string, unknown>>(
      `/lighting/capabilities/${systemType}`
    );
  }
}

// Export singleton instance
export const lightingAPI = new LightingAPI();
