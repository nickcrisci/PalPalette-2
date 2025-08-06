import { useEffect, useState } from "react";
import {
  userNotificationService,
  UserNotification,
  DeviceAuthenticationState,
} from "../services/UserNotificationService";

export const useDeviceNotifications = () => {
  const [authenticatingDevices, setAuthenticatingDevices] = useState<
    DeviceAuthenticationState[]
  >([]);
  const [latestNotification, setLatestNotification] =
    useState<UserNotification | null>(null);

  useEffect(() => {
    // Listen for global device authentication notifications
    const handleGlobalNotification = (event: CustomEvent<UserNotification>) => {
      const notification = event.detail;
      setLatestNotification(notification);

      // Update list of authenticating devices
      const devices = userNotificationService.getAuthenticatingDevices();
      setAuthenticatingDevices(devices);
    };

    // Add event listener for custom device notification events
    window.addEventListener(
      "deviceAuthNotification",
      handleGlobalNotification as EventListener
    );

    // Request notification permissions on first use
    userNotificationService.requestNotificationPermissions();

    // Initial state
    const devices = userNotificationService.getAuthenticatingDevices();
    setAuthenticatingDevices(devices);

    return () => {
      window.removeEventListener(
        "deviceAuthNotification",
        handleGlobalNotification as EventListener
      );
    };
  }, []);

  const clearLatestNotification = () => {
    setLatestNotification(null);
  };

  const getDeviceAuthState = (deviceId: string) => {
    return userNotificationService.getAuthenticationState(deviceId);
  };

  const hasAuthenticatingDevices = authenticatingDevices.length > 0;

  return {
    authenticatingDevices,
    latestNotification,
    hasAuthenticatingDevices,
    clearLatestNotification,
    getDeviceAuthState,
  };
};
