import React, { useState, useEffect } from "react";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonList,
  IonButtons,
  IonIcon,
  IonNote,
  IonSpinner,
  IonAlert,
  IonToast,
} from "@ionic/react";
import { close, checkmark } from "ionicons/icons";
import {
  LightingSystemService,
  LightingSystemConfig,
  TestResult,
} from "../services/LightingSystemService";

interface LightingConfigSimpleProps {
  isOpen: boolean;
  deviceId: string;
  deviceName: string;
  onClose: () => void;
  onConfigured: () => void;
}

type LightingSystemType = "nanoleaf" | "wled" | "ws2812";

const LightingConfigSimple: React.FC<LightingConfigSimpleProps> = ({
  isOpen,
  deviceId,
  deviceName,
  onClose,
  onConfigured,
}) => {
  const [systemType, setSystemType] = useState<LightingSystemType | "">("");
  const [ipAddress, setIpAddress] = useState("");
  const [port, setPort] = useState("80");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const resetForm = () => {
    setSystemType("");
    setIpAddress("");
    setPort("80");
    setApiKey("");
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isFormValid = () => {
    if (!systemType || !ipAddress) return false;
    
    switch (systemType) {
      case "nanoleaf":
        return apiKey.length > 0;
      case "wled":
        return true; // WLED doesn't require API key
      case "ws2812":
        return true; // WS2812 basic config
      default:
        return false;
    }
  };

  const buildConfiguration = (): LightingSystemConfig => {
    const config: LightingSystemConfig = {
      lightingSystemType: systemType as LightingSystemType,
      lightingHostAddress: ipAddress,
      lightingPort: parseInt(port) || 80,
    };

    if (systemType === "nanoleaf" && apiKey) {
      config.lightingAuthToken = apiKey;
    }

    return config;
  };

  const handleTestConnection = async () => {
    if (!isFormValid()) {
      setAlertMessage("Please fill in all required fields first.");
      setShowAlert(true);
      return;
    }

    setTestingConnection(true);
    try {
      // First configure, then test
      const config = buildConfiguration();
      await LightingSystemService.configureLightingSystem(deviceId, config);
      
      const result = await LightingSystemService.testLightingSystem(deviceId);

      if (result.testRequested && result.deviceConnected) {
        setToastMessage("Connection test successful!");
        setShowToast(true);
      } else {
        setAlertMessage("Connection test failed. Please check your settings.");
        setShowAlert(true);
      }
    } catch (error) {
      console.error("Test error:", error);
      setAlertMessage("Failed to test connection. Please check your settings.");
      setShowAlert(true);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSave = async () => {
    if (!isFormValid()) {
      setAlertMessage("Please fill in all required fields.");
      setShowAlert(true);
      return;
    }

    setLoading(true);
    try {
      const config = buildConfiguration();
      await LightingSystemService.configureLightingSystem(deviceId, config);

      setToastMessage("Lighting system configured successfully!");
      setShowToast(true);
      
      // Wait a moment for user to see the success message
      setTimeout(() => {
        onConfigured();
        handleClose();
      }, 1500);
    } catch (error) {
      console.error("Configuration error:", error);
      setAlertMessage("Failed to save configuration. Please try again.");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const getSystemDescription = (type: LightingSystemType) => {
    switch (type) {
      case "nanoleaf":
        return "Nanoleaf panels with API access";
      case "wled":
        return "WLED-compatible LED strips";
      case "ws2812":
        return "Direct WS2812 LED control";
      default:
        return "";
    }
  };

  const getRequiredFields = (type: LightingSystemType) => {
    switch (type) {
      case "nanoleaf":
        return ["IP Address", "API Key"];
      case "wled":
        return ["IP Address"];
      case "ws2812":
        return ["IP Address"];
      default:
        return [];
    }
  };

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={handleClose}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Configure Lighting</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={handleClose}>
                <IonIcon icon={close} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList>
            <IonItem>
              <IonLabel position="stacked">Device</IonLabel>
              <IonNote>{deviceName}</IonNote>
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Lighting System Type</IonLabel>
              <IonSelect
                value={systemType}
                placeholder="Select lighting system"
                onIonChange={(e) => setSystemType(e.detail.value)}
              >
                <IonSelectOption value="nanoleaf">Nanoleaf</IonSelectOption>
                <IonSelectOption value="wled">WLED</IonSelectOption>
                <IonSelectOption value="ws2812">WS2812</IonSelectOption>
              </IonSelect>
              {systemType && (
                <IonNote>{getSystemDescription(systemType as LightingSystemType)}</IonNote>
              )}
            </IonItem>

            {systemType && (
              <>
                <IonItem>
                  <IonLabel position="stacked">IP Address *</IonLabel>
                  <IonInput
                    value={ipAddress}
                    placeholder="192.168.1.100"
                    onIonInput={(e) => setIpAddress(e.detail.value!)}
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Port</IonLabel>
                  <IonInput
                    value={port}
                    placeholder="80"
                    type="number"
                    onIonInput={(e) => setPort(e.detail.value!)}
                  />
                </IonItem>

                {systemType === "nanoleaf" && (
                  <IonItem>
                    <IonLabel position="stacked">API Key *</IonLabel>
                    <IonInput
                      value={apiKey}
                      placeholder="Enter your Nanoleaf API key"
                      onIonInput={(e) => setApiKey(e.detail.value!)}
                    />
                    <IonNote>
                      Hold the power button on your Nanoleaf for 5-7 seconds before connecting
                    </IonNote>
                  </IonItem>
                )}

                <IonItem>
                  <IonLabel>
                    <h3>Required Fields</h3>
                    <IonNote>
                      {getRequiredFields(systemType as LightingSystemType).join(", ")}
                    </IonNote>
                  </IonLabel>
                </IonItem>
              </>
            )}
          </IonList>

          {systemType && (
            <div style={{ padding: "16px" }}>
              <IonButton
                expand="block"
                fill="outline"
                onClick={handleTestConnection}
                disabled={!isFormValid() || testingConnection}
              >
                {testingConnection ? <IonSpinner name="crescent" /> : "Test Connection"}
              </IonButton>

              <IonButton
                expand="block"
                onClick={handleSave}
                disabled={!isFormValid() || loading}
                style={{ marginTop: "8px" }}
              >
                {loading ? <IonSpinner name="crescent" /> : "Save Configuration"}
                {!loading && <IonIcon icon={checkmark} slot="end" />}
              </IonButton>
            </div>
          )}
        </IonContent>
      </IonModal>

      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header="Configuration"
        message={alertMessage}
        buttons={["OK"]}
      />

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        color="success"
      />
    </>
  );
};

export default LightingConfigSimple;
