import { EventEmitter } from "events";
import { UserNotificationDto } from "./openapi/models/UserNotificationDto";

// WebSocket event types (not part of OpenAPI as they are runtime events)
export interface DeviceStatusEvent {
  deviceId: string;
  isOnline: boolean;
  timestamp: string;
  batteryLevel?: number;
  isProvisioned?: boolean;
  firmwareVersion?: string;
  ipAddress?: string;
  macAddress?: string;
  wifiRSSI?: number;
  freeHeap?: number;
  uptime?: number;
}

export interface LightingSystemStatusEvent {
  deviceId: string;
  isReady: boolean;
  hasLightingSystem: boolean;
  systemType?: string;
  status?: string;
  capabilities?: Record<string, unknown>;
}

export class WebSocketService extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectInterval: number = 5000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private url: string;
  private isConnected: boolean = false;

  constructor(baseUrl: string) {
    super();
    // Convert HTTP URL to WebSocket URL
    this.url = baseUrl.replace(/^http/, "ws") + "/ws";
  }

  connect(): void {
    // Prevent multiple connection attempts
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.CONNECTING ||
        this.ws.readyState === WebSocket.OPEN)
    ) {
      console.log(
        "🔌 WebSocket already connecting/connected, skipping duplicate connection attempt"
      );
      return;
    }

    console.log("🔌 Connecting to WebSocket:", this.url);

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log("✅ WebSocket connected");
        this.isConnected = true;
        this.emit("connected");

        // Clear any reconnection timer
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error("❌ Failed to parse WebSocket message:", error);
        }
      };

      this.ws.onclose = () => {
        console.log("🔌 WebSocket disconnected");
        this.isConnected = false;
        this.emit("disconnected");
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        // Don't emit error event to avoid unhandled error exceptions
        // The onclose event will handle the disconnect logic
      };
    } catch (error) {
      console.error("❌ Failed to create WebSocket connection:", error);
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.isConnected = false;
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return; // Already scheduled
    }

    console.log(
      `🔄 Scheduling WebSocket reconnection in ${this.reconnectInterval}ms`
    );
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, this.reconnectInterval);
  }

  private handleMessage(message: {
    event: string;
    data: Record<string, unknown>;
  }): void {
    console.log("📨 WebSocket message received:", message);

    switch (message.event) {
      case "userActionRequired":
        this.handleUserActionRequired(message.data);
        break;

      case "deviceStatus":
        this.handleDeviceStatus(message.data);
        break;

      case "lightingSystemStatus":
        this.handleLightingSystemStatus(message.data);
        break;

      default:
        console.log("📝 Unknown WebSocket event:", message.event);
        this.emit("message", message);
        break;
    }
  }

  private handleUserActionRequired(data: Record<string, unknown>): void {
    const notification: UserNotificationDto = {
      deviceId: data.deviceId as string,
      action: data.action as UserNotificationDto.action,
      message: (data.instructions as string) || "",
      instructions: data.instructions as string,
      timeout: data.timeout as number,
      timestamp: data.timestamp as number,
      additionalData: {
        deviceName: data.deviceName as string,
        systemType: data.systemType as string,
        displayMessage: data.displayMessage as string,
      },
    };

    console.log("🔔 User action required:", notification);
    this.emit("userActionRequired", notification);
  }

  private handleDeviceStatus(data: Record<string, unknown>): void {
    const status: DeviceStatusEvent = {
      deviceId: data.deviceId as string,
      isOnline: data.isOnline as boolean,
      isProvisioned: data.isProvisioned as boolean,
      firmwareVersion: data.firmwareVersion as string,
      ipAddress: data.ipAddress as string,
      macAddress: data.macAddress as string,
      wifiRSSI: data.wifiRSSI as number,
      freeHeap: data.freeHeap as number,
      uptime: data.uptime as number,
      timestamp: String(data.timestamp) || new Date().toISOString(),
    };

    console.log("📱 Device status update:", status);
    this.emit("deviceStatus", status);
  }

  private handleLightingSystemStatus(data: Record<string, unknown>): void {
    const status: LightingSystemStatusEvent = {
      deviceId: data.deviceId as string,
      hasLightingSystem: data.hasLightingSystem as boolean,
      isReady: data.isReady as boolean,
      systemType: data.systemType as string,
      status: data.status as string,
      capabilities: data.capabilities as Record<string, unknown>,
    };

    console.log("💡 Lighting system status update:", status);
    this.emit("lightingSystemStatus", status);
  }

  public isWebSocketConnected(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }

  // Send a message to the WebSocket server
  public send(message: Record<string, unknown>): boolean {
    if (!this.isWebSocketConnected()) {
      console.warn("⚠️ Cannot send message: WebSocket not connected");
      return false;
    }

    try {
      this.ws!.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error("❌ Failed to send WebSocket message:", error);
      return false;
    }
  }
}
