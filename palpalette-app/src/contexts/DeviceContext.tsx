import React, { createContext, useState, ReactNode, useCallback } from "react";
import { DevicesService, Device } from "../services/DevicesService";
import { useAuth } from "../hooks/useContexts";

export interface DeviceContextType {
  devices: Device[];
  loading: boolean;
  refreshDevices: () => Promise<void>;
  claimDeviceByCode: (pairingCode: string, name: string) => Promise<boolean>;
  resetDevice: (deviceId: string) => Promise<boolean>;
  sendColorToDevice: (deviceId: string, color: string) => void;
  // Legacy support (deprecated)
  claimDevice: (
    deviceId: string,
    setupSecret: string,
    name: string
  ) => Promise<boolean>;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

interface DeviceProviderProps {
  children: ReactNode;
}

export const DeviceProvider: React.FC<DeviceProviderProps> = ({ children }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const refreshDevices = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const devicesData = await DevicesService.getMyDevices();
      setDevices(devicesData);
    } catch (error) {
      console.error("Failed to refresh devices:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const claimDeviceByCode = useCallback(
    async (pairingCode: string, name: string): Promise<boolean> => {
      if (!token) return false;

      try {
        setLoading(true);
        await DevicesService.claimDeviceByCode(pairingCode, name);
        // Refresh devices list after successful claim
        await refreshDevices();
        return true;
      } catch (error) {
        console.error("Failed to claim device by code:", error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [token, refreshDevices]
  );

  const resetDevice = useCallback(
    async (deviceId: string): Promise<boolean> => {
      if (!token) return false;

      try {
        setLoading(true);
        await DevicesService.resetDevice(deviceId);
        // Refresh devices list after successful reset
        await refreshDevices();
        return true;
      } catch (error) {
        console.error("Failed to reset device:", error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [token, refreshDevices]
  );

  // Legacy claim device method (deprecated)
  const claimDevice = async (
    deviceId: string,
    setupSecret: string,
    name: string
  ): Promise<boolean> => {
    if (!token) return false;

    try {
      setLoading(true);
      await DevicesService.claimDevice(deviceId, name);
      // Refresh devices list after successful claim
      await refreshDevices();
      return true;
    } catch (error) {
      console.error("Failed to claim device (legacy):", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const sendColorToDevice = (deviceId: string, color: string) => {
    // For now, we'll use HTTP API for sending colors
    // Later we can implement WebSocket functionality
    console.log(`Sending color ${color} to device ${deviceId}`);
  };

  const value: DeviceContextType = {
    devices,
    loading,
    refreshDevices,
    claimDeviceByCode,
    resetDevice,
    claimDevice, // Legacy support
    sendColorToDevice,
  };

  return (
    <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>
  );
};

export { DeviceContext };
