import React, { useState } from "react";
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
  IonFab,
  IonFabButton,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
} from "@ionic/react";
import { add, refresh } from "ionicons/icons";
import { LightingSystemCard } from "../components/lighting";
import { LightingConfigSimple } from "../components/lighting";

interface Device {
  id: string;
  name: string;
  type: string;
  isOnline: boolean;
}

interface LightingSystemsPageProps {
  devices: Device[];
  onRefresh?: () => void;
}

const LightingSystemsPage: React.FC<LightingSystemsPageProps> = ({
  devices,
  onRefresh,
}) => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const handleConfigureDevice = (device: Device) => {
    setSelectedDevice(device);
    setShowConfigModal(true);
  };

  const handleCloseModal = () => {
    setShowConfigModal(false);
    setSelectedDevice(null);
  };

  const handleConfigured = () => {
    // Refresh the devices list or lighting status
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleRefresh = async (event: CustomEvent) => {
    if (onRefresh) {
      await onRefresh();
    }
    event.detail.complete();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Lighting Systems</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingIcon={refresh}
            refreshingSpinner="circles"
          />
        </IonRefresher>

        {devices.length === 0 ? (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>No Devices Found</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              Add friends and their devices to start configuring lighting
              systems.
            </IonCardContent>
          </IonCard>
        ) : (
          <>
            {devices.map((device) => (
              <div key={device.id} style={{ margin: "16px" }}>
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>{device.name}</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <LightingSystemCard
                      deviceId={device.id}
                      onConfigureClick={() => handleConfigureDevice(device)}
                    />
                  </IonCardContent>
                </IonCard>
              </div>
            ))}
          </>
        )}

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        {selectedDevice && (
          <LightingConfigSimple
            isOpen={showConfigModal}
            deviceId={selectedDevice.id}
            deviceName={selectedDevice.name}
            onClose={handleCloseModal}
            onConfigured={handleConfigured}
          />
        )}
      </IonContent>
    </IonPage>
  );
};

export default LightingSystemsPage;
