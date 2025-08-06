import { Redirect, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonSpinner,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { list, settings, camera, people, mailOutline } from "ionicons/icons";
import Login from "./pages/Login"; // Keep Login as direct import for faster auth
import { AuthProvider } from "./contexts/AuthContext";
import { DeviceProvider } from "./contexts/DeviceContext";
import { DeveloperModeProvider } from "./contexts/DeveloperModeContext";
import { useAuth } from "./hooks/useContexts";

// Lazy load page components
const Devices = lazy(() => import("./pages/Devices"));
const ColorPalette = lazy(() => import("./pages/ColorPalette"));
const PaletteCreator = lazy(() => import("./pages/PaletteCreator"));
const Friends = lazy(() => import("./pages/Friends"));
const Messages = lazy(() => import("./pages/Messages"));
const Settings = lazy(() => import("./pages/Settings"));

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import "@ionic/react/css/palettes/dark.system.css";

/* Theme variables */
import "./theme/variables.css";

setupIonicReact();

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // You can replace this with a proper loading component
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Suspense
          fallback={
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
              }}
            >
              <IonSpinner name="crescent" />
            </div>
          }
        >
          <Route exact path="/devices">
            <Devices />
          </Route>
          <Route exact path="/palette">
            <ColorPalette />
          </Route>
          <Route exact path="/create">
            <PaletteCreator />
          </Route>
          <Route exact path="/friends">
            <Friends />
          </Route>
          <Route exact path="/messages">
            <Messages />
          </Route>
          <Route path="/settings">
            <Settings />
          </Route>
        </Suspense>
        <Route exact path="/">
          <Redirect to="/devices" />
        </Route>
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton tab="devices" href="/devices">
          <IonIcon aria-hidden="true" icon={list} />
          <IonLabel>Devices</IonLabel>
        </IonTabButton>
        <IonTabButton tab="messages" href="/messages">
          <IonIcon aria-hidden="true" icon={mailOutline} />
          <IonLabel>Messages</IonLabel>
        </IonTabButton>
        <IonTabButton tab="create" href="/create">
          <IonIcon aria-hidden="true" icon={camera} />
          <IonLabel>Create</IonLabel>
        </IonTabButton>
        <IonTabButton tab="friends" href="/friends">
          <IonIcon aria-hidden="true" icon={people} />
          <IonLabel>Friends</IonLabel>
        </IonTabButton>
        <IonTabButton tab="settings" href="/settings">
          <IonIcon aria-hidden="true" icon={settings} />
          <IonLabel>Settings</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <DeviceProvider>
        <DeveloperModeProvider>
          <IonReactRouter>
            <AppContent />
          </IonReactRouter>
        </DeveloperModeProvider>
      </DeviceProvider>
    </AuthProvider>
  </IonApp>
);

export default App;
