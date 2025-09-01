import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
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
} from "@ionic/react";
import { wifi, time, settings, bulb, add } from "ionicons/icons";
import { useDevices } from "../hooks/useContexts";
import { Device } from "../services/openapi/models/Device";
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

const Devices: React.FC = () => {
  const history = useHistory();
  const { devices, loading, refreshDevices, resetDevice } = useDevices();
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [showPairingModal, setShowPairingModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [showLightingModal, setShowLightingModal] = useState(false);
  const [showAuthNotification, setShowAuthNotification] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [authNotificationDevice, setAuthNotificationDevice] =
    useState<Device | null>(null);

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

  const formatLastSeen = (lastSeenAt?: string) => {
    if (!lastSeenAt) return "Never";

    const now = new Date();
    const lastSeen = new Date(lastSeenAt);
    const diff = now.getTime() - lastSeen.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
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
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {device.name}
              <IonChip color={device.isOnline ? "success" : "medium"}>
                <IonIcon icon={wifi} />
                <IonLabel>{device.isOnline ? "Online" : "Offline"}</IonLabel>
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
        </IonList>

        {/* Add lighting system card for configured devices */}
        {device.isProvisioned && (
          <div style={{ marginTop: "16px" }}>
            <LightingSystemCard
              deviceId={device.id}
              onConfigureClick={() => handleLightingConfig(device)}
            />
          </div>
        )}
      </IonCardContent>
    </IonCard>
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>My Devices</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <div className="ion-padding">
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
              </IonGrid>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: "20px" }}>
                <IonText color="medium">
                  <p>Last updated: {lastRefresh.toLocaleTimeString()}</p>
                </IonText>
              </div>
              {devices.map((device) => (
                <DeviceCard key={device.id} device={device} />
              ))}
            </>
          )}
        </div>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => history.push("/devices/discover")}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

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

export default Devices;
