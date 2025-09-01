import React, { useState, useEffect } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonRefresher,
  IonRefresherContent,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonToast,
  IonSelect,
  IonSelectOption,
  IonIcon,
  IonChip,
  IonSkeletonText,
  RefresherEventDetail,
} from "@ionic/react";
import { colorPalette, play, time, person, tvOutline } from "ionicons/icons";
import { Message } from "../services/openapi/models/Message";
import { Device } from "../services/openapi/models/Device";
import { DevicesService } from "../services/openapi/services/DevicesService";
import "./Messages.css";

const Messages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string>("");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const loadDataCallback = async () => {
      try {
        setLoading(true);
        const [messagesData, devicesData] = await Promise.all([
          // TODO: Implement proper message fetching with OpenAPI
          Promise.resolve([]), // MessagesService.messagesControllerFindAll(),
          DevicesService.devicesControllerGetMyDevices(),
        ]);

        setMessages(messagesData as Message[]);
        setDevices(devicesData as Device[]);

        // Auto-select first device if available
        if (devicesData.length > 0 && !selectedDevice) {
          setSelectedDevice(devicesData[0].id);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        showMessage("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    loadDataCallback();
  }, [selectedDevice]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [messagesData, devicesData] = await Promise.all([
        // TODO: Implement proper message fetching with OpenAPI
        Promise.resolve([]), // MessagesService.messagesControllerFindAll(),
        DevicesService.devicesControllerGetMyDevices(),
      ]);

      setMessages(messagesData as Message[]);
      setDevices(devicesData as Device[]);

      // Auto-select first device if available
      if (devicesData.length > 0 && !selectedDevice) {
        setSelectedDevice(devicesData[0].id);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      showMessage("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await loadData();
    event.detail.complete();
  };

  const replayMessage = async (messageId: string) => {
    if (!selectedDevice) {
      showMessage("Please select a device first");
      return;
    }

    try {
      // TODO: Implement message replay with OpenAPI
      console.warn("Message replay not implemented with OpenAPI yet", {
        messageId,
        selectedDevice,
      });
      showMessage("Message replay feature not available yet");
    } catch (error) {
      console.error("Error replaying message:", error);
      showMessage("Failed to replay message");
    }
  };

  const showMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderColorPalette = (colors: Array<Record<string, any>>) => {
    return (
      <div className="color-palette-preview">
        {colors.slice(0, 6).map((color, index) => (
          <div
            key={index}
            className="color-swatch"
            style={{ backgroundColor: color.hex || "#000000" }}
            title={color.hex || "#000000"}
          />
        ))}
        {colors.length > 6 && (
          <div className="color-count">+{colors.length - 6}</div>
        )}
      </div>
    );
  };

  const renderSkeletonLoader = () => (
    <IonList>
      {[1, 2, 3].map((i) => (
        <IonCard key={i}>
          <IonCardHeader>
            <IonSkeletonText
              animated
              style={{ width: "60%" }}
            ></IonSkeletonText>
          </IonCardHeader>
          <IonCardContent>
            <IonSkeletonText animated></IonSkeletonText>
            <IonSkeletonText
              animated
              style={{ width: "80%" }}
            ></IonSkeletonText>
          </IonCardContent>
        </IonCard>
      ))}
    </IonList>
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Color Messages</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        {/* Device Selection */}
        {devices.length > 0 && (
          <div className="device-selection">
            <IonItem>
              <IonIcon icon={tvOutline} slot="start" />
              <IonLabel>Replay on device:</IonLabel>
              <IonSelect
                value={selectedDevice}
                placeholder="Select device"
                onIonChange={(e) => setSelectedDevice(e.detail.value as string)}
              >
                {devices.map((device) => (
                  <IonSelectOption key={device.id} value={device.id}>
                    {device.name} ({device.type})
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
          </div>
        )}

        {loading ? (
          renderSkeletonLoader()
        ) : messages.length === 0 ? (
          <div className="empty-state">
            <IonIcon icon={colorPalette} size="large" />
            <h2>No Color Messages</h2>
            <p>You haven't received any color palettes from friends yet.</p>
            <p>
              Ask your friends to send you some beautiful color combinations!
            </p>
          </div>
        ) : (
          <IonList>
            {messages.map((message) => (
              <IonCard key={message.id} className="message-card">
                <IonCardHeader>
                  <IonCardTitle>
                    <div className="message-header">
                      <div className="sender-info">
                        <IonIcon icon={person} />
                        <span>{message.sender.displayName}</span>
                      </div>
                      <div className="message-time">
                        <IonIcon icon={time} />
                        <span>{formatDate(message.sentAt)}</span>
                      </div>
                    </div>
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div className="message-content">
                    {renderColorPalette(message.colors)}

                    <div className="color-info">
                      <IonChip color="medium">
                        <IonIcon icon={colorPalette} />
                        <span>{message.colors.length} colors</span>
                      </IonChip>

                      {!message.deliveredAt && (
                        <IonChip color="warning">
                          <span>Undelivered</span>
                        </IonChip>
                      )}
                    </div>

                    <div className="message-actions">
                      <IonButton
                        expand="block"
                        fill="outline"
                        onClick={() => replayMessage(message.id)}
                        disabled={!selectedDevice}
                      >
                        <IonIcon icon={play} slot="start" />
                        Show on Device
                      </IonButton>
                    </div>
                  </div>
                </IonCardContent>
              </IonCard>
            ))}
          </IonList>
        )}

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
        />
      </IonContent>
    </IonPage>
  );
};

export default Messages;
