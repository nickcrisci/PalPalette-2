import React, { useState, useEffect, useCallback } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonIcon,
  IonAlert,
  IonRefresher,
  IonRefresherContent,
  IonToast,
  IonText,
  IonNote,
  IonBackButton,
  IonButtons,
  IonSegment,
  IonSegmentButton,
} from "@ionic/react";
import {
  wifi,
  checkmarkCircle,
  timeOutline,
  linkOutline,
  refreshOutline,
  warningOutline,
} from "ionicons/icons";
import { DevicesService } from "../services/openapi/services/DevicesService";
import type { Device } from "../services/openapi/models/Device";
import { RefresherEventDetail } from "@ionic/core";

interface PairingAlert {
  isOpen: boolean;
  device: Device | null;
  pairingCode: string;
}

export const DeviceDiscovery: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isPairing, setIsPairing] = useState(false);
  const [discoveryMode, setDiscoveryMode] = useState<"local" | "global">(
    "local"
  );
  const [pairingAlert, setPairingAlert] = useState<PairingAlert>({
    isOpen: false,
    device: null,
    pairingCode: "",
  });
  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    color: string;
  }>({
    isOpen: false,
    message: "",
    color: "success",
  });

  const showToast = (message: string, color: string = "success") => {
    setToast({ isOpen: true, message, color });
  };

  const scanForDevices = useCallback(async () => {
    setIsScanning(true);
    try {
      console.log("🔍 Scanning for unpaired devices...");
      const response =
        await DevicesService.devicesControllerDiscoverUnpairedDevices();
      setDevices(response.devices || []);
      console.log(`📱 Found ${response.devices?.length || 0} devices`);
      if (!response.devices || response.devices.length === 0) {
        showToast(
          "No unpaired devices found. Make sure your device is powered on and connected to WiFi.",
          "warning"
        );
      } else {
        showToast(
          `Found ${response.devices.length} device(s) ready for pairing!`,
          "success"
        );
      }
    } catch (error) {
      console.error("Device discovery failed:", error);
      showToast(
        "Failed to scan for devices. Please check your connection and try again.",
        "danger"
      );
    } finally {
      setIsScanning(false);
    }
  }, []);

  const startPairing = (device: Device) => {
    console.log("🔗 Starting pairing for device:", device.name);

    if (discoveryMode === "local") {
      // Local network devices can be paired immediately without code
      pairDeviceDirectly(device);
    } else {
      // Global discovery requires pairing code
      setPairingAlert({
        isOpen: true,
        device,
        pairingCode: "",
      });
      console.log("🔗 Pairing alert state set, should show modal");
    }
  };

  const pairDeviceDirectly = async (device: Device) => {
    console.log(`🔗 Auto-pairing local device: ${device.name}`);
    setIsPairing(true);

    try {
      // Check if user is authenticated first
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.log(
          "⚠️ User not authenticated, falling back to manual pairing"
        );
        throw new Error("Please log in to pair devices");
      }

      // For local network devices, we can get the pairing code from the device
      const pairingInfo =
        await DevicesService.devicesControllerGetDevicePairingInfo(device.id);
      console.log("🔍 Pairing info received:", pairingInfo);

      console.log("🔗 Attempting claimByCode with:", {
        pairingCode: pairingInfo.pairingCode,
        deviceName: device.name,
      });

      await DevicesService.devicesControllerClaimByCode({
        pairingCode: pairingInfo.pairingCode,
        deviceName: device.name,
      });

      console.log("✅ Device pairing successful!");
      showToast(`Successfully paired ${device.name}!`, "success");

      // Refresh the device list
      setTimeout(() => {
        scanForDevices();
      }, 1000);
    } catch (error: unknown) {
      console.error("Auto-pairing failed:", error);

      // Log generic error information
      console.error("📍 Error details:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Auto-pairing failed. Please try manual pairing.";
      showToast(errorMessage, "danger");

      // Fall back to manual pairing
      setPairingAlert({
        isOpen: true,
        device,
        pairingCode: "",
      });
    } finally {
      setIsPairing(false);
    }
  };

  const completePairing = async () => {
    if (!pairingAlert.device || !pairingAlert.pairingCode.trim()) {
      showToast("Please enter a valid pairing code", "warning");
      return;
    }

    setIsPairing(true);
    try {
      console.log(`🔗 Attempting to pair device: ${pairingAlert.device.name}`);

      await DevicesService.devicesControllerClaimByCode({
        pairingCode: pairingAlert.pairingCode.trim().toUpperCase(),
        deviceName: pairingAlert.device.name,
      });

      // Success!
      setPairingAlert({ isOpen: false, device: null, pairingCode: "" });
      showToast(`Successfully paired ${pairingAlert.device.name}!`, "success");

      // Refresh the device list to remove the paired device
      setTimeout(() => {
        scanForDevices();
      }, 1000);
    } catch (error: unknown) {
      console.error("Pairing failed:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Pairing failed. Please check the code and try again.";
      showToast(errorMessage, "danger");
    } finally {
      setIsPairing(false);
    }
  };

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await scanForDevices();
    event.detail.complete();
  };

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    return date.toLocaleDateString();
  };

  const isPairingCodeExpired = (expires: string) => {
    return new Date(expires) < new Date();
  };

  useEffect(() => {
    scanForDevices();
  }, [scanForDevices]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/devices" />
          </IonButtons>
          <IonTitle>Add New Device</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {/* Instructions Card */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>🎨 Pair Your PalPalette Device</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {/* Discovery Mode Selector */}
            <IonSegment
              value={discoveryMode}
              onIonChange={(e) =>
                setDiscoveryMode(e.detail.value as "local" | "global")
              }
            >
              <IonSegmentButton value="local">
                <IonLabel>Local Network</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="global">
                <IonLabel>All Devices</IonLabel>
              </IonSegmentButton>
            </IonSegment>

            <IonText style={{ marginTop: "12px" }}>
              {discoveryMode === "local" ? (
                <div>
                  <p>
                    <strong>Local Network Discovery:</strong>
                  </p>
                  <ul>
                    <li>Finds devices on your WiFi network</li>
                    <li>Auto-pairs without requiring pairing code</li>
                    <li>More secure and convenient</li>
                  </ul>
                </div>
              ) : (
                <div>
                  <p>
                    <strong>Global Discovery:</strong>
                  </p>
                  <ul>
                    <li>Finds all unpaired devices registered with server</li>
                    <li>Requires pairing code for security</li>
                    <li>Useful if device is on different network</li>
                  </ul>
                </div>
              )}
            </IonText>

            <IonText>
              <p style={{ marginTop: "16px" }}>
                <strong>Setup Steps:</strong>
              </p>
              <ol>
                <li>Make sure your PalPalette device is powered on</li>
                <li>Wait for it to connect to your WiFi network</li>
                <li>Choose discovery mode above</li>
                <li>Tap "Scan for Devices" below</li>
                {discoveryMode === "global" && (
                  <li>Enter the pairing code when prompted</li>
                )}
              </ol>

              {discoveryMode === "global" && (
                <IonNote color="medium">
                  <strong>Finding your pairing code:</strong>
                  <br />
                  • Check the device's serial output/logs
                  <br />
                  • Or visit the device's IP address in a web browser
                  <br />• Or connect to its WiFi hotspot (if available)
                </IonNote>
              )}
            </IonText>

            <IonButton
              expand="block"
              onClick={scanForDevices}
              disabled={isScanning}
              style={{ marginTop: "16px" }}
            >
              <IonIcon icon={isScanning ? refreshOutline : wifi} slot="start" />
              {isScanning ? "Scanning..." : "Scan for Devices"}
              {isScanning && <IonSpinner slot="end" />}
            </IonButton>
          </IonCardContent>
        </IonCard>

        {/* Available Devices */}
        {devices.length > 0 && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                📱 Available Devices ({devices.length})
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                {devices.map((device) => {
                  const expired = isPairingCodeExpired(
                    device.pairingCodeExpiresAt
                  );

                  return (
                    <IonItem key={device.id}>
                      <IonIcon
                        icon={
                          expired
                            ? warningOutline
                            : device.status === "active"
                            ? checkmarkCircle
                            : timeOutline
                        }
                        color={
                          expired
                            ? "warning"
                            : device.status === "active"
                            ? "success"
                            : "medium"
                        }
                        slot="start"
                      />
                      <IonLabel>
                        <h2>{device.name}</h2>
                        <p>
                          <strong>IP:</strong> {device.ipAddress} •
                          <strong>MAC:</strong> ...{device.macAddress}
                        </p>
                        <p>
                          <strong>Firmware:</strong> {device.firmwareVersion}
                        </p>
                        <p>
                          <strong>Last seen:</strong>{" "}
                          {formatLastSeen(device.lastSeenAt)}
                        </p>
                        {expired && (
                          <IonNote color="warning">
                            <IonIcon icon={warningOutline} size="small" />
                            Pairing code expired - device needs restart
                          </IonNote>
                        )}
                      </IonLabel>
                      <IonButton
                        slot="end"
                        fill="outline"
                        disabled={expired || isPairing}
                        onClick={() => startPairing(device)}
                      >
                        <IonIcon icon={linkOutline} slot="start" />
                        {discoveryMode === "local" ? "Auto-Pair" : "Pair"}
                        {isPairing && <IonSpinner slot="end" />}
                      </IonButton>
                    </IonItem>
                  );
                })}
              </IonList>
            </IonCardContent>
          </IonCard>
        )}

        {/* No Devices Found */}
        {!isScanning && devices.length === 0 && (
          <IonCard>
            <IonCardContent style={{ textAlign: "center", padding: "32px" }}>
              <IonIcon
                icon={wifi}
                size="large"
                color="medium"
                style={{ marginBottom: "16px" }}
              />
              <h3>No devices found</h3>
              <IonText color="medium">
                <p>Make sure your PalPalette device is:</p>
                <ul
                  style={{
                    textAlign: "left",
                    maxWidth: "300px",
                    margin: "0 auto",
                  }}
                >
                  <li>Powered on and running</li>
                  <li>Connected to your WiFi network</li>
                  <li>Not already paired with another account</li>
                </ul>
              </IonText>
              <IonButton
                fill="clear"
                onClick={scanForDevices}
                style={{ marginTop: "16px" }}
              >
                <IonIcon icon={refreshOutline} slot="start" />
                Scan Again
              </IonButton>
            </IonCardContent>
          </IonCard>
        )}

        {/* Pairing Alert */}
        <IonAlert
          isOpen={pairingAlert.isOpen}
          onDidDismiss={() =>
            setPairingAlert({ isOpen: false, device: null, pairingCode: "" })
          }
          header="Enter Pairing Code"
          subHeader={
            pairingAlert.device
              ? `Pairing with ${pairingAlert.device.name}`
              : ""
          }
          message="Look for the 6-character pairing code on your device. You can find it in device serial logs, by visiting the device IP in your browser, or by connecting to the device WiFi hotspot if available."
          inputs={[
            {
              name: "pairingCode",
              type: "text",
              placeholder: "Enter 6-character code",
              value: pairingAlert.pairingCode,
              attributes: {
                maxlength: 6,
                style:
                  "text-transform: uppercase; text-align: center; font-size: 18px; letter-spacing: 2px;",
              },
            },
          ]}
          buttons={[
            {
              text: "Cancel",
              role: "cancel",
            },
            {
              text: isPairing ? "Pairing..." : "Pair Device",
              handler: async (data) => {
                if (!pairingAlert.device || !data.pairingCode.trim()) {
                  showToast("Please enter a valid pairing code", "warning");
                  return false; // Keep alert open
                }

                setIsPairing(true);
                try {
                  console.log(
                    `🔗 Attempting to pair device: ${pairingAlert.device.name}`
                  );

                  await DevicesService.devicesControllerClaimByCode({
                    pairingCode: data.pairingCode.trim().toUpperCase(),
                    deviceName: pairingAlert.device.name,
                  });

                  // Success!
                  setPairingAlert({
                    isOpen: false,
                    device: null,
                    pairingCode: "",
                  });
                  showToast(
                    `Successfully paired ${pairingAlert.device.name}!`,
                    "success"
                  );

                  // Refresh the device list
                  setTimeout(() => {
                    scanForDevices();
                  }, 1000);
                  return true; // Close the alert
                } catch (error: unknown) {
                  console.error("Pairing failed:", error);
                  const errorMessage =
                    error instanceof Error
                      ? error.message
                      : "Pairing failed. Please check the code and try again.";
                  showToast(errorMessage, "danger");
                  return false; // Keep alert open on error
                } finally {
                  setIsPairing(false);
                }
              },
            },
          ]}
        />

        {/* Toast Messages */}
        <IonToast
          isOpen={toast.isOpen}
          onDidDismiss={() => setToast({ ...toast, isOpen: false })}
          message={toast.message}
          duration={4000}
          color={toast.color}
          position="top"
        />
      </IonContent>
    </IonPage>
  );
};

export default DeviceDiscovery;
