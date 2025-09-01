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
  IonGrid,
  IonRow,
  IonCol,
  IonSegment,
  IonSegmentButton,
} from "@ionic/react";
import { add, wifi, time, settings, bulb } from "ionicons/icons";
import { useDevices } from "../hooks/useContexts";
import { Device } from "../services/openapi/models/Device";
import { PairingCodeModal } from "../components/devices";
import { DeviceSettingsModal } from "../components/devices";
import { SetupWizardModal } from "../components/devices";
import { LightingSystemCard } from "../components/lighting";
import { LightingConfigSimple } from "../components/lighting";
import { DeviceAuthNotification } from "../components/notifications";
import { useDeviceNotifications } from "../hooks/useDeviceNotifications";

const DevicesWithLighting: React.FC = () => {
  const { devices, loading, refreshDevices, resetDevice } = useDevices();
  const { authenticatingDevices } = useDeviceNotifications();
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [showPairingModal, setShowPairingModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [showLightingModal, setShowLightingModal] = useState(false);
  const [showAuthNotification, setShowAuthNotification] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [authNotificationDevice, setAuthNotificationDevice] =
    useState<Device | null>(null);
  const [viewMode, setViewMode] = useState<"devices" | "lighting">("devices");

  useEffect(() => {
    refreshDevices();
  }, [refreshDevices]);

  const handleRefresh = async (event: CustomEvent) => {
    await refreshDevices();
    setLastRefresh(new Date());
    event.detail.complete();
  };

  const handleDeviceClaimed = () => {
    refreshDevices();
  };

  const handleDeviceSettings = (device: Device) => {
    setSelectedDevice(device);
    setShowSettingsModal(true);
  };

  const handleLightingConfig = (device: Device) => {
    setSelectedDevice(device);
    setShowLightingModal(true);
  };

  const handleDeviceReset = async (deviceId: string) => {
    await resetDevice(deviceId);
    setShowSettingsModal(false);
    setSelectedDevice(null);
  };

  const handleStartLightingAuth = (device: Device) => {
    setAuthNotificationDevice(device);
    setShowAuthNotification(true);
    // Close any other modals
    setShowLightingModal(false);
    setSelectedDevice(null);
  };

  const handleAuthSuccess = () => {
    refreshDevices(); // Refresh to get updated lighting status
  };

  const handleAuthFailed = () => {
    // Could show an error message or retry options
    console.log("Lighting authentication failed");
  };

  const formatLastSeen = (lastSeenAt: string | undefined | null): string => {
    if (!lastSeenAt) return "Never";
    const lastSeen = new Date(lastSeenAt);
    const now = new Date();
    const diffMinutes = Math.floor(
      (now.getTime() - lastSeen.getTime()) / (1000 * 60)
    );

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
    return `${Math.floor(diffMinutes / 1440)} days ago`;
  };

  const DeviceCard: React.FC<{ device: Device }> = ({ device }) => (
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
              <IonChip color={device.isOnline ? "success" : "medium"}>
                <IonIcon icon={wifi} />
                <IonLabel>{device.isOnline ? "Online" : "Offline"}</IonLabel>
              </IonChip>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <IonButton
                fill="clear"
                size="small"
                onClick={() => handleLightingConfig(device)}
              >
                <IonIcon icon={bulb} />
              </IonButton>
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

          {device.macAddress && (
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
                <IonBadge color={device.isProvisioned ? "success" : "warning"}>
                  {device.isProvisioned ? "Configured" : "Setup Required"}
                </IonBadge>
              </p>
            </IonLabel>
          </IonItem>

          <IonItem lines="none">
            <IonIcon icon={time} slot="start" />
            <IonLabel>
              <h3>Last Seen</h3>
              <p>{formatLastSeen(device.lastSeenAt)}</p>
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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Devices & Lighting</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <div className="ion-padding">
          {/* View Toggle */}
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

          {loading && devices.length === 0 ? (
            <div style={{ textAlign: "center", marginTop: "50px" }}>
              <IonSpinner name="crescent" />
              <p>Loading devices...</p>
            </div>
          ) : devices.length === 0 ? (
            <div style={{ textAlign: "center", marginTop: "50px" }}>
              <IonText color="medium">
                <h2>No devices found</h2>
                <p>Set up your first PalPalette device!</p>
              </IonText>
              <IonGrid>
                <IonRow>
                  <IonCol>
                    <IonButton
                      expand="block"
                      onClick={() => setShowSetupWizard(true)}
                    >
                      Setup New Device
                    </IonButton>
                  </IonCol>
                </IonRow>
                <IonRow>
                  <IonCol>
                    <IonButton
                      expand="block"
                      fill="outline"
                      onClick={() => setShowPairingModal(true)}
                    >
                      I Have a Pairing Code
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: "20px" }}>
                <IonText color="medium">
                  <p>Last updated: {lastRefresh.toLocaleTimeString()}</p>
                </IonText>
              </div>

              {viewMode === "devices" ? (
                <>
                  {devices.map((device) => (
                    <DeviceCard key={device.id} device={device} />
                  ))}
                </>
              ) : (
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

export default DevicesWithLighting;
