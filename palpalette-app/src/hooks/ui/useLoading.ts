import { useState, useCallback, useRef } from "react";

export interface UseLoadingReturn {
  loading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  withLoading: <T>(promise: Promise<T>) => Promise<T>;
}

export const useLoading = (initialState: boolean = false): UseLoadingReturn => {
  const [loading, setLoading] = useState(initialState);
  const loadingRef = useRef(false);

  const startLoading = useCallback(() => {
    loadingRef.current = true;
    setLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    loadingRef.current = false;
    setLoading(false);
  }, []);

  const withLoading = useCallback(
    async <T>(promise: Promise<T>): Promise<T> => {
      startLoading();
      try {
        const result = await promise;
        return result;
      } finally {
        // Only stop loading if this is still the current loading operation
        if (loadingRef.current) {
          stopLoading();
        }
      }
    },
    [startLoading, stopLoading]
  );

  return {
    loading,
    startLoading,
    stopLoading,
    withLoading,
  };
};
