import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { DeviceAuthNotification } from "../../components/notifications";
import { NotificationAction } from "../../services/UserNotificationService";
import { useDeviceNotifications } from "../../hooks/useDeviceNotifications";

// Mock the custom hook
jest.mock("../hooks/useDeviceNotifications");

// Mock Ionic components
jest.mock("@ionic/react", () => ({
  IonCard: ({ children, ...props }: any) => (
    <div data-testid="ion-card" {...props}>
      {children}
    </div>
  ),
  IonCardHeader: ({ children, ...props }: any) => (
    <div data-testid="ion-card-header" {...props}>
      {children}
    </div>
  ),
  IonCardTitle: ({ children, ...props }: any) => (
    <h2 data-testid="ion-card-title" {...props}>
      {children}
    </h2>
  ),
  IonCardContent: ({ children, ...props }: any) => (
    <div data-testid="ion-card-content" {...props}>
      {children}
    </div>
  ),
  IonButton: ({ children, onClick, ...props }: any) => (
    <button data-testid="ion-button" onClick={onClick} {...props}>
      {children}
    </button>
  ),
  IonIcon: ({ name, ...props }: any) => (
    <span data-testid="ion-icon" data-name={name} {...props}></span>
  ),
  IonProgressBar: (props: any) => (
    <div data-testid="ion-progress-bar" {...props}></div>
  ),
  IonText: ({ children, color, ...props }: any) => (
    <span data-testid="ion-text" data-color={color} {...props}>
      {children}
    </span>
  ),
  IonSpinner: (props: any) => <div data-testid="ion-spinner" {...props}></div>,
}));

// Mock icons
jest.mock("ionicons/icons", () => ({
  power: "power-icon",
  wifi: "wifi-icon",
  checkmarkCircle: "checkmark-circle-icon",
  alertCircle: "alert-circle-icon",
  bluetooth: "bluetooth-icon",
}));

const mockUseDeviceNotifications =
  useDeviceNotifications as jest.MockedFunction<typeof useDeviceNotifications>;

