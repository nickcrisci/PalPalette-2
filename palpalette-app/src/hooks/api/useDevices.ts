import { useState, useCallback, useEffect } from "react";
import { Device } from "../../services/openapi/models/Device";
import { DevicesService } from "../../services/openapi/services/DevicesService";
import { ClaimByCodeDto } from "../../services/openapi/models/ClaimByCodeDto";
import { UpdateDeviceDto } from "../../services/openapi/models/UpdateDeviceDto";

export interface UseDevicesReturn {
  devices: Device[];
  loading: boolean;
  error: string | null;
  refreshDevices: () => Promise<void>;
  claimDevice: (pairingCode: string, deviceName: string) => Promise<boolean>;
  resetDevice: (deviceId: string) => Promise<boolean>;
  sendColorToDevice: (deviceId: string, color: string) => Promise<boolean>;
  updateDevice: (
    deviceId: string,
    updates: Partial<Device>
  ) => Promise<boolean>;
}

export const useDevices = (autoLoad: boolean = true): UseDevicesReturn => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshDevices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const deviceList = await DevicesService.devicesControllerGetMyDevices();
      setDevices(deviceList as Device[]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch devices";
      setError(errorMessage);
      console.error("Failed to refresh devices:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const claimDevice = useCallback(
    async (pairingCode: string, deviceName: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        const dto: ClaimByCodeDto = { pairingCode, deviceName };
        await DevicesService.devicesControllerClaimByCode(dto);
        // Refresh devices list after successful claim
        await refreshDevices();
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to claim device";
        setError(errorMessage);
        console.error("Failed to claim device:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [refreshDevices]
  );

  const resetDevice = useCallback(
    async (deviceId: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        await DevicesService.devicesControllerResetDevice(deviceId);
        // Refresh devices list after reset
        await refreshDevices();
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to reset device";
        setError(errorMessage);
        console.error("Failed to reset device:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [refreshDevices]
  );

  const sendColorToDevice = useCallback(
    async (deviceId: string, color: string): Promise<boolean> => {
      setError(null);
      try {
        // TODO: Implement with OpenAPI if endpoint exists
        console.warn("sendColorToDevice not implemented with OpenAPI yet");
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to send color to device";
        setError(errorMessage);
        console.error("Failed to send color to device:", err);
        return false;
      }
    },
    []
  );

  const updateDevice = useCallback(
    async (deviceId: string, updates: Partial<Device>): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        const updateDto: UpdateDeviceDto = {
          name: updates.name,
          status: updates.status,
          lightingSystemType: updates.lightingSystemType,
          lightingHostAddress: updates.lightingHostAddress,
          lightingPort: updates.lightingPort,
          lightingAuthToken: updates.lightingAuthToken,
          lightingCustomConfig: updates.lightingCustomConfig,
          lightingSystemConfigured: updates.lightingSystemConfigured,
          lightingStatus: updates.lightingStatus,
        };
        await DevicesService.devicesControllerUpdate(deviceId, updateDto);
        // Update the local state optimistically
        setDevices((prevDevices) =>
          prevDevices.map((device) =>
            device.id === deviceId ? { ...device, ...updates } : device
          )
        );
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update device";
        setError(errorMessage);
        console.error("Failed to update device:", err);
        // Refresh devices to get the correct state
        await refreshDevices();
        return false;
      } finally {
        setLoading(false);
      }
    },
    [refreshDevices]
  );

  // Auto-load devices on mount if enabled
  useEffect(() => {
    if (autoLoad) {
      refreshDevices();
    }
  }, [autoLoad, refreshDevices]);

  return {
    devices,
    loading,
    error,
    refreshDevices,
    claimDevice,
    resetDevice,
    sendColorToDevice,
    updateDevice,
  };
};
