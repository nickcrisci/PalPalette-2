import React from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonText,
} from "@ionic/react";
import {
  person,
  logOut,
  informationCircle,
  colorPalette,
} from "ionicons/icons";
import { useAuth } from "../hooks/useContexts";

const Settings: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        {/* User Info */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Account Information</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              <IonItem>
                <IonIcon icon={person} slot="start" />
                <IonLabel>
                  <h2>{user?.displayName}</h2>
                  <p>{user?.email}</p>
                </IonLabel>
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>

        {/* App Info */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>About PalPalette</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              <IonItem>
                <IonIcon icon={colorPalette} slot="start" />
                <IonLabel>
                  <h2>PalPalette</h2>
                  <p>RGB Device Controller</p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonIcon icon={informationCircle} slot="start" />
                <IonLabel>
                  <h2>Version</h2>
                  <p>1.0.0</p>
                </IonLabel>
              </IonItem>
            </IonList>
            <IonText color="medium">
              <p style={{ marginTop: "16px" }}>
                Control your ESP32/ESP8266 RGB devices with ease. Set up devices
                using QR codes and send beautiful colors wirelessly.
              </p>
            </IonText>
          </IonCardContent>
        </IonCard>

        {/* Actions */}
        <IonCard>
          <IonCardContent>
            <IonButton
              expand="block"
              fill="outline"
              color="danger"
              onClick={handleLogout}
            >
              <IonIcon icon={logOut} slot="start" />
              Logout
            </IonButton>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Settings;
