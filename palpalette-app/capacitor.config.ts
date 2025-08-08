import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.palpalette.app",
  appName: "PalPalette",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  plugins: {
    Camera: {
      permissions: ["camera", "photos"],
    },
    Preferences: {
      group: "palpalette",
    },
    BarcodeScanner: {
      permissions: ["camera"],
    },
    Haptics: {},
    StatusBar: {
      style: "dark",
      backgroundColor: "#ffffff",
    },
    Keyboard: {
      resize: "body",
      style: "dark",
    },
    App: {
      windowsPathPrefix: "ms-appx-web",
    },
  },
  ios: {
    scheme: "PalPalette",
    contentInset: "automatic",
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
  },
};

export default config;
