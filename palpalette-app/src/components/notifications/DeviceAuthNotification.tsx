import React, { useEffect, useState, useCallback } from "react";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonChip,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonProgressBar,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  IonHeader,
  IonContent,
  IonToast,
} from "@ionic/react";
import {
  bulb,
  checkmarkCircle,
  closeCircle,
  informationCircle,
  power,
  refresh,
} from "ionicons/icons";
import {
  userNotificationService,
  UserNotification,
  NotificationAction,
  DeviceAuthenticationState,
} from "../../services/UserNotificationService";

interface DeviceAuthNotificationProps {
  deviceId: string;
  deviceName?: string;
  isVisible: boolean;
  onDismiss: () => void;
  onSuccess?: () => void;
  onFailed?: () => void;
  onRetry?: () => void;
  className?: string;
}

const DeviceAuthNotification: React.FC<DeviceAuthNotificationProps> = ({
  deviceId,
  deviceName = "Device",
  isVisible,
  onDismiss,
  onSuccess,
  onFailed,
  onRetry,
  className,
}) => {
  const [authState, setAuthState] = useState<DeviceAuthenticationState | null>(
    null
  );
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleNotification = useCallback(
    (notification: UserNotification) => {
      console.log("Received notification for device:", deviceId, notification);

      // Update authentication state
      const newState: DeviceAuthenticationState = {
        deviceId: notification.deviceId,
        isAuthenticating: true,
        currentStep: notification.action,
        message: notification.message,
        pairingCode: notification.pairingCode,
        lastUpdate: Date.now(),
      };

      setAuthState(newState);

      // Handle specific actions
      switch (notification.action) {
        case NotificationAction.PRESS_POWER_BUTTON:
          setToastMessage(
            "Please press the power button on your lighting device"
          );
          setShowToast(true);
          break;

        case NotificationAction.ENTER_PAIRING_CODE:
          if (notification.pairingCode) {
            setToastMessage(`Pairing code: ${notification.pairingCode}`);
            setShowToast(true);
          }
          break;

        case NotificationAction.AUTHENTICATION_SUCCESS:
          setToastMessage("Device connected successfully!");
          setShowToast(true);
          setTimeout(() => {
            onSuccess?.();
            onDismiss();
          }, 2000);
          break;

        case NotificationAction.AUTHENTICATION_FAILED:
          setToastMessage("Authentication failed. Please try again.");
          setShowToast(true);
          setTimeout(() => {
            onFailed?.();
          }, 3000);
          break;
      }
    },
    [deviceId, onSuccess, onFailed, onDismiss]
  );

  useEffect(() => {
    if (!isVisible) return;

    // Register for notifications for this device
    userNotificationService.onAuthenticationNotification(
      deviceId,
      handleNotification
    );

    // Get initial state
    const currentState =
      userNotificationService.getAuthenticationState(deviceId);
    if (currentState) {
      setAuthState(currentState);
    }

    return () => {
      userNotificationService.removeAuthenticationCallback(deviceId);
    };
  }, [deviceId, isVisible, handleNotification]);

  const getStepIcon = (action: NotificationAction | null) => {
    switch (action) {
      case NotificationAction.PRESS_POWER_BUTTON:
        return power;
      case NotificationAction.ENTER_PAIRING_CODE:
        return informationCircle;
      case NotificationAction.AUTHENTICATION_SUCCESS:
        return checkmarkCircle;
      case NotificationAction.AUTHENTICATION_FAILED:
        return closeCircle;
      default:
        return bulb;
    }
  };

  const getStepColor = (action: NotificationAction | null) => {
    switch (action) {
      case NotificationAction.AUTHENTICATION_SUCCESS:
        return "success";
      case NotificationAction.AUTHENTICATION_FAILED:
        return "danger";
      case NotificationAction.PRESS_POWER_BUTTON:
      case NotificationAction.ENTER_PAIRING_CODE:
        return "warning";
      default:
        return "primary";
    }
  };

  const getProgressValue = (action: NotificationAction | null) => {
    switch (action) {
      case NotificationAction.PRESS_POWER_BUTTON:
        return 0.33;
      case NotificationAction.ENTER_PAIRING_CODE:
        return 0.66;
      case NotificationAction.AUTHENTICATION_SUCCESS:
        return 1.0;
      case NotificationAction.AUTHENTICATION_FAILED:
        return 0.0;
      default:
        return 0.1;
    }
  };

  return (
    <>
      <IonModal isOpen={isVisible} onDidDismiss={onDismiss}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Connecting {deviceName}</IonTitle>
            <IonButton
              slot="end"
              fill="clear"
              onClick={onDismiss}
              disabled={
                authState?.currentStep ===
                NotificationAction.AUTHENTICATION_SUCCESS
              }
            >
              Close
            </IonButton>
          </IonToolbar>
        </IonHeader>

        <IonContent className="ion-padding">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon
                  icon={getStepIcon(authState?.currentStep || null)}
                  color={getStepColor(authState?.currentStep || null)}
                  style={{ marginRight: "8px" }}
                />
                Lighting System Setup
              </IonCardTitle>
            </IonCardHeader>

            <IonCardContent>
              {authState?.isAuthenticating && (
                <>
                  <IonProgressBar
                    value={getProgressValue(authState.currentStep)}
                    color={getStepColor(authState.currentStep)}
                  />

                  <div style={{ marginTop: "16px" }}>
                    <IonText>
                      <h3>{authState.message}</h3>
                    </IonText>

                    {authState.currentStep ===
                      NotificationAction.PRESS_POWER_BUTTON && (
                      <IonList>
                        <IonItem>
                          <IonIcon icon={power} slot="start" color="warning" />
                          <IonLabel className="ion-text-wrap">
                            <h2>Press Power Button</h2>
                            <p>
                              Press and hold the power button on your Nanoleaf
                              device for 5-7 seconds until it starts flashing
                            </p>
                          </IonLabel>
                        </IonItem>
                      </IonList>
                    )}

                    {authState.currentStep ===
                      NotificationAction.ENTER_PAIRING_CODE &&
                      authState.pairingCode && (
                        <IonList>
                          <IonItem>
                            <IonIcon
                              icon={informationCircle}
                              slot="start"
                              color="primary"
                            />
                            <IonLabel className="ion-text-wrap">
                              <h2>Pairing Code Available</h2>
                              <p>Use this code in your lighting app:</p>
                              <IonChip
                                color="primary"
                                style={{ fontSize: "18px", fontWeight: "bold" }}
                              >
                                {authState.pairingCode}
                              </IonChip>
                            </IonLabel>
                          </IonItem>
                        </IonList>
                      )}

                    {authState.currentStep ===
                      NotificationAction.AUTHENTICATION_SUCCESS && (
                      <IonList>
                        <IonItem>
                          <IonIcon
                            icon={checkmarkCircle}
                            slot="start"
                            color="success"
                          />
                          <IonLabel className="ion-text-wrap">
                            <h2>Success!</h2>
                            <p>
                              Your lighting system has been connected
                              successfully
                            </p>
                          </IonLabel>
                        </IonItem>
                      </IonList>
                    )}

                    {authState.currentStep ===
                      NotificationAction.AUTHENTICATION_FAILED && (
                      <IonList>
                        <IonItem>
                          <IonIcon
                            icon={closeCircle}
                            slot="start"
                            color="danger"
                          />
                          <IonLabel className="ion-text-wrap">
                            <h2>Connection Failed</h2>
                            <p>
                              Unable to connect to your lighting system. Please
                              check your setup and try again.
                            </p>
                          </IonLabel>
                        </IonItem>
                        <IonItem>
                          <IonButton
                            expand="block"
                            color="primary"
                            onClick={() => {
                              // Trigger retry logic here
                              setToastMessage("Retrying connection...");
                              setShowToast(true);
                            }}
                          >
                            <IonIcon icon={refresh} slot="start" />
                            Retry Connection
                          </IonButton>
                        </IonItem>
                      </IonList>
                    )}

                    {!authState.currentStep && (
                      <div style={{ textAlign: "center", padding: "20px" }}>
                        <IonSpinner name="crescent" />
                        <IonText>
                          <p>Initializing connection...</p>
                        </IonText>
                      </div>
                    )}
                  </div>
                </>
              )}

              {!authState?.isAuthenticating && (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <IonIcon icon={bulb} size="large" color="medium" />
                  <IonText>
                    <p>Waiting for device authentication to begin...</p>
                  </IonText>
                </div>
              )}
            </IonCardContent>
          </IonCard>
        </IonContent>
      </IonModal>

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={4000}
        position="top"
        color={
          authState?.currentStep === NotificationAction.AUTHENTICATION_SUCCESS
            ? "success"
            : authState?.currentStep ===
              NotificationAction.AUTHENTICATION_FAILED
            ? "danger"
            : "primary"
        }
      />
    </>
  );
};

export default DeviceAuthNotification;
