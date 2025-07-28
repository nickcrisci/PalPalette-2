import React, { createContext, useState, ReactNode } from "react";
import { DevicesService } from "../services/DevicesService";
import { useAuth } from "../hooks/useContexts";

export type { Device } from "../services/DevicesService";

export interface DeviceContextType {
  devices: Device[];
  loading: boolean;
  refreshDevices: () => Promise<void>;
  claimDeviceByCode: (pairingCode: string, name: string) => Promise<boolean>;
  resetDevice: (deviceId: string) => Promise<boolean>;
  sendColorToDevice: (deviceId: string, color: string) => void;
  // Legacy support (deprecated)
  claimDevice: (deviceId: string, setupSecret: string, name: string) => Promise<boolean>;
}createContext, useState, ReactNode } from "react";
import { DevicesService, Device } from "../services/DevicesService";
import { useAuth } from "../hooks/useContexts";

export { Device } from "../services/DevicesService";

export interface DeviceContextType {
  devices: Device[];
  loading: boolean;
  refreshDevices: () => Promise<void>;
  claimDeviceByCode: (pairingCode: string, name: string) => Promise<boolean>;
  resetDevice: (deviceId: string) => Promise<boolean>;
  sendColorToDevice: (deviceId: string, color: string) => void;
  // Legacy support (deprecated)
  claimDevice: (deviceId: string, setupSecret: string, name: string) => Promise<boolean>;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

interface DeviceProviderProps {
  children: ReactNode;
}

export const DeviceProvider: React.FC<DeviceProviderProps> = ({ children }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const refreshDevices = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await axios.get(
        getApiUrl(API_CONFIG.ENDPOINTS.DEVICES.MY_DEVICES),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDevices(response.data);
    } catch (error) {
      console.error("Failed to refresh devices:", error);
    } finally {
      setLoading(false);
    }
  };

  const claimDevice = async (
    deviceId: string,
    setupSecret: string,
    name: string
  ): Promise<boolean> => {
    if (!token) return false;

    try {
      setLoading(true);
      await axios.post(
        getApiUrl(API_CONFIG.ENDPOINTS.DEVICES.CLAIM),
        { deviceId, setupSecret, deviceName: name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh devices list after successful claim
      await refreshDevices();
      return true;
    } catch (error) {
      console.error("Failed to claim device:", error);
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
    claimDevice,
    sendColorToDevice,
  };

  return (
    <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>
  );
};

export { DeviceContext };
