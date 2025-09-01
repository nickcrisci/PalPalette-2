import React, { useState, useEffect, useCallback, memo } from "react";
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
} from "../../services/LightingSystemService";
import { useLoading, useToast, useWebSocket } from "../../hooks";
import { useDeveloperMode } from "../../hooks/useDeveloperMode";
import { LightingSystemStatusEvent } from "../../services/WebSocketService";

interface LightingSystemCardProps {
  deviceId: string;
  onConfigureClick: () => void;
}

const LightingSystemCard: React.FC<LightingSystemCardProps> = memo(
  ({ deviceId, onConfigureClick }) => {
    const { loading, withLoading } = useLoading();
    const { isDeveloperMode } = useDeveloperMode();
    const { toastState, showSuccess, hideToast } = useToast();
    const { lightingStatuses } = useWebSocket();

    const [status, setStatus] = useState<LightingSystemStatus | null>(null);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    const loadStatus = useCallback(async () => {
      try {
        const lightingStatus =
          await LightingSystemService.getLightingSystemStatus(deviceId);
        setStatus(lightingStatus);
      } catch (error) {
        console.error("Error loading lighting status:", error);
        // Device might not have lighting configured yet, which is okay
      }
    }, [deviceId]);

    // Update status from WebSocket real-time updates
    useEffect(() => {
      const wsStatus = lightingStatuses.get(deviceId);
      if (wsStatus) {
        console.log("🔥 Updating lighting status from WebSocket:", wsStatus);

        // Map WebSocket status to our lighting status enum
        let lightingStatus:
          | "unknown"
          | "working"
          | "error"
          | "authentication_required" = "unknown";

        // If device is ready and has a lighting system, it's working
        if (wsStatus.isReady && wsStatus.hasLightingSystem) {
          lightingStatus = "working";
        } else if (wsStatus.status) {
          const statusLower = wsStatus.status.toLowerCase();
          if (
            statusLower.includes("connected") ||
            statusLower.includes("ready") ||
            statusLower.includes("working") ||
            statusLower.includes("success")
          ) {
            lightingStatus = "working";
          } else if (
            statusLower.includes("error") ||
            statusLower.includes("failed") ||
            statusLower.includes("timeout") ||
            statusLower.includes("invalid")
          ) {
            lightingStatus = "error";
          } else if (
            statusLower.includes("authentication") ||
            statusLower.includes("auth") ||
            statusLower.includes("unauthorized") ||
            statusLower.includes("token")
          ) {
            lightingStatus = "authentication_required";
          }
        }

        setStatus((prevStatus) => ({
          ...prevStatus!,
          lightingStatus,
          lightingSystemType:
            wsStatus.systemType || prevStatus?.lightingSystemType || "unknown",
          isReady: wsStatus.isReady || false,
          hasLightingSystem: wsStatus.hasLightingSystem || false,
          lightingSystemConfigured: wsStatus.hasLightingSystem || false,
          lastUpdated: new Date().toISOString(),
        }));
      }
    }, [lightingStatuses, deviceId]);

    useEffect(() => {
      loadStatus();
    }, [loadStatus]);

    const handleTest = async () => {
      try {
        await withLoading(LightingSystemService.testLightingSystem(deviceId));
        showSuccess("Test request sent to device!");
        // Refresh status after a delay
        setTimeout(loadStatus, 3000);
      } catch (error: unknown) {
        console.error("Error testing lighting system:", error);
        setAlertMessage("Failed to test lighting system");
        setShowAlert(true);
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
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
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
                    <p>
                      {LightingSystemService.getLightingSystemDisplayName(
                        status.lightingSystemType
                      )}
                    </p>
                  </IonLabel>
                </IonItem>

                <IonItem lines="none">
                  <IonLabel>
                    <h3>Status</h3>
                    <p>
                      <IonBadge
                        color={LightingSystemService.getStatusColor(
                          status.lightingStatus
                        )}
                      >
                        {LightingSystemService.getStatusDisplayText(
                          status.lightingStatus
                        )}
                      </IonBadge>
                    </p>
                  </IonLabel>
                </IonItem>

                {isDeveloperMode && status.lightingHostAddress && (
                  <IonItem lines="none">
                    <IonLabel>
                      <h3>Host Address</h3>
                      <p>
                        {status.lightingHostAddress}:{status.lightingPort}
                      </p>
                    </IonLabel>
                  </IonItem>
                )}

                {isDeveloperMode && status.lightingLastTestAt && (
                  <IonItem lines="none">
                    <IonLabel>
                      <h3>Last Tested</h3>
                      <p>
                        {new Date(status.lightingLastTestAt).toLocaleString()}
                      </p>
                    </IonLabel>
                  </IonItem>
                )}

                <div style={{ display: "flex", gap: "8px", marginTop: "1rem" }}>
                  {status.lightingSystemType !== "nanoleaf" && (
                    <IonButton
                      fill="outline"
                      size="small"
                      onClick={handleTest}
                      disabled={loading}
                    >
                      {loading ? <IonSpinner name="crescent" /> : "Test"}
                    </IonButton>
                  )}
                  <IonButton
                    fill="outline"
                    size="small"
                    onClick={onConfigureClick}
                  >
                    <IonIcon icon={settings} slot="start" />
                    {status.lightingSystemType === "nanoleaf"
                      ? "Re-authenticate"
                      : "Configure"}
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
          isOpen={toastState.isOpen}
          message={toastState.message}
          duration={toastState.duration}
          onDidDismiss={hideToast}
          color={toastState.color}
        />
      </>
    );
  }
);

LightingSystemCard.displayName = "LightingSystemCard";

export default LightingSystemCard;
