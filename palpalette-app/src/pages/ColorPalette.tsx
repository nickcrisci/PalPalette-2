import React, { useState } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonRange,
  IonLabel,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonText,
  IonIcon,
} from "@ionic/react";
import { colorPalette, send } from "ionicons/icons";
import { useDevices } from "../hooks/useContexts";

const ColorPalette: React.FC = () => {
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [red, setRed] = useState(255);
  const [green, setGreen] = useState(255);
  const [blue, setBlue] = useState(255);
  const { devices, sendColorToDevice } = useDevices();

  const presetColors = [
    { name: "Red", color: "#FF0000", rgb: [255, 0, 0] },
    { name: "Green", color: "#00FF00", rgb: [0, 255, 0] },
    { name: "Blue", color: "#0000FF", rgb: [0, 0, 255] },
    { name: "Yellow", color: "#FFFF00", rgb: [255, 255, 0] },
    { name: "Purple", color: "#FF00FF", rgb: [255, 0, 255] },
    { name: "Cyan", color: "#00FFFF", rgb: [0, 255, 255] },
    { name: "Orange", color: "#FF8000", rgb: [255, 128, 0] },
    { name: "Pink", color: "#FF8080", rgb: [255, 128, 128] },
    { name: "White", color: "#FFFFFF", rgb: [255, 255, 255] },
    { name: "Off", color: "#000000", rgb: [0, 0, 0] },
  ];

  const currentColor = `rgb(${red}, ${green}, ${blue})`;
  const currentHex = `#${red.toString(16).padStart(2, "0")}${green
    .toString(16)
    .padStart(2, "0")}${blue.toString(16).padStart(2, "0")}`;

  const handlePresetColor = (rgb: number[]) => {
    setRed(rgb[0]);
    setGreen(rgb[1]);
    setBlue(rgb[2]);
  };

  const handleSendColor = () => {
    if (!selectedDevice) return;

    sendColorToDevice(selectedDevice, currentHex);
  };

  const onlineDevices = devices.filter(
    (device) => device.isOnline && device.isProvisioned
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <IonIcon icon={colorPalette} />
              Color Control
            </div>
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        {/* Device Selection */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Select Device</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem>
              <IonLabel>Device</IonLabel>
              <IonSelect
                value={selectedDevice}
                placeholder="Choose a device"
                onIonChange={(e) => setSelectedDevice(e.detail.value)}
              >
                {onlineDevices.map((device) => (
                  <IonSelectOption key={device.id} value={device.id}>
                    {device.name}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            {onlineDevices.length === 0 && (
              <IonText color="medium">
                <p>
                  No online devices available. Make sure your devices are
                  connected and set up.
                </p>
              </IonText>
            )}
          </IonCardContent>
        </IonCard>

        {/* Color Preview */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Current Color</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div
              style={{
                width: "100%",
                height: "100px",
                backgroundColor: currentColor,
                border: "2px solid #ccc",
                borderRadius: "8px",
                marginBottom: "10px",
              }}
            />
            <IonText>
              <p>
                RGB: {red}, {green}, {blue}
              </p>
              <p>Hex: {currentHex}</p>
            </IonText>
          </IonCardContent>
        </IonCard>

        {/* RGB Sliders */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Custom Color</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem>
              <IonLabel>Red: {red}</IonLabel>
              <IonRange
                min={0}
                max={255}
                value={red}
                onIonKnobMoveEnd={(e) => setRed(e.detail.value as number)}
                color="danger"
              />
            </IonItem>
            <IonItem>
              <IonLabel>Green: {green}</IonLabel>
              <IonRange
                min={0}
                max={255}
                value={green}
                onIonKnobMoveEnd={(e) => setGreen(e.detail.value as number)}
                color="success"
              />
            </IonItem>
            <IonItem>
              <IonLabel>Blue: {blue}</IonLabel>
              <IonRange
                min={0}
                max={255}
                value={blue}
                onIonKnobMoveEnd={(e) => setBlue(e.detail.value as number)}
                color="primary"
              />
            </IonItem>
          </IonCardContent>
        </IonCard>

        {/* Preset Colors */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Quick Colors</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonGrid>
              <IonRow>
                {presetColors.map((preset) => (
                  <IonCol size="6" sizeMd="4" sizeLg="2" key={preset.name}>
                    <IonButton
                      expand="block"
                      fill="solid"
                      style={{
                        "--background": preset.color,
                        "--color": preset.name === "Off" ? "#fff" : "#000",
                      }}
                      onClick={() => handlePresetColor(preset.rgb)}
                    >
                      {preset.name}
                    </IonButton>
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>

        {/* Send Button */}
        <IonCard>
          <IonCardContent>
            <IonButton
              expand="block"
              onClick={handleSendColor}
              disabled={!selectedDevice}
              size="large"
            >
              <IonIcon icon={send} slot="start" />
              Send Color to Device
            </IonButton>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default ColorPalette;
