import {
  AuthenticationService,
  LoginRequestDto,
  RegisterUserDto,
} from "./openapi";
import { configureApiClient, setApiToken, clearApiToken } from "./api-config";

// Define response types
interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  user?: unknown;
}

interface RegisterResponse {
  success: boolean;
  user?: unknown;
}

interface RefreshResponse {
  access_token: string;
  refresh_token?: string;
}

interface ValidateResponse {
  valid: boolean;
  user?: unknown;
}

/**
 * Enhanced authentication service using the generated OpenAPI client
 */
export class ApiAuthService {
  constructor() {
    // Configure the API client when the service is instantiated
    configureApiClient();
  }

  /**
   * Login user and store authentication token
   */
  async login(
    email: string,
    password: string,
    deviceName?: string
  ): Promise<LoginResponse> {
    const loginData: LoginRequestDto = {
      email,
      password,
      device_name: deviceName,
    };

    try {
      const response = (await AuthenticationService.authControllerLogin(
        loginData
      )) as LoginResponse;

      // Extract and store the token from the response
      if (response.access_token) {
        setApiToken(response.access_token);
      }

      return response;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  /**
   * Register a new user
   */
  async register(
    email: string,
    password: string,
    displayName: string
  ): Promise<RegisterResponse> {
    const registerData: RegisterUserDto = {
      email,
      password,
      displayName,
    };

    try {
      const response = (await AuthenticationService.authControllerRegister(
        registerData
      )) as RegisterResponse;
      return response;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  }

  /**
   * Refresh authentication tokens
   */
  async refreshToken(refreshToken: string): Promise<RefreshResponse> {
    try {
      const response = (await AuthenticationService.authControllerRefresh({
        refresh_token: refreshToken,
      })) as RefreshResponse;

      // Update stored token
      if (response.access_token) {
        setApiToken(response.access_token);
      }

      return response;
    } catch (error) {
      console.error("Token refresh failed:", error);
      throw error;
    }
  }

  /**
   * Logout user and clear stored tokens
   */
  async logout(): Promise<void> {
    try {
      await AuthenticationService.authControllerLogout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Always clear local tokens, even if the API call fails
      clearApiToken();
    }
  }

  /**
   * Validate the current token
   */
  async validateToken(token: string): Promise<ValidateResponse> {
    try {
      const response = (await AuthenticationService.authControllerValidate({
        token,
      })) as ValidateResponse;
      return response;
    } catch (error) {
      console.error("Token validation failed:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const apiAuthService = new ApiAuthService();
