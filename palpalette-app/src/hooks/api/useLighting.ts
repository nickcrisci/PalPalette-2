import { useState, useCallback } from "react";
import {
  lightingAPI,
  LightingConfig,
  LightingStatus,
} from "../../services/api";

export interface UseLightingReturn {
  loading: boolean;
  error: string | null;
  configureLighting: (
    deviceId: string,
    config: LightingConfig
  ) => Promise<boolean>;
  getLightingStatus: (deviceId: string) => Promise<LightingStatus | null>;
  sendColorPalette: (deviceId: string, colors: string[]) => Promise<boolean>;
  testLighting: (deviceId: string) => Promise<boolean>;
  updateLighting: (
    deviceId: string,
    updates: {
      lightingHostAddress?: string;
      lightingPort?: number;
      lightingCustomConfig?: Record<string, unknown>;
    }
  ) => Promise<boolean>;
}

export const useLighting = (): UseLightingReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const configureLighting = useCallback(
    async (deviceId: string, config: LightingConfig): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        await lightingAPI.configureLighting(deviceId, config);
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to configure lighting";
        setError(errorMessage);
        console.error("Failed to configure lighting:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getLightingStatus = useCallback(
    async (deviceId: string): Promise<LightingStatus | null> => {
      setLoading(true);
      setError(null);
      try {
        const status = await lightingAPI.getLightingStatus(deviceId);
        return status;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to get lighting status";
        setError(errorMessage);
        console.error("Failed to get lighting status:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const sendColorPalette = useCallback(
    async (deviceId: string, colors: string[]): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        await lightingAPI.sendColorPalette(deviceId, { colors });
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to send color palette";
        setError(errorMessage);
        console.error("Failed to send color palette:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const testLighting = useCallback(
    async (deviceId: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        const result = await lightingAPI.testLightingConnection(deviceId);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to test lighting";
        setError(errorMessage);
        console.error("Failed to test lighting:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateLighting = useCallback(
    async (
      deviceId: string,
      updates: {
        lightingHostAddress?: string;
        lightingPort?: number;
        lightingCustomConfig?: Record<string, unknown>;
      }
    ): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        await lightingAPI.updateLighting(deviceId, updates);
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update lighting";
        setError(errorMessage);
        console.error("Failed to update lighting:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    configureLighting,
    getLightingStatus,
    sendColorPalette,
    testLighting,
    updateLighting,
  };
};
