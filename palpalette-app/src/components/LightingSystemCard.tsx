import React, { useState, useEffect, useCallback } from "react";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonBadge,
  IonItem,
  IonLabel,
  IonSpinner,
  IonAlert,
  IonToast,
} from "@ionic/react";
import { bulb, settings, flash } from "ionicons/icons";
import {
  LightingSystemService,
  LightingSystemStatus,
} from "../services/LightingSystemService";

interface LightingSystemCardProps {
  deviceId: string;
  onConfigureClick: () => void;
}

const LightingSystemCard: React.FC<LightingSystemCardProps> = ({
  deviceId,
  onConfigureClick,
}) => {
  const [status, setStatus] = useState<LightingSystemStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const lightingStatus = await LightingSystemService.getLightingSystemStatus(deviceId);
      setStatus(lightingStatus);
    } catch (error) {
      console.error("Error loading lighting status:", error);
      // Device might not have lighting configured yet, which is okay
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleTest = async () => {
    setLoading(true);
    try {
      const result = await LightingSystemService.testLightingSystem(deviceId);
      if (result.deviceConnected) {
        setToastMessage("Test request sent to device!");
        setShowToast(true);
        // Refresh status after a delay
        setTimeout(loadStatus, 3000);
      } else {
        setAlertMessage("Device is not connected");
        setShowAlert(true);
      }
    } catch (error: unknown) {
      console.error("Error testing lighting system:", error);
      setAlertMessage("Failed to test lighting system");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const getSystemIcon = (systemType?: string) => {
    switch (systemType) {
      case "nanoleaf":
        return bulb;
      case "wled":
        return flash;
      case "ws2812":
        return flash;
      default:
        return bulb;
    }
  };

  if (loading && !status) {
    return (
      <IonCard>
        <IonCardContent style={{ textAlign: "center", padding: "2rem" }}>
          <IonSpinner name="crescent" />
          <p>Loading lighting system...</p>
        </IonCardContent>
      </IonCard>
    );
  }

  return (
    <>
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <IonIcon icon={getSystemIcon(status?.lightingSystemType)} />
              Lighting System
            </div>
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          {status ? (
            <>
              <IonItem lines="none">
                <IonLabel>
                  <h3>System Type</h3>
                  <p>{LightingSystemService.getLightingSystemDisplayName(status.lightingSystemType)}</p>
                </IonLabel>
              </IonItem>

              <IonItem lines="none">
                <IonLabel>
                  <h3>Status</h3>
                  <p>
                    <IonBadge color={LightingSystemService.getStatusColor(status.lightingStatus)}>
                      {LightingSystemService.getStatusDisplayText(status.lightingStatus)}
                    </IonBadge>
                  </p>
                </IonLabel>
              </IonItem>

              {status.lightingHostAddress && (
                <IonItem lines="none">
                  <IonLabel>
                    <h3>Host Address</h3>
                    <p>{status.lightingHostAddress}:{status.lightingPort}</p>
                  </IonLabel>
                </IonItem>
              )}

              {status.lightingLastTestAt && (
                <IonItem lines="none">
                  <IonLabel>
                    <h3>Last Tested</h3>
                    <p>{new Date(status.lightingLastTestAt).toLocaleString()}</p>
                  </IonLabel>
                </IonItem>
              )}

              <div style={{ display: "flex", gap: "8px", marginTop: "1rem" }}>
                <IonButton
                  fill="outline"
                  size="small"
                  onClick={handleTest}
                  disabled={loading}
                >
                  {loading ? <IonSpinner name="crescent" /> : "Test"}
                </IonButton>
                <IonButton
                  fill="outline"
                  size="small"
                  onClick={onConfigureClick}
                >
                  <IonIcon icon={settings} slot="start" />
                  Configure
                </IonButton>
              </div>
            </>
          ) : (
            <>
              <p>No lighting system configured for this device.</p>
              <IonButton
                expand="block"
                onClick={onConfigureClick}
                color="primary"
              >
                <IonIcon icon={settings} slot="start" />
                Setup Lighting System
              </IonButton>
            </>
          )}
        </IonCardContent>
      </IonCard>

      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header="Error"
        message={alertMessage}
        buttons={["OK"]}
      />

      <IonToast
        isOpen={showToast}
        message={toastMessage}
        duration={3000}
        onDidDismiss={() => setShowToast(false)}
        color="success"
      />
    </>
  );
};

export default LightingSystemCard;
