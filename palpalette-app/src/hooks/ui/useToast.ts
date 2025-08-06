import { useState, useCallback } from "react";

export interface ToastState {
  isOpen: boolean;
  message: string;
  color?:
    | "success"
    | "warning"
    | "danger"
    | "primary"
    | "secondary"
    | "tertiary";
  duration?: number;
}

export interface UseToastReturn {
  toastState: ToastState;
  showToast: (
    message: string,
    color?: ToastState["color"],
    duration?: number
  ) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  hideToast: () => void;
}

export const useToast = (): UseToastReturn => {
  const [toastState, setToastState] = useState<ToastState>({
    isOpen: false,
    message: "",
    color: "primary",
    duration: 3000,
  });

  const showToast = useCallback(
    (
      message: string,
      color: ToastState["color"] = "primary",
      duration: number = 3000
    ) => {
      setToastState({
        isOpen: true,
        message,
        color,
        duration,
      });
    },
    []
  );

  const showSuccess = useCallback(
    (message: string, duration: number = 3000) => {
      showToast(message, "success", duration);
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string, duration: number = 4000) => {
      showToast(message, "danger", duration);
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message: string, duration: number = 3500) => {
      showToast(message, "warning", duration);
    },
    [showToast]
  );

  const hideToast = useCallback(() => {
    setToastState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  return {
    toastState,
    showToast,
    showSuccess,
    showError,
    showWarning,
    hideToast,
  };
};
