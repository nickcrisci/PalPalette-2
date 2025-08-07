import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  Inject,
  forwardRef,
} from "@nestjs/common";
import * as WebSocket from "ws";
import { createServer } from "http";
import { DevicesService } from "../devices/devices.service";

@Injectable()
export class DeviceWebSocketService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DeviceWebSocketService.name);
  private wss: WebSocket.Server;
  private deviceConnections = new Map<string, WebSocket>(); // Database UUID -> WebSocket
  private server: any;

  constructor(
    @Inject(forwardRef(() => DevicesService))
    private readonly devicesService: DevicesService
  ) {}

  async onApplicationBootstrap() {
    // Initialize after the application starts instead of using setTimeout
    this.initializeServer();
  }

  private initializeServer() {
    try {
      this.logger.log(
        "🚀 Initializing Device WebSocket server for ESP32 devices..."
      );

      // Create HTTP server first
      this.server = createServer();

      // Create WebSocket server
      this.wss = new WebSocket.Server({
        server: this.server,
        path: "/ws",
      });

      this.wss.on("connection", (ws: WebSocket, request) => {
        const clientIP = request.socket.remoteAddress || "unknown";
        this.logger.log(`ESP32 WebSocket client connected from: ${clientIP}`);

        // Handle ping frames (heartbeats) - this updates lastSeenAt
        ws.on("ping", async (data) => {
          this.logger.debug(`💓 Ping received from ${clientIP}`);

          // Find the device associated with this WebSocket
          let deviceId = null;
          for (const [id, connection] of this.deviceConnections.entries()) {
            if (connection === ws) {
              deviceId = id;
              break;
            }
          }

          if (deviceId) {
            try {
              // Update lastSeenAt in database
              await this.updateDeviceLastSeen(deviceId);
              this.logger.debug(
                `💓 Updated lastSeenAt for device: ${deviceId}`
              );
            } catch (error) {
              this.logger.error(
                `❌ Failed to update lastSeenAt for device ${deviceId}: ${error.message}`
              );
            }
          }

          // Send pong response (WebSocket auto-responds, but we can log it)
          this.logger.debug(`🏓 Pong sent to ${clientIP}`);
        });

        ws.on("message", (data: WebSocket.Data) => {
          try {
            const message = JSON.parse(data.toString());
            this.handleMessage(ws, message);
          } catch (error) {
            this.logger.error(`JSON parse error: ${error.message}`);
            ws.send(JSON.stringify({ error: "Invalid JSON" }));
          }
        });

        ws.on("close", () => {
          this.logger.log(
            `ESP32 WebSocket client disconnected from: ${clientIP}`
          );
          this.removeDeviceConnection(ws);
        });

        ws.on("error", (error) => {
          this.logger.error(
            `WebSocket error from ${clientIP}: ${error.message}`
          );
        });
      });

      // Listen on all interfaces (important for Docker)
      this.server.listen(3001, "0.0.0.0", () => {
        this.logger.log("✅ Raw WebSocket server listening on 0.0.0.0:3001");
        this.logger.log("🔌 ESP32 devices can connect to ws://YOUR_IP:3001/ws");
      });

      this.server.on("error", (error: any) => {
        if (error.code === "EADDRINUSE") {
          this.logger.error(
            `❌ Port 3001 is already in use. Retrying in 5 seconds...`
          );
          setTimeout(() => this.initializeServer(), 5000);
        } else {
          this.logger.error(`❌ Server error: ${error.message}`);
        }
      });
    } catch (error) {
      this.logger.error(
        `❌ Failed to start WebSocket server: ${error.message}`
      );
      this.logger.error(`Stack trace: ${error.stack}`);
    }
  }

  private async handleMessage(ws: WebSocket, message: any) {
    this.logger.log("Received message:", message);

    if (message.event === "registerDevice") {
      const { deviceId } = message.data;

      this.logger.log(`🔍 Device registration request for: ${deviceId}`);

      // Determine if this is an ESP32 device ID or database UUID
      let esp32DeviceId: string;
      let databaseUuid: string;

      if (deviceId.startsWith("esp32-")) {
        // Device sent ESP32 format ID
        esp32DeviceId = deviceId;
        databaseUuid = null; // Will be looked up in updateDeviceMapping
        this.logger.debug(`📱 Device using ESP32 format ID: ${esp32DeviceId}`);
      } else {
        // Device sent database UUID - need to derive ESP32 ID from MAC
        databaseUuid = deviceId;

        try {
          // Look up device in database to get MAC address
          const response = await fetch(
            `http://localhost:3000/devices/${databaseUuid}`
          );
          if (response.ok) {
            const device = await response.json();
            // Convert MAC address to ESP32 device ID format
            // MAC "B0:81:84:05:FF:98" -> ESP32 ID "esp32-b0818405ff98"
            const macHex = device.macAddress.replace(/:/g, "").toLowerCase();
            esp32DeviceId = `esp32-${macHex}`;
            this.logger.debug(
              `🔄 Converted UUID ${databaseUuid} to ESP32 ID: ${esp32DeviceId}`
            );
          } else {
            this.logger.error(`❌ Failed to lookup device ${databaseUuid}`);
            return;
          }
        } catch (error) {
          this.logger.error(
            `❌ Error looking up device ${databaseUuid}: ${error.message}`
          );
          return;
        }
      }

      // Check if device was previously connected
      if (
        this.deviceConnections.has(esp32DeviceId) ||
        this.deviceConnections.has(databaseUuid)
      ) {
        this.logger.log(`Device was already registered, updating connection`);
      }

      // Register WebSocket connection with ESP32 device ID (this is the primary key)
      this.deviceConnections.set(esp32DeviceId, ws);
      this.logger.log(
        `✅ Device registered: ${esp32DeviceId} (Total connected: ${this.deviceConnections.size})`
      );

      // If we have the database UUID, also register under that for backwards compatibility
      if (databaseUuid) {
        this.deviceConnections.set(databaseUuid, ws);
        this.logger.log(
          `✅ Device also registered under UUID: ${databaseUuid}`
        );
      }

      // Find and cache the database UUID for this ESP32 device ID
      await this.updateDeviceMapping(esp32DeviceId);

      // Send pending lighting configuration if any
      await this.sendPendingLightingConfig(esp32DeviceId);

      ws.send(
        JSON.stringify({
          event: "deviceRegistered",
          data: { deviceId: esp32DeviceId, status: "registered" },
        })
      );
    } else if (message.event === "completeSetup") {
      this.handleSetupCompletion(ws, message.data);
    } else if (message.event === "lightingSystemStatus") {
      this.handleLightingSystemStatus(ws, message.data);
    } else if (message.event === "deviceStatus") {
      this.handleDeviceStatus(ws, message.data);
    } else if (message.event === "lightingSystemTest") {
      this.handleLightingSystemTest(ws, message.data);
    } else if (message.event === "userActionRequired") {
      this.handleUserActionRequired(ws, message.data);
    } else if (message.event === "user_action_required") {
      // Handle legacy format as well
      this.handleUserActionRequired(ws, message.data);
    } else {
      this.logger.warn(`Unknown message event: ${message.event}`);
    }
  }

  private async sendPendingLightingConfig(deviceId: string): Promise<void> {
    // This method would check if there's pending lighting configuration
    // for the device and send it if needed
    this.logger.debug(
      `Checking for pending lighting config for device: ${deviceId}`
    );
  }

  private async updateDeviceMapping(esp32DeviceId: string): Promise<void> {
    try {
      this.logger.debug(
        `Looking up database UUID for ESP32 device: ${esp32DeviceId}`
      );

      // Find device in database by MAC address (extracted from ESP32 device ID)
      // ESP32 device ID format: "esp32-b0818405ff98" -> MAC: "b0:81:84:05:ff:98"
      const macAddress = esp32DeviceId
        .replace("esp32-", "")
        .match(/.{2}/g)
        ?.join(":")
        .toUpperCase();

      if (!macAddress) {
        this.logger.error(
          `Cannot extract MAC address from ESP32 device ID: ${esp32DeviceId}`
        );
        return;
      }

      this.logger.debug(`Extracted MAC address: ${macAddress}`);

      // Find device by MAC address
      const response = await fetch(
        `http://localhost:3000/devices/by-mac/${encodeURIComponent(macAddress)}`
      );

      if (response.ok) {
        const device = await response.json();
        const databaseUuid = device.id;

        // Create bidirectional mapping
        this.deviceIdMapping.set(databaseUuid, esp32DeviceId);
        this.logger.log(
          `✅ Device mapping created: ${databaseUuid} -> ${esp32DeviceId}`
        );
      } else {
        this.logger.warn(`Device with MAC ${macAddress} not found in database`);
      }
    } catch (error) {
      this.logger.error(`Error updating device mapping: ${error.message}`);
    }
  }

  private async updateDeviceLastSeen(deviceId: string): Promise<void> {
    try {
      let macAddress: string;

      // Check if deviceId is an ESP32 format (esp32-xxxxxx) or a UUID
      if (deviceId.startsWith("esp32-")) {
        // Extract MAC address from ESP32 device ID
        // esp32DeviceId format: "esp32-b0818405ff98" -> MAC: "B0:81:84:05:FF:98"
        const macHex = deviceId.replace("esp32-", "");

        if (macHex.length !== 12) {
          this.logger.error(
            `Invalid ESP32 device ID format: ${deviceId}, expected 12 hex chars after 'esp32-'`
          );
          return;
        }

        macAddress = macHex.match(/.{2}/g)?.join(":").toUpperCase();

        if (!macAddress) {
          this.logger.error(
            `Cannot extract MAC address from ESP32 device ID: ${deviceId}`
          );
          return;
        }

        this.logger.debug(
          `🔍 Extracted MAC address: ${macAddress} from ESP32 device ID: ${deviceId}`
        );
      } else {
        // Assume it's a database UUID, look up the device directly
        this.logger.debug(
          `🔍 Device ID appears to be UUID, updating directly: ${deviceId}`
        );

        try {
          const updateResponse = await fetch(
            `http://localhost:3000/devices/${deviceId}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                lastSeenAt: new Date().toISOString(),
              }),
            }
          );

          if (updateResponse.ok) {
            this.logger.debug(
              `✅ Updated lastSeenAt for device UUID: ${deviceId}`
            );
          } else {
            this.logger.error(
              `❌ Failed to update lastSeenAt for UUID ${deviceId}: ${await updateResponse.text()}`
            );
          }
          return;
        } catch (error) {
          this.logger.error(
            `❌ Failed to update lastSeenAt for UUID ${deviceId}: ${error.message}`
          );
          return;
        }
      }

      // Update device lastSeenAt via HTTP API
      const response = await fetch(
        `http://localhost:3000/devices/by-mac/${encodeURIComponent(macAddress)}`
      );

      if (response.ok) {
        const device = await response.json();

        // Update lastSeenAt
        const updateResponse = await fetch(
          `http://localhost:3000/devices/${device.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              lastSeenAt: new Date().toISOString(),
            }),
          }
        );

        if (updateResponse.ok) {
          this.logger.debug(`✅ Updated lastSeenAt for device: ${deviceId}`);
        } else {
          this.logger.error(
            `❌ Failed to update lastSeenAt: ${await updateResponse.text()}`
          );
        }
      } else {
        this.logger.warn(
          `Device with MAC ${macAddress} not found for lastSeenAt update`
        );
      }
    } catch (error) {
      this.logger.error(
        `❌ Failed to update lastSeenAt for device ${deviceId}: ${error.message}`
      );
    }
  }

  private async handleSetupCompletion(ws: WebSocket, data: any) {
    this.logger.log("Handling setup completion:", data);

    try {
      // Forward to HTTP API for setup completion
      const response = await fetch(
        `http://localhost:3000/devices/setup-complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        const result = await response.json();

        // Send confirmation back to device
        ws.send(
          JSON.stringify({
            event: "setupComplete",
            data: {
              status: "completed",
              deviceId: data.deviceId,
            },
          })
        );

        this.logger.log(`Setup completed for device: ${data.deviceId}`);
      } else {
        this.logger.error(`Setup completion failed: ${await response.text()}`);

        ws.send(
          JSON.stringify({
            event: "setupError",
            data: {
              status: "failed",
              deviceId: data.deviceId,
            },
          })
        );
      }
    } catch (error) {
      this.logger.error(`Setup completion error: ${error.message}`);

      ws.send(
        JSON.stringify({
          event: "setupError",
          data: {
            status: "error",
            deviceId: data.deviceId,
          },
        })
      );
    }
  }

  private async handleUserActionRequired(ws: WebSocket, data: any) {
    const {
      deviceId,
      action,
      instructions,
      timeout,
      type,
      systemType,
      displayMessage,
    } = data;

    try {
      const device = await this.devicesService.findOne(deviceId);
      if (!device) {
        this.logger.error(`Device not found for user action: ${deviceId}`);
        return;
      }

      // Create notification for the user
      const notification = {
        deviceId,
        deviceName: device.name,
        action,
        instructions,
        timeout,
        type: type || "user_action_required",
        systemType: systemType || "unknown",
        displayMessage: displayMessage || instructions,
        timestamp: Date.now(),
      };

      this.logger.log(
        `🔔 User action required for device ${deviceId} (${device.name}): ${action}`
      );
      this.logger.log(`📝 Instructions: ${instructions}`);
      this.logger.log(`⏰ Timeout: ${timeout} seconds`);

      if (systemType) {
        this.logger.log(`🔧 System Type: ${systemType}`);
      }

      // TODO: Implement real-time notification service to send to user's browser
      // For now, store in database or cache for HTTP API to retrieve
      this.logger.debug("Full notification data:", notification);
    } catch (error) {
      this.logger.error("Error handling user action required:", error);
    }
  }

  private async handleDeviceStatus(ws: WebSocket, data: any) {
    this.logger.log("📱 Handling device status update:", data);

    try {
      const {
        deviceId,
        isOnline,
        isProvisioned,
        firmwareVersion,
        ipAddress,
        macAddress,
        wifiRSSI,
        freeHeap,
        uptime,
      } = data;

      // Update device status via HTTP API
      const updateData = {
        isOnline: isOnline !== undefined ? isOnline : true,
        lastSeenAt: new Date(),
        firmwareVersion,
        ipAddress,
        wifiRSSI,
        systemStats: {
          freeHeap,
          uptime,
          lastUpdate: new Date(),
        },
      };

      const response = await fetch(
        `http://localhost:3000/devices/${deviceId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (response.ok) {
        this.logger.log(`✅ Device status updated for: ${deviceId}`);
        this.logger.log(`📡 IP: ${ipAddress}, RSSI: ${wifiRSSI}dBm`);
        this.logger.log(`💾 Free Heap: ${freeHeap}B, Uptime: ${uptime}s`);

        // Send acknowledgment back to device
        ws.send(
          JSON.stringify({
            event: "deviceStatusAck",
            data: {
              deviceId: deviceId,
              status: "received",
            },
          })
        );
      } else {
        this.logger.error(
          `❌ Device status update failed: ${await response.text()}`
        );
      }
    } catch (error) {
      this.logger.error(`❌ Device status update error: ${error.message}`);
    }
  }

  private async handleLightingSystemStatus(ws: WebSocket, data: any) {
    this.logger.log("📊 Handling lighting system status update:", data);

    try {
      const {
        deviceId,
        hasLightingSystem,
        isReady,
        systemType,
        status,
        capabilities,
      } = data;

      // Map lighting status to enum values
      let mappedStatus = "unknown"; // default

      if (status) {
        const statusLower = status.toLowerCase();
        if (
          statusLower.includes("connected") ||
          statusLower.includes("responding") ||
          statusLower.includes("on") ||
          statusLower === "working"
        ) {
          mappedStatus = "working";
        } else if (
          statusLower.includes("auth") &&
          (statusLower.includes("no") || statusLower.includes("false"))
        ) {
          mappedStatus = "authentication_required";
        } else if (
          statusLower.includes("error") ||
          statusLower.includes("failed") ||
          statusLower.includes("disconnected") ||
          statusLower.includes("not responding")
        ) {
          mappedStatus = "error";
        } else if (statusLower === "unknown") {
          mappedStatus = "unknown";
        } else {
          // If status contains any positive indicators, assume working
          if (
            statusLower.includes("ready") ||
            statusLower.includes("yes") ||
            statusLower.includes("success")
          ) {
            mappedStatus = "working";
          } else {
            mappedStatus = "error"; // default to error for unrecognized status
          }
        }
      } else if (isReady !== undefined) {
        mappedStatus = isReady ? "working" : "error";
      }

      // Update lighting system status via HTTP API
      const updateData: any = {
        lightingSystemConfigured: hasLightingSystem || false,
        lightingSystemType: systemType || null,
        lightingStatus: mappedStatus,
      };

      // Note: lightingCapabilities is not part of UpdateLightingSystemDto, so we don't include it

      const response = await fetch(
        `http://localhost:3000/devices/${deviceId}/lighting`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (response.ok) {
        this.logger.log(
          `✅ Lighting system status updated for device: ${deviceId}`
        );
        this.logger.log(`🔧 System Type: ${systemType || "none"}`);
        this.logger.log(
          `📊 Raw Status: ${status || "none"}, Mapped: ${mappedStatus}`
        );
        this.logger.log(`🚦 Ready: ${isReady ? "Yes" : "No"}`);

        // Send acknowledgment back to device
        ws.send(
          JSON.stringify({
            event: "lightingStatusAck",
            data: {
              deviceId: deviceId,
              status: "received",
            },
          })
        );
      } else {
        this.logger.error(
          `❌ Lighting system status update failed: ${await response.text()}`
        );
      }
    } catch (error) {
      this.logger.error(
        `❌ Lighting system status update error: ${error.message}`
      );
    }
  }

  private async handleLightingSystemTest(ws: WebSocket, data: any) {
    this.logger.log("Handling lighting system test result:", data);

    try {
      // Update lighting system test result via HTTP API
      const response = await fetch(
        `http://localhost:3000/devices/${data.deviceId}/lighting`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lightingStatus: data.success ? "working" : "error",
            lightingLastTestAt: new Date(),
          }),
        }
      );

      if (response.ok) {
        this.logger.log(
          `Lighting system test result updated for device: ${data.deviceId}`
        );

        // Send acknowledgment back to device
        ws.send(
          JSON.stringify({
            event: "lightingTestAck",
            data: {
              deviceId: data.deviceId,
              testResult: data.success ? "passed" : "failed",
            },
          })
        );
      } else {
        this.logger.error(
          `Lighting test result update failed: ${await response.text()}`
        );
      }
    } catch (error) {
      this.logger.error(`Lighting test result update error: ${error.message}`);
    }
  }

  private removeDeviceConnection(ws: WebSocket) {
    const devicesToRemove: string[] = [];

    // Find all device IDs associated with this WebSocket
    for (const [deviceId, socket] of this.deviceConnections.entries()) {
      if (socket === ws) {
        devicesToRemove.push(deviceId);
      }
    }

    // Remove all found connections
    for (const deviceId of devicesToRemove) {
      this.deviceConnections.delete(deviceId);
      this.logger.log(`🗑️ Removed device connection: ${deviceId}`);
    }

    // Also clean up device ID mapping
    for (const [
      databaseUuid,
      esp32DeviceId,
    ] of this.deviceIdMapping.entries()) {
      if (
        devicesToRemove.includes(esp32DeviceId) ||
        devicesToRemove.includes(databaseUuid)
      ) {
        this.deviceIdMapping.delete(databaseUuid);
        this.logger.log(
          `🗑️ Removed device mapping: ${databaseUuid} -> ${esp32DeviceId}`
        );
      }
    }

    if (devicesToRemove.length > 0) {
      this.logger.log(
        `🗑️ Removed ${devicesToRemove.length} device connection(s) (Total remaining: ${this.deviceConnections.size})`
      );
    }
  }

  sendColorPaletteToDevice(deviceId: string, palette: any): boolean {
    this.logger.debug(
      `Attempting to send color palette to device: ${deviceId}`
    );
    this.logger.debug(
      `Currently connected devices: ${Array.from(
        this.deviceConnections.keys()
      ).join(", ")}`
    );

    // Check if this is a database UUID that needs to be mapped to ESP32 device ID
    let targetDeviceId = deviceId;
    if (this.deviceIdMapping.has(deviceId)) {
      targetDeviceId = this.deviceIdMapping.get(deviceId);
      this.logger.debug(
        `🔄 Mapped database UUID ${deviceId} to ESP32 device ID: ${targetDeviceId}`
      );
    }

    const ws = this.deviceConnections.get(targetDeviceId);

    if (ws && ws.readyState === WebSocket.OPEN) {
      const message = {
        event: "colorPalette",
        messageId: palette.messageId,
        senderId: palette.senderId,
        senderName: palette.senderName,
        colors: palette.colors,
        timestamp: palette.timestamp || Date.now(),
      };

      ws.send(JSON.stringify(message));
      this.logger.log(
        `Color palette sent to device: ${deviceId} (ESP32: ${targetDeviceId})`
      );
      return true;
    }

    if (ws) {
      this.logger.warn(
        `Device ${targetDeviceId} WebSocket connection state: ${ws.readyState} (expected: ${WebSocket.OPEN})`
      );
    } else {
      this.logger.warn(`Device ${targetDeviceId} not found in connections map`);
    }

    this.logger.warn(`Device ${deviceId} not connected`);
    return false;
  }

  notifyDeviceClaimed(deviceId: string, claimData: any): boolean {
    this.logger.debug(`🔍 Attempting to notify device ${deviceId} of claim`);
    this.logger.debug(
      `Currently connected devices: ${Array.from(
        this.deviceConnections.keys()
      ).join(", ")}`
    );

    // Try to find device connection - deviceId could be either ESP32 ID or database UUID
    let ws = this.deviceConnections.get(deviceId);
    let actualDeviceId = deviceId;

    if (!ws) {
      // If not found directly, check if deviceId is an ESP32 format and we need to find the UUID
      if (deviceId.startsWith("esp32-")) {
        // Find the corresponding UUID in deviceIdMapping
        for (const [databaseUuid, esp32Id] of this.deviceIdMapping.entries()) {
          if (esp32Id === deviceId) {
            ws = this.deviceConnections.get(databaseUuid);
            actualDeviceId = databaseUuid;
            this.logger.debug(
              `🔄 Found device by ESP32 ID mapping: ${deviceId} -> ${databaseUuid}`
            );
            break;
          }
        }
      } else {
        // deviceId is likely a UUID, check if we have a reverse mapping to ESP32 ID
        const esp32Id = this.deviceIdMapping.get(deviceId);
        if (esp32Id) {
          ws = this.deviceConnections.get(esp32Id);
          actualDeviceId = esp32Id;
          this.logger.debug(
            `🔄 Found device by UUID mapping: ${deviceId} -> ${esp32Id}`
          );
        }
      }
    }

    if (ws && ws.readyState === WebSocket.OPEN) {
      const message = {
        event: "deviceClaimed",
        data: {
          setupToken: claimData.setupToken,
          userEmail: claimData.userEmail,
          userName: claimData.userName,
        },
      };

      ws.send(JSON.stringify(message));
      this.logger.log(
        `✅ Device claimed notification sent to ${actualDeviceId} (original ID: ${deviceId})`
      );
      return true;
    }

    if (ws) {
      this.logger.warn(
        `Device ${actualDeviceId} WebSocket connection state: ${ws.readyState} (expected: ${WebSocket.OPEN})`
      );
    } else {
      this.logger.warn(
        `Device ${deviceId} not found in connections. Available devices: ${
          Array.from(this.deviceConnections.keys()).join(", ") || "none"
        }`
      );
    }

    this.logger.warn(`Device ${deviceId} not connected for claim notification`);
    return false;
  }

  getConnectedDevices(): string[] {
    const connectedDevices = Array.from(this.deviceConnections.keys());
    this.logger.debug(
      `Currently connected devices: ${connectedDevices.join(", ") || "none"}`
    );
    return connectedDevices;
  }

  sendLightingSystemConfig(deviceId: string, config: any): boolean {
    const ws = this.deviceConnections.get(deviceId);

    if (ws && ws.readyState === WebSocket.OPEN) {
      // Create the base message data
      const messageData: any = {
        systemType: config.lightingSystemType,
      };

      // For Nanoleaf, only include host/port if they're actually provided
      // Otherwise let the controller use mDNS discovery
      if (config.lightingSystemType === "nanoleaf") {
        // Only include host address if it's a valid value
        if (
          config.lightingHostAddress &&
          config.lightingHostAddress !== "null" &&
          config.lightingHostAddress.trim() !== ""
        ) {
          messageData.hostAddress = config.lightingHostAddress;
          messageData.port = config.lightingPort || 16021; // Nanoleaf default port
        }
        // Always include auth token if available
        if (config.lightingAuthToken) {
          messageData.authToken = config.lightingAuthToken;
        }
      } else {
        // For other systems (WLED, WS2812), include all fields
        messageData.hostAddress = config.lightingHostAddress;
        messageData.port = config.lightingPort;
        messageData.authToken = config.lightingAuthToken;
      }

      // Include custom config if available
      if (config.lightingCustomConfig) {
        messageData.customConfig = config.lightingCustomConfig;
      }

      const message = {
        event: "lightingSystemConfig",
        data: messageData,
      };

      ws.send(JSON.stringify(message));
      this.logger.log(`Lighting system config sent to device: ${deviceId}`);
      this.logger.debug(`Config data: ${JSON.stringify(messageData)}`);
      return true;
    }

    this.logger.warn(`Device ${deviceId} not connected for lighting config`);
    return false;
  }

  requestLightingSystemTest(deviceId: string): boolean {
    this.logger.debug(
      `Attempting to send lighting test to device: ${deviceId}`
    );
    this.logger.debug(
      `Currently connected devices: ${Array.from(
        this.deviceConnections.keys()
      ).join(", ")}`
    );

    const ws = this.deviceConnections.get(deviceId);

    if (ws && ws.readyState === WebSocket.OPEN) {
      const message = {
        event: "testLightingSystem",
        data: {
          deviceId: deviceId,
          timestamp: Date.now(),
        },
      };

      ws.send(JSON.stringify(message));
      this.logger.log(`Lighting system test requested for device: ${deviceId}`);
      return true;
    }

    if (ws) {
      this.logger.warn(
        `Device ${deviceId} WebSocket connection state: ${ws.readyState} (expected: ${WebSocket.OPEN})`
      );
    } else {
      this.logger.warn(`Device ${deviceId} not found in connections map`);
    }

    this.logger.warn(`Device ${deviceId} not connected for lighting test`);
    return false;
  }
}
