import React, { useState, useEffect, useCallback } from "react";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonItem,
  IonLabel,
  IonInput,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSpinner,
  IonAlert,
  IonBadge,
  IonText,
  IonIcon,
  IonList,
  IonAccordion,
  IonAccordionGroup,
  IonRange,
  IonProgressBar,
  IonToast,
} from "@ionic/react";
import {
  checkmark,
  close,
  warning,
  wifi,
  bulb,
  flash,
  refresh,
} from "ionicons/icons";
import {
  LightingSystemService,
  LightingSystemConfig,
  LightingSystemStatus,
  SupportedSystemsResponse,
} from "../services/LightingSystemService";

interface CustomConfig {
  ledPin?: number;
  ledCount?: number;
  brightness?: number;
  port?: number;
  [key: string]: unknown;
}

interface LightingConfigModalProps {
  isOpen: boolean;
  onDidDismiss: () => void;
  deviceId: string;
  deviceName: string;
  onConfigComplete?: () => void;
}

const LightingConfigModal: React.FC<LightingConfigModalProps> = ({
  isOpen,
  onDidDismiss,
  deviceId,
  deviceName,
  onConfigComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [supportedSystems, setSupportedSystems] = useState<SupportedSystemsResponse | null>(null);
  const [currentStatus, setCurrentStatus] = useState<LightingSystemStatus | null>(null);
  const [config, setConfig] = useState<LightingSystemConfig>({
    lightingSystemType: "ws2812",
    lightingHostAddress: "",
    lightingPort: 80,
    lightingAuthToken: "",
    lightingCustomConfig: {},
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [testResult, setTestResult] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load supported systems and current status in parallel
      const [systems, status] = await Promise.all([
        LightingSystemService.getSupportedSystems(),
        LightingSystemService.getLightingSystemStatus(deviceId).catch(() => null),
      ]);

      setSupportedSystems(systems);
      setCurrentStatus(status);

      // If device has existing config, populate form
      if (status) {
        setConfig({
          lightingSystemType: status.lightingSystemType as any,
          lightingHostAddress: status.lightingHostAddress || "",
          lightingPort: status.lightingPort || 80,
          lightingAuthToken: "",
          lightingCustomConfig: {},
        });

        // Load default config for the current system type
        if (status.lightingSystemType) {
          const defaultConfig = await LightingSystemService.getDefaultConfig(
            status.lightingSystemType
          );
          setConfig((prev) => ({
            ...prev,
            lightingCustomConfig: defaultConfig,
          }));
        }
      }
    } catch (error) {
      console.error("Error loading lighting data:", error);
      setAlertMessage("Failed to load lighting system data");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSystemTypeChange = async (systemType: string) => {
    setConfig((prev) => ({ ...prev, lightingSystemType: systemType as any }));

    // Load default configuration for selected system
    try {
      const defaultConfig = await LightingSystemService.getDefaultConfig(systemType);
      setConfig((prev) => ({
        ...prev,
        lightingPort: defaultConfig.port || 80,
        lightingCustomConfig: defaultConfig,
      }));
    } catch (error) {
      console.error("Error loading default config:", error);
    }
  };

  const handleConfigureSystem = async () => {
    setLoading(true);
    try {
      await LightingSystemService.configureLightingSystem(deviceId, config);
      setToastMessage("Lighting system configured successfully!");
      setShowToast(true);
      setCurrentStep(2); // Move to test step
    } catch (error: any) {
      console.error("Error configuring lighting system:", error);
      setAlertMessage(error.response?.data?.message || "Failed to configure lighting system");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setLoading(true);
    setTestResult(null);
    try {
      const result = await LightingSystemService.testLightingSystem(deviceId);
      
      if (result.deviceConnected) {
        setTestResult("Test request sent to device. Check device status for results.");
        setToastMessage("Test request sent successfully!");
        setShowToast(true);
        
        // Wait a moment then refresh status
        setTimeout(async () => {
          try {
            const updatedStatus = await LightingSystemService.getLightingSystemStatus(deviceId);
            setCurrentStatus(updatedStatus);
          } catch (error) {
            console.error("Error refreshing status:", error);
          }
        }, 3000);
      } else {
        setTestResult("Device is not connected. Please ensure device is online.");
      }
    } catch (error: any) {
      console.error("Error testing lighting system:", error);
      setTestResult(error.response?.data?.message || "Failed to test lighting system");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    onConfigComplete?.();
    onDidDismiss();
  };

  const renderSystemSelection = () => (
    <div>
      <IonText>
        <h2>Select Lighting System</h2>
        <p>Choose the type of lighting hardware connected to your device.</p>
      </IonText>

      {supportedSystems?.systems.map((systemType) => (
        <IonCard
          key={systemType}
          button
          color={config.lightingSystemType === systemType ? "primary" : ""}
          onClick={() => handleSystemTypeChange(systemType)}
        >
          <IonCardContent>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <IonIcon
                icon={systemType === "nanoleaf" ? bulb : systemType === "wled" ? wifi : flash}
                size="large"
              />
              <div>
                <h3>{LightingSystemService.getLightingSystemDisplayName(systemType)}</h3>
                <p>
                  {systemType === "nanoleaf" && "Aurora, Canvas, and Shapes panels"}
                  {systemType === "wled" && "ESP32/ESP8266 with WLED firmware"}
                  {systemType === "ws2812" && "Direct-connected LED strips"}
                </p>
              </div>
              {config.lightingSystemType === systemType && (
                <IonIcon icon={checkmark} color="primary" />
              )}
            </div>
          </IonCardContent>
        </IonCard>
      ))}

      <IonButton
        expand="block"
        onClick={() => setCurrentStep(1)}
        disabled={!config.lightingSystemType}
      >
        Next: Configuration
      </IonButton>
    </div>
  );

  const renderConfiguration = () => (
    <div>
      <IonText>
        <h2>Configure {LightingSystemService.getLightingSystemDisplayName(config.lightingSystemType)}</h2>
        <p>Enter the configuration details for your lighting system.</p>
      </IonText>

      <IonList>
        {(config.lightingSystemType === "nanoleaf" || config.lightingSystemType === "wled") && (
          <>
            <IonItem>
              <IonLabel position="stacked">IP Address *</IonLabel>
              <IonInput
                value={config.lightingHostAddress}
                placeholder="192.168.1.100"
                onIonInput={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    lightingHostAddress: e.detail.value!,
                  }))
                }
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Port</IonLabel>
              <IonInput
                type="number"
                value={config.lightingPort}
                onIonInput={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    lightingPort: parseInt(e.detail.value!, 10),
                  }))
                }
              />
            </IonItem>
          </>
        )}

        {config.lightingSystemType === "ws2812" && (
          <IonAccordionGroup>
            <IonAccordion value="advanced">
              <IonItem slot="header">
                <IonLabel>Advanced Configuration</IonLabel>
              </IonItem>
              <div slot="content">
                <IonItem>
                  <IonLabel position="stacked">GPIO Pin</IonLabel>
                  <IonInput
                    type="number"
                    value={config.lightingCustomConfig?.ledPin}
                    placeholder="2"
                    onIonInput={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        lightingCustomConfig: {
                          ...prev.lightingCustomConfig,
                          ledPin: parseInt(e.detail.value!, 10),
                        },
                      }))
                    }
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Number of LEDs</IonLabel>
                  <IonInput
                    type="number"
                    value={config.lightingCustomConfig?.ledCount}
                    placeholder="30"
                    onIonInput={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        lightingCustomConfig: {
                          ...prev.lightingCustomConfig,
                          ledCount: parseInt(e.detail.value!, 10),
                        },
                      }))
                    }
                  />
                </IonItem>

                <IonItem>
                  <IonLabel>Default Brightness: {config.lightingCustomConfig?.brightness || 255}</IonLabel>
                  <IonRange
                    min={1}
                    max={255}
                    value={config.lightingCustomConfig?.brightness || 255}
                    onIonInput={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        lightingCustomConfig: {
                          ...prev.lightingCustomConfig,
                          brightness: e.detail.value as number,
                        },
                      }))
                    }
                  />
                </IonItem>
              </div>
            </IonAccordion>
          </IonAccordionGroup>
        )}
      </IonList>

      {config.lightingSystemType === "nanoleaf" && (
        <IonCard color="warning">
          <IonCardContent>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <IonIcon icon={warning} />
              <div>
                <h4>Authentication Required</h4>
                <p>
                  After configuration, you'll need to press and hold the power button on your
                  Nanoleaf controller when prompted.
                </p>
              </div>
            </div>
          </IonCardContent>
        </IonCard>
      )}

      <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
        <IonButton
          fill="outline"
          onClick={() => setCurrentStep(0)}
          disabled={loading}
        >
          Back
        </IonButton>
        <IonButton
          expand="block"
          onClick={handleConfigureSystem}
          disabled={
            loading ||
            (config.lightingSystemType !== "ws2812" && !config.lightingHostAddress)
          }
        >
          {loading && <IonSpinner name="crescent" />}
          Configure System
        </IonButton>
      </div>
    </div>
  );

  const renderTestAndComplete = () => (
    <div>
      <IonText>
        <h2>Test & Complete</h2>
        <p>Test the connection to verify your lighting system is working correctly.</p>
      </IonText>

      {currentStatus && (
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Current Status</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem lines="none">
              <IonLabel>
                <h3>System Type</h3>
                <p>{LightingSystemService.getLightingSystemDisplayName(currentStatus.lightingSystemType)}</p>
              </IonLabel>
            </IonItem>
            <IonItem lines="none">
              <IonLabel>
                <h3>Status</h3>
                <p>
                  <IonBadge color={LightingSystemService.getStatusColor(currentStatus.lightingStatus)}>
                    {LightingSystemService.getStatusDisplayText(currentStatus.lightingStatus)}
                  </IonBadge>
                </p>
              </IonLabel>
            </IonItem>
            {currentStatus.lightingLastTestAt && (
              <IonItem lines="none">
                <IonLabel>
                  <h3>Last Tested</h3>
                  <p>{new Date(currentStatus.lightingLastTestAt).toLocaleString()}</p>
                </IonLabel>
              </IonItem>
            )}
          </IonCardContent>
        </IonCard>
      )}

      <IonButton
        expand="block"
        fill="outline"
        onClick={handleTestConnection}
        disabled={loading}
      >
        <IonIcon icon={refresh} slot="start" />
        {loading ? <IonSpinner name="crescent" /> : "Test Connection"}
      </IonButton>

      {testResult && (
        <IonCard color="light">
          <IonCardContent>
            <IonText>{testResult}</IonText>
          </IonCardContent>
        </IonCard>
      )}

      <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
        <IonButton
          fill="outline"
          onClick={() => setCurrentStep(1)}
        >
          Back
        </IonButton>
        <IonButton
          expand="block"
          onClick={handleComplete}
          color="success"
        >
          <IonIcon icon={checkmark} slot="start" />
          Complete Setup
        </IonButton>
      </div>
    </div>
  );

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={onDidDismiss}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Configure Lighting - {deviceName}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={onDidDismiss}>
                <IonIcon icon={close} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          {loading && !supportedSystems ? (
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <IonSpinner name="crescent" />
              <p>Loading lighting systems...</p>
            </div>
          ) : (
            <>
              <IonProgressBar value={(currentStep + 1) / 3} />
              <div style={{ marginTop: "1rem" }}>
                {currentStep === 0 && renderSystemSelection()}
                {currentStep === 1 && renderConfiguration()}
                {currentStep === 2 && renderTestAndComplete()}
              </div>
            </>
          )}
        </IonContent>
      </IonModal>

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

export default LightingConfigModal;
