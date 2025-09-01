import { useState, useCallback } from "react";
import { Device } from "../../services/openapi/models/Device";
import { useDevices } from "../api";

interface DeviceManagementState {
  selectedDevice: Device | null;
  authNotificationDevice: Device | null;
  showPairingModal: boolean;
  showSettingsModal: boolean;
  showSetupWizard: boolean;
  showLightingModal: boolean;
  showAuthNotification: boolean;
  lastRefresh: Date;
}

interface DeviceManagementActions {
  handleDeviceClaimed: () => void;
  handleDeviceSettings: (device: Device) => void;
  handleLightingConfig: (device: Device) => void;
  handleDeviceReset: (deviceId: string) => Promise<void>;
  handleStartLightingAuth: (device: Device) => void;
  handleAuthSuccess: () => void;
  handleAuthFailed: () => void;
  handleRefresh: (event: CustomEvent) => Promise<void>;
  setShowPairingModal: (show: boolean) => void;
  setShowSettingsModal: (show: boolean) => void;
  setShowSetupWizard: (show: boolean) => void;
  setShowLightingModal: (show: boolean) => void;
  setShowAuthNotification: (show: boolean) => void;
  setSelectedDevice: (device: Device | null) => void;
  setAuthNotificationDevice: (device: Device | null) => void;
}

export interface UseDeviceManagementReturn
  extends DeviceManagementState,
    DeviceManagementActions {
  devices: Device[];
  loading: boolean;
  refreshDevices: () => Promise<void>;
}

export function useDeviceManagement(): UseDeviceManagementReturn {
  const { devices, loading, refreshDevices, resetDevice } = useDevices();

  const [state, setState] = useState<DeviceManagementState>({
    selectedDevice: null,
    authNotificationDevice: null,
    showPairingModal: false,
    showSettingsModal: false,
    showSetupWizard: false,
    showLightingModal: false,
    showAuthNotification: false,
    lastRefresh: new Date(),
  });

  const updateState = useCallback((updates: Partial<DeviceManagementState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleDeviceClaimed = useCallback(() => {
    refreshDevices();
  }, [refreshDevices]);

  const handleDeviceSettings = useCallback(
    (device: Device) => {
      updateState({
        selectedDevice: device,
        showSettingsModal: true,
      });
    },
    [updateState]
  );

  const handleLightingConfig = useCallback(
    (device: Device) => {
      updateState({
        selectedDevice: device,
        showLightingModal: true,
      });
    },
    [updateState]
  );

  const handleDeviceReset = useCallback(
    async (deviceId: string) => {
      await resetDevice(deviceId);
      updateState({
        showSettingsModal: false,
        selectedDevice: null,
      });
    },
    [resetDevice, updateState]
  );

  const handleStartLightingAuth = useCallback(
    (device: Device) => {
      updateState({
        authNotificationDevice: device,
        showAuthNotification: true,
        showLightingModal: false,
        selectedDevice: null,
      });
    },
    [updateState]
  );

  const handleAuthSuccess = useCallback(() => {
    refreshDevices(); // Refresh to get updated lighting status
  }, [refreshDevices]);

  const handleAuthFailed = useCallback(() => {
    // Could show an error message or retry options
    console.log("Lighting authentication failed");
  }, []);

  const handleRefresh = useCallback(
    async (event: CustomEvent) => {
      await refreshDevices();
      updateState({ lastRefresh: new Date() });
      event.detail.complete();
    },
    [refreshDevices, updateState]
  );

  const setShowPairingModal = useCallback(
    (show: boolean) => {
      updateState({ showPairingModal: show });
    },
    [updateState]
  );

  const setShowSettingsModal = useCallback(
    (show: boolean) => {
      updateState({ showSettingsModal: show });
    },
    [updateState]
  );

  const setShowSetupWizard = useCallback(
    (show: boolean) => {
      updateState({ showSetupWizard: show });
    },
    [updateState]
  );

  const setShowLightingModal = useCallback(
    (show: boolean) => {
      updateState({ showLightingModal: show });
    },
    [updateState]
  );

  const setShowAuthNotification = useCallback(
    (show: boolean) => {
      updateState({ showAuthNotification: show });
    },
    [updateState]
  );

  const setSelectedDevice = useCallback(
    (device: Device | null) => {
      updateState({ selectedDevice: device });
    },
    [updateState]
  );

  const setAuthNotificationDevice = useCallback(
    (device: Device | null) => {
      updateState({ authNotificationDevice: device });
    },
    [updateState]
  );

  return {
    // State
    ...state,
    devices,
    loading,

    // Base actions
    refreshDevices,

    // Custom actions
    handleDeviceClaimed,
    handleDeviceSettings,
    handleLightingConfig,
    handleDeviceReset,
    handleStartLightingAuth,
    handleAuthSuccess,
    handleAuthFailed,
    handleRefresh,
    setShowPairingModal,
    setShowSettingsModal,
    setShowSetupWizard,
    setShowLightingModal,
    setShowAuthNotification,
    setSelectedDevice,
    setAuthNotificationDevice,
  };
}
