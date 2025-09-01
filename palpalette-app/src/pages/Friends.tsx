import React, { useState, useEffect, useCallback } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonToast,
  IonSpinner,
  IonCard,
  IonCardContent,
  IonText,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonAvatar,
  IonBadge,
  IonRefresher,
  IonRefresherContent,
} from "@ionic/react";
import { person, checkmark, close, mail } from "ionicons/icons";
import { useAuth } from "../hooks/useContexts";

interface Friend {
  id: string;
  email: string;
  displayName: string;
}

interface FriendRequest {
  id: string;
  requester: {
    id: string;
    email: string;
    displayName: string;
  };
  createdAt: string;
}

const Friends: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [friendEmail, setFriendEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState<"success" | "danger">("success");
  const { token } = useAuth();

  const showMessage = (
    message: string,
    color: "success" | "danger" = "success"
  ) => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const { UsersService } = await import(
        "../services/openapi/services/UsersService"
      );
      const [friendsList, pendingList] = await Promise.all([
        UsersService.usersControllerGetFriends(),
        UsersService.usersControllerGetPendingRequests(),
      ]);
      setFriends(friendsList);
      setPendingRequests(pendingList);
    } catch (error) {
      console.error("Error loading friends:", error);
      showMessage("Failed to load friends", "danger");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const sendFriendRequest = async () => {
    if (!friendEmail.trim()) {
      showMessage("Please enter a valid email", "danger");
      return;
    }
    try {
      setIsLoading(true);
      const { UsersService } = await import(
        "../services/openapi/services/UsersService"
      );
      await UsersService.usersControllerSendFriendRequest({
        email: friendEmail.trim(),
      });
      showMessage("Friend request sent!");
      setFriendEmail("");
    } catch (error) {
      console.error("Error sending friend request:", error);
      showMessage("Failed to send friend request", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  const respondToRequest = async (
    requestId: string,
    action: "accept" | "decline"
  ) => {
    try {
      setIsLoading(true);
      const { UsersService } = await import(
        "../services/openapi/services/UsersService"
      );
      const { RespondToFriendRequestDto } = await import(
        "../services/openapi/models/RespondToFriendRequestDto"
      );
      await UsersService.usersControllerRespondToFriendRequest({
        friendshipId: requestId,
        action:
          action === "accept"
            ? RespondToFriendRequestDto.action.ACCEPT
            : RespondToFriendRequestDto.action.DECLINE,
      });
      showMessage(`Friend request ${action}ed!`);
      await loadData(); // Refresh data
    } catch (error) {
      console.error("Error responding to request:", error);
      showMessage(`Failed to ${action} request`, "danger");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async (event: CustomEvent) => {
    await loadData();
    event.detail.complete();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Friends</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div style={{ padding: "16px" }}>
          {/* Add Friend Section */}
          <IonCard>
            <IonCardContent>
              <IonText>
                <h3>Add Friend</h3>
                <p>
                  Enter your friend's email address to send a friend request.
                </p>
              </IonText>

              <IonItem style={{ marginTop: "16px" }}>
                <IonIcon icon={mail} slot="start" />
                <IonInput
                  value={friendEmail}
                  onIonInput={(e) => setFriendEmail(e.detail.value!)}
                  placeholder="friend@example.com"
                  type="email"
                  clearInput
                />
                <IonButton
                  slot="end"
                  onClick={sendFriendRequest}
                  disabled={!friendEmail.trim() || isLoading}
                  size="small"
                >
                  Send
                </IonButton>
              </IonItem>
            </IonCardContent>
          </IonCard>

          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <IonCard>
              <IonCardContent>
                <IonText>
                  <h3>Friend Requests</h3>
                  <p>People who want to be your friend.</p>
                </IonText>

                <IonList>
                  {pendingRequests.map((request) => (
                    <IonItem key={request.id}>
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
                          {request.requester.displayName
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      </IonAvatar>

                      <IonLabel>
                        <h2>{request.requester.displayName}</h2>
                        <p>{request.requester.email}</p>
                      </IonLabel>

                      <IonButton
                        slot="end"
                        fill="clear"
                        color="success"
                        onClick={() => respondToRequest(request.id, "accept")}
                        disabled={isLoading}
                      >
                        <IonIcon icon={checkmark} />
                      </IonButton>

                      <IonButton
                        slot="end"
                        fill="clear"
                        color="danger"
                        onClick={() => respondToRequest(request.id, "decline")}
                        disabled={isLoading}
                      >
                        <IonIcon icon={close} />
                      </IonButton>
                    </IonItem>
                  ))}
                </IonList>
              </IonCardContent>
            </IonCard>
          )}

          {/* Friends List */}
          <IonCard>
            <IonCardContent>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <IonText>
                  <h3>My Friends</h3>
                  <p>You can send color palettes to these friends.</p>
                </IonText>
                <IonBadge color="primary">{friends.length}</IonBadge>
              </div>

              {friends.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "32px",
                    color: "var(--ion-color-medium)",
                  }}
                >
                  <IonIcon
                    icon={person}
                    style={{ fontSize: "48px", marginBottom: "16px" }}
                  />
                  <IonText>
                    <h4>No friends yet</h4>
                    <p>Add friends to start sharing color palettes!</p>
                  </IonText>
                </div>
              ) : (
                <IonList>
                  {friends.map((friend) => (
                    <IonItem key={friend.id}>
                      <IonAvatar slot="start">
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            backgroundColor: "var(--ion-color-success)",
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
                    </IonItem>
                  ))}
                </IonList>
              )}
            </IonCardContent>
          </IonCard>
        </div>

        {isLoading && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
          >
            <IonSpinner name="crescent" color="primary" />
          </div>
        )}

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
        />
      </IonContent>
    </IonPage>
  );
};

export default Friends;
