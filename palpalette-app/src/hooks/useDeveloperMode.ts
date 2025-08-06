import { useContext } from "react";
import { DeveloperModeContext } from "../contexts/DeveloperModeContext";

export const useDeveloperMode = () => {
  const context = useContext(DeveloperModeContext);
  if (context === undefined) {
    throw new Error(
      "useDeveloperMode must be used within a DeveloperModeProvider"
    );
  }
  return context;
};
