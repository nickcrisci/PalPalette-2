import React, { useEffect, useState } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonFab,
  IonFabButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonText,
  IonChip,
  IonButton,
  IonSegment,
  IonSegmentButton,
} from "@ionic/react";
import { add, wifi, time, settings, bulb } from "ionicons/icons";
import { Device } from "../services/openapi/models/Device";
import { useDeveloperMode } from "../hooks/useDeveloperMode";
import {
  PairingCodeModal,
  DeviceSettingsModal,
  SetupWizardModal,
} from "../components/devices";
import {
  LightingSystemCard,
  LightingConfigSimple,
} from "../components/lighting";
import { DeviceAuthNotification } from "../components/notifications";
import { useDeviceManagement } from "../hooks/device";
import { useWebSocket } from "../hooks";
import { DeviceStatusEvent } from "../services/WebSocketService";

interface DeviceManagementProps {
  defaultView?: "devices" | "lighting" | "both";
  showViewSelector?: boolean;
  title?: string;
}

const DeviceManagement: React.FC<DeviceManagementProps> = ({
  defaultView = "both",
  showViewSelector = true,
  title = "Device Management",
}) => {
  const deviceManagement = useDeviceManagement();
  const { userNotifications, deviceStatuses } = useWebSocket();
  const { isDeveloperMode } = useDeveloperMode();
  const [viewMode, setViewMode] = useState<"devices" | "lighting">(
    defaultView === "both" ? "devices" : defaultView
  );

  const {
    devices,
    loading,
    refreshDevices,
    selectedDevice,
    authNotificationDevice,
    showPairingModal,
    showSettingsModal,
    showSetupWizard,
    showLightingModal,
    showAuthNotification,
    lastRefresh,
    handleDeviceClaimed,
    handleDeviceSettings,
    handleLightingConfig,
    handleDeviceReset,
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
  } = deviceManagement;

  // Handle real-time user notifications from WebSocket
  useEffect(() => {
    if (userNotifications.length > 0) {
      const latestNotification =
        userNotifications[userNotifications.length - 1];
      console.log("📢 Received user notification:", latestNotification);

      // Show authentication notification for device requiring user action
      setAuthNotificationDevice(
        devices.find((d) => d.id === latestNotification.deviceId) || null
      );
      setShowAuthNotification(true);
    }
  }, [
    userNotifications,
    devices,
    setAuthNotificationDevice,
    setShowAuthNotification,
  ]);

  useEffect(() => {
    refreshDevices();
  }, [refreshDevices]);

  const formatLastSeen = (lastSeenAt?: string) => {
    if (!lastSeenAt) return "Never";
    const lastSeen = new Date(lastSeenAt);
    const now = new Date();
    const diffMs = now.getTime() - lastSeen.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const DeviceCard: React.FC<{ device: Device }> = ({ device }) => {
    // Get real-time device status from WebSocket, fallback to stored device status
    const wsDeviceStatus = deviceStatuses.get(device.id);
    const isOnline = wsDeviceStatus?.isOnline ?? device.isOnline;

    // Use WebSocket timestamp for last seen if available, otherwise use device's lastSeenAt
    const lastSeenTime = wsDeviceStatus?.timestamp
      ? new Date(wsDeviceStatus.timestamp).toISOString()
      : device.lastSeenAt;

    return (
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                {device.name}
                <IonChip color={isOnline ? "success" : "medium"}>
                  <IonIcon icon={wifi} />
                  <IonLabel>{isOnline ? "Online" : "Offline"}</IonLabel>
                </IonChip>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {device.isProvisioned && (
                  <IonButton
                    fill="clear"
                    size="small"
                    onClick={() => handleLightingConfig(device)}
                  >
                    <IonIcon icon={bulb} />
                  </IonButton>
                )}
                <IonButton
                  fill="clear"
                  size="small"
                  onClick={() => handleDeviceSettings(device)}
                >
                  <IonIcon icon={settings} />
                </IonButton>
              </div>
            </div>
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonList>
            <IonItem lines="none">
              <IonLabel>
                <h3>Device Type</h3>
                <p>{device.type.toUpperCase()}</p>
              </IonLabel>
            </IonItem>

            {isDeveloperMode && device.macAddress && (
              <IonItem lines="none">
                <IonLabel>
                  <h3>MAC Address</h3>
                  <p>{device.macAddress}</p>
                </IonLabel>
              </IonItem>
            )}

            <IonItem lines="none">
              <IonLabel>
                <h3>Setup Status</h3>
                <p>
                  <IonBadge
                    color={device.isProvisioned ? "success" : "warning"}
                  >
                    {device.isProvisioned ? "Configured" : "Setup Required"}
                  </IonBadge>
                </p>
              </IonLabel>
            </IonItem>

            <IonItem lines="none">
              <IonIcon icon={time} slot="start" />
              <IonLabel>
                <h3>Last Seen</h3>
                <p>{formatLastSeen(lastSeenTime)}</p>
              </IonLabel>
            </IonItem>

            {/* Lighting System Integration */}
            {device.isProvisioned && (
              <IonItem lines="none">
                <IonLabel>
                  <h3>Lighting System</h3>
                </IonLabel>
              </IonItem>
            )}
          </IonList>

          {/* Add lighting system card for configured devices */}
          {device.isProvisioned && (
            <LightingSystemCard
              deviceId={device.id}
              onConfigureClick={() => handleLightingConfig(device)}
            />
          )}
        </IonCardContent>
      </IonCard>
    );
  };

  const LightingOverview: React.FC = () => (
    <div>
      {devices.filter((d) => d.isProvisioned).length === 0 ? (
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>No Configured Devices</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            Configure your devices first, then set up their lighting systems.
          </IonCardContent>
        </IonCard>
      ) : (
        <>
          {devices
            .filter((device) => device.isProvisioned)
            .map((device) => (
              <IonCard key={device.id}>
                <IonCardHeader>
                  <IonCardTitle>{device.name} - Lighting</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <LightingSystemCard
                    deviceId={device.id}
                    onConfigureClick={() => handleLightingConfig(device)}
                  />
                </IonCardContent>
              </IonCard>
            ))}
        </>
      )}
    </div>
  );

  const EmptyDevicesState: React.FC = () => (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>No Devices Found</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonText>
          <p>
            You haven't set up any devices yet. Tap the + button to get started
            with device setup.
          </p>
        </IonText>
        <IonButton
          expand="block"
          fill="outline"
          onClick={() => setShowSetupWizard(true)}
          style={{ marginTop: "16px" }}
        >
          Get Started
        </IonButton>
      </IonCardContent>
    </IonCard>
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{title}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <div className="ion-padding">
          {/* View Toggle - Only show if enabled and defaultView is 'both' */}
          {showViewSelector && defaultView === "both" && (
            <IonSegment
              value={viewMode}
              onIonChange={(e) =>
                setViewMode(e.detail.value as "devices" | "lighting")
              }
              style={{ marginBottom: "16px" }}
            >
              <IonSegmentButton value="devices">
                <IonLabel>All Devices</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="lighting">
                <IonLabel>Lighting Systems</IonLabel>
              </IonSegmentButton>
            </IonSegment>
          )}

          {loading && devices.length === 0 ? (
            <div style={{ textAlign: "center", marginTop: "50px" }}>
              <IonSpinner name="crescent" />
              <p>Loading devices...</p>
            </div>
          ) : devices.length === 0 ? (
            <EmptyDevicesState />
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <IonText>
                  <h2>
                    {viewMode === "devices"
                      ? "Your Devices"
                      : "Lighting Systems"}{" "}
                    ({devices.length})
                  </h2>
                </IonText>
                <IonText color="medium">
                  <small>
                    Last updated: {formatLastSeen(lastRefresh.toISOString())}
                  </small>
                </IonText>
              </div>

              {/* Render content based on view mode or defaultView */}
              {(defaultView === "devices" ||
                (defaultView === "both" && viewMode === "devices")) && (
                <>
                  {devices.map((device) => (
                    <DeviceCard key={device.id} device={device} />
                  ))}
                </>
              )}

              {(defaultView === "lighting" ||
                (defaultView === "both" && viewMode === "lighting")) && (
                <LightingOverview />
              )}
            </>
          )}
        </div>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setShowPairingModal(true)}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        {/* Modals */}
        <PairingCodeModal
          isOpen={showPairingModal}
          onClose={() => setShowPairingModal(false)}
          onDeviceClaimed={handleDeviceClaimed}
        />

        <DeviceSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          device={selectedDevice}
          onDeviceReset={handleDeviceReset}
        />

        <SetupWizardModal
          isOpen={showSetupWizard}
          onClose={() => setShowSetupWizard(false)}
        />

        {selectedDevice && (
          <LightingConfigSimple
            isOpen={showLightingModal}
            deviceId={selectedDevice.id}
            deviceName={selectedDevice.name}
            onClose={() => {
              setShowLightingModal(false);
              setSelectedDevice(null);
            }}
            onConfigured={() => {
              refreshDevices(); // Refresh to get updated lighting status
            }}
          />
        )}

        {authNotificationDevice && (
          <DeviceAuthNotification
            deviceId={authNotificationDevice.id}
            deviceName={authNotificationDevice.name}
            isVisible={showAuthNotification}
            onDismiss={() => {
              setShowAuthNotification(false);
              setAuthNotificationDevice(null);
            }}
            onSuccess={handleAuthSuccess}
            onFailed={handleAuthFailed}
          />
        )}
      </IonContent>
    </IonPage>
  );
};

export default DeviceManagement;
