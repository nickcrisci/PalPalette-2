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
  IonAlert,
  IonNote,
} from "@ionic/react";
import {
  checkmarkCircle,
  closeCircle,
  helpCircle,
  keypadOutline,
} from "ionicons/icons";
import { useDevices } from "../../hooks/api";

interface PairingCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeviceClaimed: () => void;
}

const PairingCodeModal: React.FC<PairingCodeModalProps> = ({
  isOpen,
  onClose,
  onDeviceClaimed,
}) => {
  const {
    claimDevice,
    loading: devicesLoading,
    error: devicesError,
  } = useDevices(false);
  const [pairingCode, setPairingCode] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [isClaiming, setIsClaiming] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleClaim = async () => {
    if (!pairingCode.trim() || !deviceName.trim()) {
      setResult({
        success: false,
        message: "Please enter both pairing code and device name",
      });
      return;
    }

    const cleanCode = pairingCode.trim().toUpperCase();

    // Basic validation for pairing code format
    if (cleanCode.length !== 6 || !/^[A-Z0-9]+$/.test(cleanCode)) {
      setResult({
        success: false,
        message: "Pairing code must be 6 characters (letters and numbers)",
      });
      return;
    }

    setIsClaiming(true);
    setResult(null);

    try {
      const success = await claimDevice(cleanCode, deviceName.trim());
      if (success) {
        setResult({
          success: true,
          message: "Device claimed successfully!",
        });
        setPairingCode("");
        setDeviceName("");
        setTimeout(() => {
          onDeviceClaimed();
          onClose();
          setResult(null);
        }, 2000);
      } else {
        setResult({
          success: false,
          message:
            devicesError ||
            "Failed to claim device. Please check your pairing code.",
        });
      }
    } catch (error: any) {
      let message = "Failed to claim device";
      if (error?.status === 404) {
        message = "Invalid pairing code. Please check and try again.";
      } else if (error?.status === 400) {
        message =
          "Pairing code has expired. Please get a new code from your device.";
      } else if (error?.status === 409) {
        message = "This device is already claimed by another user.";
      } else if (error?.message) {
        message = error.message;
      }
      setResult({
        success: false,
        message,
      });
    } finally {
      setIsClaiming(false);
    }
  };

  const handleReset = () => {
    setPairingCode("");
    setDeviceName("");
    setResult(null);
  };

  const formatPairingCode = (value: string) => {
    // Only allow alphanumeric, max 6 characters
    const cleaned = value.replace(/[^A-Z0-9]/gi, "").toUpperCase();
    return cleaned.substring(0, 6);
  };

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={onClose}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Claim Device</IonTitle>
            <IonButton
              fill="clear"
              slot="end"
              onClick={onClose}
              disabled={isClaiming}
            >
              Close
            </IonButton>
          </IonToolbar>
        </IonHeader>

        <IonContent className="ion-padding">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={keypadOutline} /> Enter Pairing Code
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonText color="medium">
                <p>
                  Enter the 6-digit pairing code displayed on your device's
                  screen after it connects to WiFi.
                </p>
              </IonText>

              <IonItem>
                <IonLabel position="stacked">Pairing Code</IonLabel>
                <IonInput
                  value={pairingCode}
                  placeholder="ABC123"
                  onIonInput={(e) =>
                    setPairingCode(formatPairingCode(e.detail.value!))
                  }
                  maxlength={6}
                  disabled={isClaiming}
                  style={{
                    fontSize: "1.5em",
                    textAlign: "center",
                    letterSpacing: "0.2em",
                    fontFamily: "monospace",
                  }}
                />
                <IonNote slot="helper">
                  6 characters: letters and numbers
                </IonNote>
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Device Name</IonLabel>
                <IonInput
                  value={deviceName}
                  placeholder="Living Room Light"
                  onIonInput={(e) => setDeviceName(e.detail.value!)}
                  disabled={isClaiming}
                />
                <IonNote slot="helper">
                  Give your device a friendly name
                </IonNote>
              </IonItem>

              <IonGrid>
                <IonRow>
                  <IonCol>
                    <IonButton
                      expand="block"
                      onClick={handleClaim}
                      disabled={isClaiming || !pairingCode || !deviceName}
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

                <IonRow>
                  <IonCol size="6">
                    <IonButton
                      fill="outline"
                      expand="block"
                      onClick={handleReset}
                      disabled={isClaiming}
                    >
                      Reset
                    </IonButton>
                  </IonCol>
                  <IonCol size="6">
                    <IonButton
                      fill="outline"
                      expand="block"
                      onClick={() => setShowHelp(true)}
                      disabled={isClaiming}
                    >
                      <IonIcon icon={helpCircle} />
                      &nbsp; Help
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>

              {result && (
                <IonCard color={result.success ? "success" : "danger"}>
                  <IonCardContent>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <IonIcon
                        icon={result.success ? checkmarkCircle : closeCircle}
                        size="large"
                      />
                      <IonText>
                        <strong>{result.message}</strong>
                      </IonText>
                    </div>
                  </IonCardContent>
                </IonCard>
              )}

              <IonCard color="light">
                <IonCardContent>
                  <IonText color="medium" style={{ fontSize: "0.9em" }}>
                    <p>
                      <strong>💡 New Device Setup:</strong>
                    </p>
                    <p>
                      1. Connect to your device's WiFi network
                      (PalPalette-Setup-XXXXXX)
                      <br />
                      2. Configure WiFi through the setup page
                      <br />
                      3. Wait for device to connect and show pairing code
                      <br />
                      4. Enter the code above to claim your device
                    </p>
                  </IonText>
                </IonCardContent>
              </IonCard>
            </IonCardContent>
          </IonCard>
        </IonContent>
      </IonModal>

      <IonAlert
        isOpen={showHelp}
        onDidDismiss={() => setShowHelp(false)}
        header="Device Setup Help"
        message={`
          <strong>How to set up a new device:</strong><br/><br/>
          
          <strong>1. Power on your device</strong><br/>
          Your ESP32 device will create a WiFi network named "PalPalette-Setup-XXXXXX"<br/><br/>
          
          <strong>2. Connect to device WiFi</strong><br/>
          Use your phone's WiFi settings to connect to the device network<br/><br/>
          
          <strong>3. Configure WiFi</strong><br/>
          A setup page will open automatically. Enter your home WiFi credentials<br/><br/>
          
          <strong>4. Wait for connection</strong><br/>
          The device will connect to your WiFi and register with our servers<br/><br/>
          
          <strong>5. Get pairing code</strong><br/>
          The device will display a 6-digit code on its screen or LED indicators<br/><br/>
          
          <strong>6. Claim device</strong><br/>
          Enter the pairing code here to add the device to your account<br/><br/>
          
          <strong>Need more help?</strong><br/>
          Check the device manual or contact support.
        `}
        buttons={["Got it!"]}
      />
    </>
  );
};

export default PairingCodeModal;
