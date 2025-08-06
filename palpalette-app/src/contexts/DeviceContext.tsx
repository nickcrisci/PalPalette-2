import React, { createContext, useState, ReactNode, useCallback } from "react";
import { devicesAPI, Device } from "../services/api";
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
      const devicesData = await devicesAPI.getDevices();
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
        await devicesAPI.claimDevice({ pairingCode, deviceName: name });
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
        await devicesAPI.resetDevice(deviceId);
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
    console.warn("claimDevice is deprecated, use claimDeviceByCode instead");
    // For backward compatibility, try to use setupSecret as pairingCode
    return claimDeviceByCode(setupSecret, name);
  };

  const sendColorToDevice = (deviceId: string, color: string) => {
    devicesAPI.sendColorToDevice(deviceId, color).catch((error) => {
      console.error("Failed to send color to device:", error);
    });
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
