import { useState, useEffect, useRef } from "react";
import {
  WebSocketService,
  DeviceStatusEvent,
  LightingSystemStatusEvent,
} from "../services/WebSocketService";
import { UserNotificationDto } from "../services/openapi/models/UserNotificationDto";
import { API_CONFIG } from "../config/api";

export interface UseWebSocketOptions {
  autoConnect?: boolean;
}

export interface WebSocketHookReturn {
  isConnected: boolean;
  userNotifications: UserNotificationDto[];
  deviceStatuses: Map<string, DeviceStatusEvent>;
  lightingStatuses: Map<string, LightingSystemStatusEvent>;
  connect: () => void;
  disconnect: () => void;
  clearNotifications: () => void;
  markNotificationRead: (index: number) => void;
}

// Singleton WebSocket service instance
let globalWebSocketService: WebSocketService | null = null;

// Global state for all hooks to share
let globalIsConnected = false;
let globalUserNotifications: UserNotificationDto[] = [];
const globalDeviceStatuses = new Map<string, DeviceStatusEvent>();
const globalLightingStatuses = new Map<string, LightingSystemStatusEvent>();

// Subscribers for state updates
const subscribers = new Set<() => void>();

function notifySubscribers() {
  subscribers.forEach((callback) => callback());
}

function initializeGlobalWebSocket() {
  if (globalWebSocketService) {
    return globalWebSocketService;
  }

  console.log("🔧 Creating singleton WebSocket service");
  globalWebSocketService = new WebSocketService(API_CONFIG.WEBSOCKET_URL);

  // Set up event listeners
  globalWebSocketService.on("connected", () => {
    console.log("✅ Singleton WebSocket connected");
    globalIsConnected = true;
    notifySubscribers();
  });

  globalWebSocketService.on("disconnected", () => {
    console.log("🔌 Singleton WebSocket disconnected");
    globalIsConnected = false;
    notifySubscribers();
  });

  globalWebSocketService.on(
    "userActionRequired",
    (notification: UserNotificationDto) => {
      console.log("🔔 New user notification:", notification);
      globalUserNotifications = [notification, ...globalUserNotifications];
      notifySubscribers();

      // Auto-remove notification after timeout if specified
      if (notification.timeout && notification.timeout > 0) {
        setTimeout(() => {
          globalUserNotifications = globalUserNotifications.filter(
            (n) => n.timestamp !== notification.timestamp
          );
          notifySubscribers();
        }, notification.timeout * 1000);
      }
    }
  );

  globalWebSocketService.on("deviceStatus", (status: DeviceStatusEvent) => {
    console.log("📱 Device status update:", status);
    globalDeviceStatuses.set(status.deviceId, status);
    notifySubscribers();
  });

  globalWebSocketService.on(
    "lightingSystemStatus",
    (status: LightingSystemStatusEvent) => {
      console.log("💡 Lighting status update:", status);
      globalLightingStatuses.set(status.deviceId, status);
      notifySubscribers();
    }
  );

  return globalWebSocketService;
}

export const useWebSocket = (
  options: UseWebSocketOptions = {}
): WebSocketHookReturn => {
  const { autoConnect = true } = options;

  // Local state to trigger re-renders
  const [, forceUpdate] = useState({});
  const rerender = () => forceUpdate({});

  // Subscribe to global state changes
  useEffect(() => {
    subscribers.add(rerender);
    return () => {
      subscribers.delete(rerender);
    };
  }, []);

  // Initialize WebSocket service
  const wsRef = useRef<WebSocketService | null>(null);

  useEffect(() => {
    if (!wsRef.current) {
      wsRef.current = initializeGlobalWebSocket();
    }

    if (autoConnect && wsRef.current) {
      wsRef.current.connect();
    }

    return () => {
      // Don't disconnect on unmount since other components might be using it
      // Only disconnect when the entire app unmounts
    };
  }, [autoConnect]);

  const connect = () => {
    if (wsRef.current) {
      wsRef.current.connect();
    }
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.disconnect();
    }
  };

  const clearNotifications = () => {
    globalUserNotifications = [];
    notifySubscribers();
  };

  const markNotificationRead = (index: number) => {
    if (globalUserNotifications[index]) {
      // Mark as read by updating additional data
      globalUserNotifications[index] = {
        ...globalUserNotifications[index],
        additionalData: {
          ...globalUserNotifications[index].additionalData,
          isRead: true,
        },
      };
      notifySubscribers();
    }
  };

  return {
    isConnected: globalIsConnected,
    userNotifications: globalUserNotifications,
    deviceStatuses: globalDeviceStatuses,
    lightingStatuses: globalLightingStatuses,
    connect,
    disconnect,
    clearNotifications,
    markNotificationRead,
  };
};
