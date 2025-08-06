import React, { createContext, useState, useEffect } from "react";
import { Preferences } from "@capacitor/preferences";

interface DeveloperModeContextType {
  isDeveloperMode: boolean;
  toggleDeveloperMode: () => void;
  setDeveloperMode: (enabled: boolean) => void;
}

const DeveloperModeContext = createContext<
  DeveloperModeContextType | undefined
>(undefined);

export const DeveloperModeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);

  useEffect(() => {
    // Load developer mode state from preferences
    const loadDeveloperMode = async () => {
      try {
        const { value } = await Preferences.get({ key: "developer_mode" });
        setIsDeveloperMode(value === "true");
      } catch (error) {
        console.error("Error loading developer mode preference:", error);
      }
    };

    loadDeveloperMode();
  }, []);

  const setDeveloperMode = async (enabled: boolean) => {
    try {
      await Preferences.set({
        key: "developer_mode",
        value: enabled.toString(),
      });
      setIsDeveloperMode(enabled);
      console.log(`Developer mode ${enabled ? "enabled" : "disabled"}`);
    } catch (error) {
      console.error("Error saving developer mode preference:", error);
    }
  };

  const toggleDeveloperMode = () => {
    setDeveloperMode(!isDeveloperMode);
  };

  return (
    <DeveloperModeContext.Provider
      value={{
        isDeveloperMode,
        toggleDeveloperMode,
        setDeveloperMode,
      }}
    >
      {children}
    </DeveloperModeContext.Provider>
  );
};

export { DeveloperModeContext };
