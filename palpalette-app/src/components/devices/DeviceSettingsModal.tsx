import React, { useState } from "react";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonModal,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonAlert,
  IonItem,
  IonLabel,
  IonList,
  IonBadge,
  IonNote,
  IonToast,
} from "@ionic/react";
import {
  settingsOutline,
  trashOutline,
  informationCircleOutline,
  wifiOutline,
  timeOutline,
} from "ionicons/icons";
import { Device } from "../../services/openapi/models/Device";
import { useLoading, useToast } from "../../hooks";

interface DeviceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: Device | null;
  onDeviceReset: (deviceId: string) => Promise<void>;
}

const DeviceSettingsModal: React.FC<DeviceSettingsModalProps> = ({
  isOpen,
  onClose,
  device,
  onDeviceReset,
}) => {
  const { loading, withLoading } = useLoading();
  const { toastState, showSuccess, showError, hideToast } = useToast();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = async () => {
    if (!device) return;

    try {
      await withLoading(onDeviceReset(device.id));
      showSuccess(
        "Device reset successfully! It can now be paired with a new account."
      );
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error: any) {
      // OpenAPI errors may be plain Error or ApiError
      let message = "Failed to reset device";
      if (error?.status === 404) {
        message = "Device not found. It may have already been reset.";
      } else if (error?.status === 403) {
        message = "You don't have permission to reset this device.";
      } else if (error?.message) {
        message = error.message;
      }
      showError(message);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  if (!device) return null;

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={onClose}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Device Settings</IonTitle>
            <IonButton
              fill="clear"
              slot="end"
              onClick={onClose}
              disabled={loading}
            >
              Close
            </IonButton>
          </IonToolbar>
        </IonHeader>

        <IonContent className="ion-padding">
          {/* Device Information */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={informationCircleOutline} /> Device Information
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                <IonItem>
                  <IonLabel>
                    <h3>Device Name</h3>
                    <p>{device.name}</p>
                  </IonLabel>
                </IonItem>

                <IonItem>
                  <IonLabel>
                    <h3>Device Type</h3>
                    <p>{device.type.toUpperCase()}</p>
                  </IonLabel>
                </IonItem>

                <IonItem>
                  <IonLabel>
                    <h3>Status</h3>
                    <p>
                      <IonBadge color={device.isOnline ? "success" : "medium"}>
                        {device.isOnline ? "Online" : "Offline"}
                      </IonBadge>{" "}
                      <IonBadge
                        color={device.isProvisioned ? "success" : "warning"}
                      >
                        {device.isProvisioned ? "Configured" : "Setup Required"}
                      </IonBadge>
                    </p>
                  </IonLabel>
                </IonItem>

                {device.macAddress && (
                  <IonItem>
                    <IonLabel>
                      <h3>MAC Address</h3>
                      <p style={{ fontFamily: "monospace" }}>
                        {device.macAddress}
                      </p>
                    </IonLabel>
                  </IonItem>
                )}

                {device.ipAddress && (
                  <IonItem>
                    <IonIcon icon={wifiOutline} slot="start" />
                    <IonLabel>
                      <h3>IP Address</h3>
                      <p style={{ fontFamily: "monospace" }}>
                        {device.ipAddress}
                      </p>
                    </IonLabel>
                  </IonItem>
                )}

                <IonItem>
                  <IonIcon icon={timeOutline} slot="start" />
                  <IonLabel>
                    <h3>Last Seen</h3>
                    <p>{formatDate(device.lastSeenAt)}</p>
                  </IonLabel>
                </IonItem>

                <IonItem>
                  <IonLabel>
                    <h3>Added</h3>
                    <p>{formatDate(device.createdAt)}</p>
                  </IonLabel>
                </IonItem>
              </IonList>
            </IonCardContent>
          </IonCard>

          {/* Device Actions */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={settingsOutline} /> Device Actions
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonGrid>
                <IonRow>
                  <IonCol>
                    <IonButton
                      expand="block"
                      fill="outline"
                      color="danger"
                      onClick={() => setShowResetConfirm(true)}
                      disabled={loading}
                    >
                      <IonIcon icon={trashOutline} slot="start" />
                      Reset Device
                    </IonButton>
                    <IonNote>
                      <small>
                        Removes device from your account. Device will need to be
                        re-paired.
                      </small>
                    </IonNote>
                  </IonCol>
                </IonRow>
              </IonGrid>

              {loading && (
                <div style={{ textAlign: "center", marginTop: "16px" }}>
                  <IonSpinner name="crescent" />
                  <p>Resetting device...</p>
                </div>
              )}
            </IonCardContent>
          </IonCard>
        </IonContent>
      </IonModal>

      <IonToast
        isOpen={toastState.isOpen}
        message={toastState.message}
        duration={toastState.duration}
        onDidDismiss={hideToast}
        color={toastState.color}
      />

      <IonAlert
        isOpen={showResetConfirm}
        onDidDismiss={() => setShowResetConfirm(false)}
        header="Reset Device"
        message={`
          Are you sure you want to reset "${device.name}"?<br/><br/>
          
          <strong>This will:</strong><br/>
          • Remove the device from your account<br/>
          • Generate a new pairing code<br/>
          • Allow the device to be paired with a different account<br/><br/>
          
          <strong>You will need to:</strong><br/>
          • Set up the device again if you want to use it<br/>
          • Enter a new pairing code to reclaim it<br/><br/>
          
          This action cannot be undone.
        `}
        buttons={[
          {
            text: "Cancel",
            role: "cancel",
            cssClass: "secondary",
          },
          {
            text: "Reset Device",
            role: "destructive",
            handler: handleReset,
          },
        ]}
      />
    </>
  );
};

export default DeviceSettingsModal;
