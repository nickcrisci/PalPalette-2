import React from "react";
import {
  IonBadge,
  IonButton,
  IonChip,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPopover,
  IonText,
} from "@ionic/react";
import { bulb } from "ionicons/icons";
import { useDeviceNotifications } from "../../hooks/useDeviceNotifications";

interface GlobalNotificationIndicatorProps {
  className?: string;
}

const GlobalNotificationIndicator: React.FC<
  GlobalNotificationIndicatorProps
> = ({ className }) => {
  const { authenticatingDevices, hasAuthenticatingDevices } =
    useDeviceNotifications();
  const [showPopover, setShowPopover] = React.useState(false);

  if (!hasAuthenticatingDevices) {
    return null;
  }

  return (
    <>
      <IonButton
        fill="clear"
        id="notification-indicator"
        onClick={() => setShowPopover(true)}
        className={className}
      >
        <IonIcon icon={bulb} color="warning" />
        <IonBadge color="warning" style={{ marginLeft: "4px" }}>
          {authenticatingDevices.length}
        </IonBadge>
      </IonButton>

      <IonPopover
        trigger="notification-indicator"
        isOpen={showPopover}
        onDidDismiss={() => setShowPopover(false)}
        alignment="start"
      >
        <IonList>
          <IonItem>
            <IonLabel>
              <h2>Device Authentication</h2>
              <p>Devices currently setting up lighting systems</p>
            </IonLabel>
          </IonItem>

          {authenticatingDevices.map((device) => (
            <IonItem key={device.deviceId} lines="none">
              <IonIcon icon={bulb} slot="start" color="warning" />
              <IonLabel>
                <h3>Device {device.deviceId.substring(0, 8)}...</h3>
                <p>{device.message}</p>
                {device.pairingCode && (
                  <IonChip color="primary" style={{ fontSize: "12px" }}>
                    Code: {device.pairingCode}
                  </IonChip>
                )}
              </IonLabel>
            </IonItem>
          ))}

          <IonItem>
            <IonText color="medium">
              <p
                style={{ fontSize: "12px", textAlign: "center", width: "100%" }}
              >
                Check your devices page for detailed setup instructions
              </p>
            </IonText>
          </IonItem>
        </IonList>
      </IonPopover>
    </>
  );
};

export default GlobalNotificationIndicator;
