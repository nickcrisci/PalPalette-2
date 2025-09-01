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
  IonCheckbox,
  IonList,
  IonText,
  IonSpinner,
  IonSearchbar,
  IonAvatar,
  IonIcon,
} from "@ionic/react";
import { person, send } from "ionicons/icons";
import { useAuth } from "../../hooks/useContexts";

interface Friend {
  id: string;
  email: string;
  displayName: string;
}

interface FriendSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToFriends: (friendIds: string[]) => void;
  isLoading?: boolean;
}

export const FriendSelector: React.FC<FriendSelectorProps> = ({
  isOpen,
  onClose,
  onSendToFriends,
  isLoading = false,
}) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loadingFriends, setLoadingFriends] = useState(false);
  const { token } = useAuth();

  const loadFriends = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingFriends(true);
      // Use generated UsersService
      const { UsersService } = await import(
        "../../services/openapi/services/UsersService"
      );
      // The OpenAPI client should handle auth automatically if configured
      const friendsList = await UsersService.usersControllerGetFriends();
      setFriends(friendsList);
    } catch (error) {
      console.error("Error loading friends:", error);
    } finally {
      setLoadingFriends(false);
    }
  }, [token]);

  useEffect(() => {
    if (isOpen) {
      loadFriends();
    }
  }, [isOpen, loadFriends]);

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleSend = () => {
    if (selectedFriends.length > 0) {
      onSendToFriends(selectedFriends);
    }
  };

  const handleClose = () => {
    setSelectedFriends([]);
    setSearchText("");
    onClose();
  };

  const filteredFriends = friends.filter(
    (friend) =>
      friend.displayName.toLowerCase().includes(searchText.toLowerCase()) ||
      friend.email.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <IonModal isOpen={isOpen} onDidDismiss={handleClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Send to Friends</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleClose}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {loadingFriends ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "200px",
            }}
          >
            <IonSpinner name="crescent" />
          </div>
        ) : (
          <>
            {friends.length > 0 && (
              <IonSearchbar
                value={searchText}
                onIonInput={(e) => setSearchText(e.detail.value!)}
                placeholder="Search friends..."
                style={{ padding: "16px" }}
              />
            )}

            {friends.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px 24px",
                  color: "var(--ion-color-medium)",
                }}
              >
                <IonIcon
                  icon={person}
                  style={{ fontSize: "64px", marginBottom: "16px" }}
                />
                <IonText>
                  <h3>No Friends Yet</h3>
                  <p>Add friends to start sharing color palettes!</p>
                </IonText>
              </div>
            ) : (
              <IonList>
                <IonItem>
                  <IonLabel>
                    <h2>Select friends to send palette to:</h2>
                    <p>{selectedFriends.length} selected</p>
                  </IonLabel>
                </IonItem>

                {filteredFriends.map((friend) => (
                  <IonItem
                    key={friend.id}
                    button
                    onClick={() => toggleFriendSelection(friend.id)}
                  >
                    <IonAvatar slot="start">
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          backgroundColor: "var(--ion-color-primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "18px",
                          fontWeight: "bold",
                        }}
                      >
                        {friend.displayName.charAt(0).toUpperCase()}
                      </div>
                    </IonAvatar>

                    <IonLabel>
                      <h2>{friend.displayName}</h2>
                      <p>{friend.email}</p>
                    </IonLabel>

                    <IonCheckbox
                      slot="end"
                      checked={selectedFriends.includes(friend.id)}
                      onIonChange={() => toggleFriendSelection(friend.id)}
                    />
                  </IonItem>
                ))}
              </IonList>
            )}

            {friends.length > 0 && (
              <div style={{ padding: "16px" }}>
                <IonButton
                  expand="block"
                  onClick={handleSend}
                  disabled={selectedFriends.length === 0 || isLoading}
                >
                  <IonIcon icon={send} slot="start" />
                  {isLoading
                    ? "Sending..."
                    : `Send to ${selectedFriends.length} friend${
                        selectedFriends.length !== 1 ? "s" : ""
                      }`}
                </IonButton>
              </div>
            )}
          </>
        )}
      </IonContent>
    </IonModal>
  );
};
