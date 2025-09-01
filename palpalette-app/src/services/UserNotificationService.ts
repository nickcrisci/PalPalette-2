import { getApiUrl } from "../config/api";
import { Preferences } from "@capacitor/preferences";

export enum NotificationAction {
  PRESS_POWER_BUTTON = "press_power_button",
  ENTER_PAIRING_CODE = "enter_pairing_code",
  AUTHENTICATION_SUCCESS = "authentication_success",
  AUTHENTICATION_FAILED = "authentication_failed",
  NANOLEAF_PAIRING = "nanoleaf_pairing",
  NANOLEAF_PAIRING_PROGRESS = "nanoleaf_pairing_progress",
  NANOLEAF_PAIRING_SUCCESS = "nanoleaf_pairing_success",
  NANOLEAF_PAIRING_FAILED = "nanoleaf_pairing_failed",
  LIGHTING_AUTHENTICATION_REQUIRED = "lighting_authentication_required",
}

export interface UserNotification {
  deviceId: string;
  action: NotificationAction;
  message: string;
  instructions?: string;
  pairingCode?: string;
  timeout?: number;
  timestamp?: number;
  additionalData?: Record<string, any>;
}

export interface NotificationResponse {
  notificationId: string;
  status: "delivered" | "failed" | "pending";
  message: string;
}

export interface DeviceAuthenticationState {
  deviceId: string;
  isAuthenticating: boolean;
  currentStep: NotificationAction | null;
  message: string;
  pairingCode?: string;
  lastUpdate: number;
}

export class UserNotificationService {
  private authenticationStates = new Map<string, DeviceAuthenticationState>();
  private notificationCallbacks = new Map<
    string,
    (notification: UserNotification) => void
  >();
  private wsConnection: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.initializeWebSocketConnection();
  }

  // Register a callback for authentication notifications for a specific device
  onAuthenticationNotification(
    deviceId: string,
    callback: (notification: UserNotification) => void
  ) {
    this.notificationCallbacks.set(deviceId, callback);
  }

  // Remove callback for a device
  removeAuthenticationCallback(deviceId: string) {
    this.notificationCallbacks.delete(deviceId);
    this.authenticationStates.delete(deviceId);
  }

  // Get current authentication state for a device
  getAuthenticationState(deviceId: string): DeviceAuthenticationState | null {
    return this.authenticationStates.get(deviceId) || null;
  }

  // Get all devices currently in authentication process
  getAuthenticatingDevices(): DeviceAuthenticationState[] {
    return Array.from(this.authenticationStates.values()).filter(
      (state) => state.isAuthenticating
    );
  }

  // Initialize WebSocket connection to receive real-time notifications
  private async initializeWebSocketConnection() {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        console.log("No auth token available for WebSocket connection");
        return;
      }

      const wsUrl = this.getWebSocketUrl();
      this.wsConnection = new WebSocket(wsUrl);

      this.wsConnection.onopen = () => {
        console.log("WebSocket connected for user notifications");
        this.reconnectAttempts = 0;

        // Send authentication
        this.wsConnection?.send(
          JSON.stringify({
            event: "authenticate",
            data: { token },
          })
        );
      };

      this.wsConnection.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.wsConnection.onclose = () => {
        console.log("WebSocket connection closed");
        this.handleReconnect();
      };

      this.wsConnection.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    } catch (error) {
      console.error("Error initializing WebSocket connection:", error);
    }
  }

  // Handle incoming WebSocket messages
  private handleWebSocketMessage(message: any) {
    if (message.event === "user_action_required") {
      const notification: UserNotification = message.data;
      this.handleUserActionRequired(notification);
    }
  }

  // Handle user action required notifications
  private handleUserActionRequired(notification: UserNotification) {
    const { deviceId, action, message: notificationMessage } = notification;

    // Update authentication state
    this.authenticationStates.set(deviceId, {
      deviceId,
      isAuthenticating: true,
      currentStep: action,
      message: notificationMessage,
      pairingCode: notification.pairingCode,
      lastUpdate: Date.now(),
    });

    // Call registered callback for this device
    const callback = this.notificationCallbacks.get(deviceId);
    if (callback) {
      callback(notification);
    }

    // Also trigger global notification handlers
    this.triggerGlobalNotificationHandlers(notification);
  }

  // Trigger global notification handlers (for UI notifications, etc.)
  private triggerGlobalNotificationHandlers(notification: UserNotification) {
    // Fire custom event for components to listen to
    const event = new CustomEvent("deviceAuthNotification", {
      detail: notification,
    });
    window.dispatchEvent(event);

    // Show native notification if app is in background
    if (document.hidden) {
      this.showNativeNotification(notification);
    }
  }

  // Show native notification
  private async showNativeNotification(notification: UserNotification) {
    if ("Notification" in window && Notification.permission === "granted") {
      const title = this.getNotificationTitle(notification.action);
      new Notification(title, {
        body: notification.message,
        icon: "/assets/icon/favicon.png", // Adjust path as needed
        tag: `device-auth-${notification.deviceId}`,
      });
    }
  }

  // Get notification title based on action
  private getNotificationTitle(action: NotificationAction): string {
    switch (action) {
      case NotificationAction.PRESS_POWER_BUTTON:
        return "Device Setup Required";
      case NotificationAction.ENTER_PAIRING_CODE:
        return "Pairing Code Available";
      case NotificationAction.AUTHENTICATION_SUCCESS:
        return "Device Connected";
      case NotificationAction.AUTHENTICATION_FAILED:
        return "Connection Failed";
      default:
        return "Device Notification";
    }
  }

  // Handle WebSocket reconnection
  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff

      console.log(
        `Attempting to reconnect WebSocket in ${delay}ms (attempt ${this.reconnectAttempts})`
      );

      setTimeout(() => {
        this.initializeWebSocketConnection();
      }, delay);
    } else {
      console.error("Max WebSocket reconnection attempts reached");
    }
  }

  // Get WebSocket URL
  private getWebSocketUrl(): string {
    const apiUrl = getApiUrl(""); // Get base URL
    const wsUrl = apiUrl.replace(/^http/, "ws");
    return `${wsUrl}/messages`; // Adjust endpoint as needed
  }

  // Get authentication token
  private async getAuthToken(): Promise<string | null> {
    try {
      const { value } = await Preferences.get({ key: "auth_token" });
      return value;
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  }

  // Request notification permissions
  async requestNotificationPermissions(): Promise<boolean> {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return false;
  }

  // Clean up resources
  destroy() {
    this.wsConnection?.close();
    this.notificationCallbacks.clear();
    this.authenticationStates.clear();
  }
}

// Export singleton instance
export const userNotificationService = new UserNotificationService();
