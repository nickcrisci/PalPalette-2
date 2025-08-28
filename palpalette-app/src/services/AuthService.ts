import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { Preferences } from "@capacitor/preferences";
import { Device } from "@capacitor/device";
import { API_CONFIG, getApiUrl } from "../config/api";

// Token storage keys
const TOKEN_KEY = "authToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_DATA_KEY = "userData";

// Track if we're currently refreshing
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

export class AuthService {
  private static instance: AuthService;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  constructor() {
    this.setupAxiosInterceptors();
  }

  /**
   * Setup axios interceptors for automatic token refresh
   */
  private setupAxiosInterceptors() {
    // Request interceptor to add token to headers
    axios.interceptors.request.use(
      async (config) => {
        const token = await this.getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for automatic token refresh on 401
    axios.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (isRefreshing) {
            // If we're already refreshing, queue this request
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return axios(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            const newToken = await this.refreshToken();
            if (newToken) {
              processQueue(null, newToken);
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              return axios(originalRequest);
            } else {
              // Refresh failed, logout user
              await this.logout();
              processQueue(new Error("Token refresh failed"), null);
              return Promise.reject(error);
            }
          } catch (refreshError) {
            processQueue(refreshError, null);
            await this.logout();
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Login with email and password
   */
  async login(
    email: string,
    password: string
  ): Promise<{ token: string; user: any }> {
    const deviceName = await this.resolveDeviceName();

    const response = await axios.post(
      getApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN),
      {
        email,
        password,
        device_name: deviceName,
      }
    );

    const { access_token, refresh_token, user } = response.data;

    // Store tokens and user data
    await this.storeAuthData(access_token, refresh_token, user);

    return { token: access_token, user };
  }

  /**
   * Register new user
   */
  async register(
    email: string,
    password: string,
    displayName: string
  ): Promise<{ token: string; user: any }> {
    const deviceName = await this.resolveDeviceName();

    const response = await axios.post(
      getApiUrl(API_CONFIG.ENDPOINTS.AUTH.REGISTER),
      {
        email,
        password,
        displayName,
        //device_name: deviceName,
      }
    );

    const { access_token, refresh_token, user } = response.data;

    // Store tokens and user data
    await this.storeAuthData(access_token, refresh_token, user);

    return { token: access_token, user };
  }

  /**
   * Refresh the access token using the refresh token
   */
  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = await this.getStoredRefreshToken();
      if (!refreshToken) {
        console.log("🔐 No refresh token available");
        return null;
      }

      const response = await axios.post(
        getApiUrl(API_CONFIG.ENDPOINTS.AUTH.REFRESH),
        {
          refresh_token: refreshToken,
        }
      );

      const {
        access_token,
        refresh_token: newRefreshToken,
        user,
      } = response.data;

      // Store new tokens
      await this.storeAuthData(access_token, newRefreshToken, user);

      console.log("✅ Token refreshed successfully");
      return access_token;
    } catch (error) {
      console.error("❌ Token refresh failed:", error);
      return null;
    }
  }

  /**
   * Logout user and clear stored data
   */
  async logout(): Promise<void> {
    try {
      // Try to invalidate token on server
      const token = await this.getStoredToken();
      if (token) {
        try {
          await axios.post(
            getApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGOUT || "/auth/logout"),
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        } catch (error) {
          // Ignore logout endpoint errors
          console.warn("Logout endpoint failed, continuing with local cleanup");
        }
      }
    } finally {
      // Always clear local storage
      await this.clearAuthData();
    }
  }

  /**
   * Get stored access token
   */
  async getStoredToken(): Promise<string | null> {
    const result = await Preferences.get({ key: TOKEN_KEY });
    return result.value;
  }

  /**
   * Get stored refresh token
   */
  async getStoredRefreshToken(): Promise<string | null> {
    const result = await Preferences.get({ key: REFRESH_TOKEN_KEY });
    return result.value;
  }

  /**
   * Get stored user data
   */
  async getStoredUser(): Promise<any | null> {
    const result = await Preferences.get({ key: USER_DATA_KEY });
    return result.value ? JSON.parse(result.value) : null;
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getStoredToken();
    return !!token;
  }

  /**
   * Store authentication data
   */
  private async storeAuthData(
    accessToken: string,
    refreshToken: string,
    user: any
  ): Promise<void> {
    await Promise.all([
      Preferences.set({ key: TOKEN_KEY, value: accessToken }),
      Preferences.set({ key: REFRESH_TOKEN_KEY, value: refreshToken }),
      Preferences.set({ key: USER_DATA_KEY, value: JSON.stringify(user) }),
    ]);
  }

  /**
   * Clear all authentication data
   */
  private async clearAuthData(): Promise<void> {
    await Promise.all([
      Preferences.remove({ key: TOKEN_KEY }),
      Preferences.remove({ key: REFRESH_TOKEN_KEY }),
      Preferences.remove({ key: USER_DATA_KEY }),
    ]);

    // Clear axios default header
    delete axios.defaults.headers.common["Authorization"];
  }

  /**
   * Resolve device name for registration
   */
  private async resolveDeviceName(
    fallback = "PalPalette - Mobile App"
  ): Promise<string> {
    try {
      const deviceInfo = await Device.getInfo();
      return deviceInfo.name || fallback;
    } catch (error) {
      console.warn("Could not get device name, using fallback");
      return fallback;
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
