import { Redirect, Route } from "react-router-dom";
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { list, settings, camera, people, mailOutline } from "ionicons/icons";
import Devices from "./pages/Devices";
import ColorPalette from "./pages/ColorPalette";
import PaletteCreator from "./pages/PaletteCreator";
import Friends from "./pages/Friends";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import { AuthProvider } from "./contexts/AuthContext";
import { DeviceProvider } from "./contexts/DeviceContext";
import { useAuth } from "./hooks/useContexts";

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
        <IonReactRouter>
          <AppContent />
        </IonReactRouter>
      </DeviceProvider>
    </AuthProvider>
  </IonApp>
);

export default App;
