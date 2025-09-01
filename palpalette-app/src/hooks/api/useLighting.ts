import { useState, useCallback } from "react";
import { DevicesService } from "../../services/openapi/services/DevicesService";
import { LightingSystemConfigDto } from "../../services/openapi/models/LightingSystemConfigDto";
import { LightingSystemStatusDto } from "../../services/openapi/models/LightingSystemStatusDto";
import { UpdateLightingSystemDto } from "../../services/openapi/models/UpdateLightingSystemDto";

export interface UseLightingReturn {
  loading: boolean;
  error: string | null;
  configureLighting: (
    deviceId: string,
    config: LightingSystemConfigDto
  ) => Promise<boolean>;
  getLightingStatus: (
    deviceId: string
  ) => Promise<LightingSystemStatusDto | null>;
  sendColorPalette: (deviceId: string, colors: string[]) => Promise<boolean>;
  testLighting: (deviceId: string) => Promise<boolean>;
  updateLighting: (
    deviceId: string,
    updates: UpdateLightingSystemDto
  ) => Promise<boolean>;
}

export const useLighting = (): UseLightingReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const configureLighting = useCallback(
    async (
      deviceId: string,
      config: LightingSystemConfigDto
    ): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        await DevicesService.devicesControllerConfigureLightingSystem(
          deviceId,
          config
        );
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
    async (deviceId: string): Promise<LightingSystemStatusDto | null> => {
      setLoading(true);
      setError(null);
      try {
        const status =
          await DevicesService.devicesControllerGetLightingSystemStatus(
            deviceId
          );
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
        // TODO: Implement with OpenAPI if color palette endpoint exists
        console.warn("sendColorPalette not implemented with OpenAPI yet", {
          deviceId,
          colors,
        });
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
        await DevicesService.devicesControllerTestLightingSystem(deviceId);
        return true;
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
      updates: UpdateLightingSystemDto
    ): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        await DevicesService.devicesControllerUpdateLightingSystem(
          deviceId,
          updates
        );
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
