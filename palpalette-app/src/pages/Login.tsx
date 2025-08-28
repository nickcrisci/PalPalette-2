import React, { useState } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonToast,
  IonText,
  IonSpinner,
  IonIcon,
} from "@ionic/react";
import { colorPalette } from "ionicons/icons";
import { useAuth } from "../hooks/useAuth";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const { login, register, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || (!isLogin && !displayName)) {
      setToastMessage("Please fill in all fields");
      setShowToast(true);
      return;
    }

    try {
      let success;
      if (isLogin) {
        success = await login(email, password);
      } else {
        success = await register(email, password, displayName);
      }

      if (!success) {
        setToastMessage(isLogin ? "Login failed" : "Registration failed");
        setShowToast(true);
      }
    } catch {
      setToastMessage("An error occurred");
      setShowToast(true);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <IonIcon icon={colorPalette} />
              PalPalette
            </div>
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "50px",
          }}
        >
          <IonCard style={{ width: "100%", maxWidth: "400px" }}>
            <IonCardContent>
              <div style={{ textAlign: "center", marginBottom: "30px" }}>
                <IonIcon icon={colorPalette} size="large" color="primary" />
                <h1>PalPalette</h1>
                <p>Control your RGB devices</p>
              </div>

              <form onSubmit={handleSubmit}>
                <IonItem>
                  <IonLabel position="stacked">Email</IonLabel>
                  <IonInput
                    type="email"
                    value={email}
                    onIonChange={(e) => setEmail(e.detail.value!)}
                    required
                  />
                </IonItem>

                {!isLogin && (
                  <IonItem>
                    <IonLabel position="stacked">Display Name</IonLabel>
                    <IonInput
                      value={displayName}
                      onIonChange={(e) => setDisplayName(e.detail.value!)}
                      required
                    />
                  </IonItem>
                )}

                <IonItem>
                  <IonLabel position="stacked">Password</IonLabel>
                  <IonInput
                    type="password"
                    value={password}
                    onIonChange={(e) => setPassword(e.detail.value!)}
                    required
                  />
                </IonItem>

                <IonButton
                  expand="block"
                  type="submit"
                  style={{ marginTop: "20px" }}
                  disabled={loading}
                >
                  {loading ? (
                    <IonSpinner name="crescent" />
                  ) : (
                    <>{isLogin ? "Login" : "Register"}</>
                  )}
                </IonButton>
              </form>

              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <IonText>
                  {isLogin
                    ? "Don't have an account? "
                    : "Already have an account? "}
                  <IonButton
                    fill="clear"
                    size="small"
                    onClick={() => setIsLogin(!isLogin)}
                  >
                    {isLogin ? "Register" : "Login"}
                  </IonButton>
                </IonText>
              </div>
            </IonCardContent>
          </IonCard>
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          position="top"
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;