describe("DeviceAuthNotification", () => {
  const defaultProps = {
    deviceId: "test-device-123",
    isVisible: true,
    onDismiss: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("No Active Notification", () => {
    beforeEach(() => {
      mockUseDeviceNotifications.mockReturnValue({
        isConnected: true,
        authenticationState: null,
        requestNotificationPermissions: jest.fn(),
      });
    });

    it("should not render when no authentication state", () => {
      const { container } = render(
        <DeviceAuthNotification {...defaultProps} />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe("Power Button Notification", () => {
    beforeEach(() => {
      mockUseDeviceNotifications.mockReturnValue({
        isConnected: true,
        authenticationState: {
          deviceId: "test-device-123",
          isAuthenticating: true,
          currentStep: NotificationAction.PRESS_POWER_BUTTON,
          message: "Please hold the power button for 5 seconds",
          lastUpdate: Date.now(),
        },
        requestNotificationPermissions: jest.fn(),
      });
    });

    it("should render power button instructions", () => {
      render(<DeviceAuthNotification {...defaultProps} />);

      expect(screen.getByTestId("ion-card")).toBeInTheDocument();
      expect(
        screen.getByText("Device Authentication Required")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Please hold the power button for 5 seconds")
      ).toBeInTheDocument();
      expect(screen.getByTestId("ion-icon")).toHaveAttribute(
        "data-name",
        "power-icon"
      );
    });

    it("should show progress indicator for power button action", () => {
      render(<DeviceAuthNotification {...defaultProps} />);

      expect(screen.getByTestId("ion-progress-bar")).toBeInTheDocument();
      expect(
        screen.getByText("Waiting for authentication...")
      ).toBeInTheDocument();
    });

    it("should display step-by-step instructions", () => {
      render(<DeviceAuthNotification {...defaultProps} />);

      expect(screen.getByText(/1\./)).toBeInTheDocument();
      expect(screen.getByText(/Locate the power button/)).toBeInTheDocument();
      expect(screen.getByText(/2\./)).toBeInTheDocument();
      expect(screen.getByText(/Hold the button/)).toBeInTheDocument();
    });
  });

  describe("Nanoleaf Pairing Notification", () => {
    beforeEach(() => {
      mockUseDeviceNotifications.mockReturnValue({
        isConnected: true,
        authenticationState: {
          deviceId: "test-device-123",
          isAuthenticating: true,
          currentStep: NotificationAction.NANOLEAF_PAIRING,
          message: "Pairing with Nanoleaf panels",
          lastUpdate: Date.now(),
        },
        requestNotificationPermissions: jest.fn(),
      });
    });

    it("should render Nanoleaf pairing UI", () => {
      render(<DeviceAuthNotification {...defaultProps} />);

      expect(screen.getByText("Nanoleaf Pairing")).toBeInTheDocument();
      expect(
        screen.getByText("Pairing with Nanoleaf panels")
      ).toBeInTheDocument();
      expect(screen.getByTestId("ion-spinner")).toBeInTheDocument();
    });

    it("should show Nanoleaf-specific instructions", () => {
      render(<DeviceAuthNotification {...defaultProps} />);

      expect(screen.getByText(/Nanoleaf controller/)).toBeInTheDocument();
      expect(screen.getByText(/automatically detect/)).toBeInTheDocument();
    });
  });

  describe("Authentication Success", () => {
    beforeEach(() => {
      mockUseDeviceNotifications.mockReturnValue({
        isConnected: true,
        authenticationState: {
          deviceId: "test-device-123",
          isAuthenticating: false,
          currentStep: NotificationAction.AUTHENTICATION_SUCCESS,
          message: "Device connected successfully!",
          lastUpdate: Date.now(),
        },
        requestNotificationPermissions: jest.fn(),
      });
    });

    it("should render success state", () => {
      render(<DeviceAuthNotification {...defaultProps} />);

      expect(screen.getByText("Authentication Successful")).toBeInTheDocument();
      expect(
        screen.getByText("Device connected successfully!")
      ).toBeInTheDocument();
      expect(screen.getByTestId("ion-icon")).toHaveAttribute(
        "data-name",
        "checkmark-circle-icon"
      );
      expect(screen.getByTestId("ion-text")).toHaveAttribute(
        "data-color",
        "success"
      );
    });

    it("should auto-dismiss success notification after timeout", async () => {
      const { rerender } = render(<DeviceAuthNotification {...defaultProps} />);

      expect(screen.getByText("Authentication Successful")).toBeInTheDocument();

      // Mock state change to null after timeout
      mockUseDeviceNotifications.mockReturnValue({
        isConnected: true,
        authenticationState: null,
        requestNotificationPermissions: jest.fn(),
      });

      rerender(<DeviceAuthNotification {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.queryByText("Authentication Successful")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Authentication Failure", () => {
    beforeEach(() => {
      mockUseDeviceNotifications.mockReturnValue({
        isConnected: true,
        authenticationState: {
          deviceId: "test-device-123",
          isAuthenticating: false,
          currentStep: NotificationAction.AUTHENTICATION_FAILED,
          message: "Authentication failed. Please try again.",
          lastUpdate: Date.now(),
        },
        requestNotificationPermissions: jest.fn(),
      });
    });

    it("should render failure state", () => {
      render(<DeviceAuthNotification {...defaultProps} />);

      expect(screen.getByText("Authentication Failed")).toBeInTheDocument();
      expect(
        screen.getByText("Authentication failed. Please try again.")
      ).toBeInTheDocument();
      expect(screen.getByTestId("ion-icon")).toHaveAttribute(
        "data-name",
        "alert-circle-icon"
      );
      expect(screen.getByTestId("ion-text")).toHaveAttribute(
        "data-color",
        "danger"
      );
    });

    it("should show retry button on failure", () => {
      render(<DeviceAuthNotification {...defaultProps} />);

      const retryButton = screen.getByText("Try Again");
      expect(retryButton).toBeInTheDocument();
      expect(retryButton.closest("button")).toHaveAttribute(
        "data-testid",
        "ion-button"
      );
    });

    it("should call retry handler when retry button clicked", () => {
      const mockRetry = jest.fn();

      render(<DeviceAuthNotification {...defaultProps} onRetry={mockRetry} />);

      const retryButton = screen.getByText("Try Again");
      fireEvent.click(retryButton);

      expect(mockRetry).toHaveBeenCalledWith("test-device-123");
    });
  });

  describe("Pairing Code Display", () => {
    beforeEach(() => {
      mockUseDeviceNotifications.mockReturnValue({
        isConnected: true,
        authenticationState: {
          deviceId: "test-device-123",
          isAuthenticating: true,
          currentStep: NotificationAction.ENTER_PAIRING_CODE,
          message: "Enter the pairing code on your device",
          pairingCode: "123456",
          lastUpdate: Date.now(),
        },
        requestNotificationPermissions: jest.fn(),
      });
    });

    it("should display pairing code when available", () => {
      render(<DeviceAuthNotification {...defaultProps} />);

      expect(screen.getByText("Pairing Code Required")).toBeInTheDocument();
      expect(screen.getByText("123456")).toBeInTheDocument();
      expect(
        screen.getByText("Enter the pairing code on your device")
      ).toBeInTheDocument();
    });

    it("should format pairing code correctly", () => {
      render(<DeviceAuthNotification {...defaultProps} />);

      const codeElement = screen.getByText("123456");
      expect(codeElement.closest("div")).toHaveClass("pairing-code-display");
    });
  });

  describe("Connection Status", () => {
    it("should show disconnected state when WebSocket not connected", () => {
      mockUseDeviceNotifications.mockReturnValue({
        isConnected: false,
        authenticationState: {
          deviceId: "test-device-123",
          isAuthenticating: true,
          currentStep: NotificationAction.PRESS_POWER_BUTTON,
          message: "Please hold the power button",
          lastUpdate: Date.now(),
        },
        requestNotificationPermissions: jest.fn(),
      });

      render(<DeviceAuthNotification {...defaultProps} />);

      expect(screen.getByText(/Connection lost/)).toBeInTheDocument();
      expect(screen.getByText(/Reconnecting/)).toBeInTheDocument();
    });
  });

  describe("Timeout Handling", () => {
    it("should show timeout warning when notification is old", () => {
      const oldTimestamp = Date.now() - 2 * 60 * 1000; // 2 minutes ago

      mockUseDeviceNotifications.mockReturnValue({
        isConnected: true,
        authenticationState: {
          deviceId: "test-device-123",
          isAuthenticating: true,
          currentStep: NotificationAction.PRESS_POWER_BUTTON,
          message: "Please hold the power button",
          lastUpdate: oldTimestamp,
        },
        requestNotificationPermissions: jest.fn(),
      });

      render(<DeviceAuthNotification {...defaultProps} />);

      expect(
        screen.getByText(/This request may have expired/)
      ).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    beforeEach(() => {
      mockUseDeviceNotifications.mockReturnValue({
        isConnected: true,
        authenticationState: {
          deviceId: "test-device-123",
          isAuthenticating: true,
          currentStep: NotificationAction.PRESS_POWER_BUTTON,
          message: "Please hold the power button for 5 seconds",
          lastUpdate: Date.now(),
        },
        requestNotificationPermissions: jest.fn(),
      });
    });

    it("should have proper ARIA labels for screen readers", () => {
      render(<DeviceAuthNotification {...defaultProps} />);

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(
        screen.getByLabelText(/device authentication/i)
      ).toBeInTheDocument();
    });

    it("should have proper heading structure", () => {
      render(<DeviceAuthNotification {...defaultProps} />);

      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveTextContent("Device Authentication Required");
    });
  });

  describe("Custom Props", () => {
    it("should handle custom className", () => {
      mockUseDeviceNotifications.mockReturnValue({
        isConnected: true,
        authenticationState: {
          deviceId: "test-device-123",
          isAuthenticating: true,
          currentStep: NotificationAction.PRESS_POWER_BUTTON,
          message: "Test message",
          lastUpdate: Date.now(),
        },
        requestNotificationPermissions: jest.fn(),
      });

      render(
        <DeviceAuthNotification {...defaultProps} className="custom-class" />
      );

      expect(screen.getByTestId("ion-card")).toHaveClass("custom-class");
    });

    it("should handle onDismiss callback", () => {
      const mockDismiss = jest.fn();

      mockUseDeviceNotifications.mockReturnValue({
        isConnected: true,
        authenticationState: {
          deviceId: "test-device-123",
          isAuthenticating: false,
          currentStep: NotificationAction.AUTHENTICATION_SUCCESS,
          message: "Success!",
          lastUpdate: Date.now(),
        },
        requestNotificationPermissions: jest.fn(),
      });

      render(
        <DeviceAuthNotification {...defaultProps} onDismiss={mockDismiss} />
      );

      const dismissButton = screen.getByText("Dismiss");
      fireEvent.click(dismissButton);

      expect(mockDismiss).toHaveBeenCalledWith("test-device-123");
    });
  });
});
