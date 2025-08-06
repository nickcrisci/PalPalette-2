import React, { useState } from "react";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonSpinner,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonAlert,
} from "@ionic/react";
import { checkmarkCircle, closeCircle, helpCircle } from "ionicons/icons";
import { useDevices } from "../../hooks/useContexts";

interface ClaimDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ClaimDeviceModal: React.FC<ClaimDeviceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [deviceId, setDeviceId] = useState("");
  const [setupSecret, setSetupSecret] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [isClaiming, setIsClaiming] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [claimResult, setClaimResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const { claimDevice } = useDevices();

  const handleClaim = async () => {
    if (!deviceId.trim() || !setupSecret.trim() || !deviceName.trim()) {
      setClaimResult({
        success: false,
        message: "Please fill in all fields",
      });
      return;
    }

    setIsClaiming(true);
    setClaimResult(null);

    try {
      const success = await claimDevice(
        deviceId.trim(),
        setupSecret.trim(),
        deviceName.trim()
      );

      if (success) {
        setClaimResult({
          success: true,
          message: "Device claimed successfully!",
        });
        // Clear form
        setDeviceId("");
        setSetupSecret("");
        setDeviceName("");
        // Close modal after a brief delay
        setTimeout(() => {
          onClose();
          setClaimResult(null);
        }, 2000);
      } else {
        setClaimResult({
          success: false,
          message:
            "Failed to claim device. Please check your device ID and setup secret.",
        });
      }
    } catch (error) {
      setClaimResult({
        success: false,
        message: "An error occurred while claiming the device.",
      });
    } finally {
      setIsClaiming(false);
    }
  };

  const handleClose = () => {
    setDeviceId("");
    setSetupSecret("");
    setDeviceName("");
    setClaimResult(null);
    onClose();
  };

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={handleClose}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Claim Device</IonTitle>
            <IonButton
              slot="end"
              fill="clear"
              onClick={() => setShowHelp(true)}
            >
              <IonIcon icon={helpCircle} />
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className="ion-padding">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Add Your Device</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonText color="medium">
                  <p>
                    Enter the device information to connect your PalPalette
                    controller to your account. You can find this information on
                    your device's display or setup screen.
                  </p>
                </IonText>
              </IonCardContent>
            </IonCard>

            <IonList>
              <IonItem>
                <IonLabel position="stacked">Device ID</IonLabel>
                <IonInput
                  value={deviceId}
                  onIonInput={(e) => setDeviceId(e.detail.value!)}
                  placeholder="e.g., test-device-001"
                  clearInput
                  disabled={isClaiming}
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Setup Secret</IonLabel>
                <IonInput
                  value={setupSecret}
                  onIonInput={(e) => setSetupSecret(e.detail.value!)}
                  placeholder="Enter setup secret from device"
                  clearInput
                  disabled={isClaiming}
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Device Name</IonLabel>
                <IonInput
                  value={deviceName}
                  onIonInput={(e) => setDeviceName(e.detail.value!)}
                  placeholder="e.g., Living Room Display"
                  clearInput
                  disabled={isClaiming}
                />
              </IonItem>
            </IonList>

            {claimResult && (
              <IonCard color={claimResult.success ? "success" : "danger"}>
                <IonCardContent>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <IonIcon
                      icon={claimResult.success ? checkmarkCircle : closeCircle}
                      style={{ marginRight: "8px" }}
                    />
                    <IonText>
                      <p style={{ margin: 0 }}>{claimResult.message}</p>
                    </IonText>
                  </div>
                </IonCardContent>
              </IonCard>
            )}

            <IonGrid>
              <IonRow>
                <IonCol>
                  <IonButton
                    expand="block"
                    fill="outline"
                    onClick={handleClose}
                    disabled={isClaiming}
                  >
                    Cancel
                  </IonButton>
                </IonCol>
                <IonCol>
                  <IonButton
                    expand="block"
                    onClick={handleClaim}
                    disabled={
                      isClaiming || !deviceId || !setupSecret || !deviceName
                    }
                  >
                    {isClaiming ? (
                      <>
                        <IonSpinner name="crescent" />
                        &nbsp; Claiming...
                      </>
                    ) : (
                      "Claim Device"
                    )}
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>
          </div>
        </IonContent>
      </IonModal>

      <IonAlert
        isOpen={showHelp}
        onDidDismiss={() => setShowHelp(false)}
        header="How to Find Device Information"
        message={`
          <strong>Device ID:</strong> Usually displayed on your device screen when it's in setup mode (e.g., "test-device-001").<br><br>
          
          <strong>Setup Secret:</strong> A unique code generated by your device during initial setup. This ensures only you can claim your device.<br><br>
          
          <strong>Device Name:</strong> A friendly name you choose to identify this device (e.g., "Kitchen Display", "Bedroom Light").
        `}
        buttons={["Got it"]}
      />
    </>
  );
};

export default ClaimDeviceModal;
