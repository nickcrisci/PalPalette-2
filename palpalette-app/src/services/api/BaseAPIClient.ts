import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { getApiUrl } from "../../config/api";
import { Preferences } from "@capacitor/preferences";

/**
 * Base API client with authentication and error handling
 */
export class BaseAPIClient {
  protected client: AxiosInstance;

  constructor(baseURL?: string) {
    this.client = axios.create({
      baseURL: baseURL || getApiUrl(""),
      timeout: 10000,
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const { value: token } = await Preferences.get({ key: "authToken" });
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        // Handle common error scenarios
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.handleAuthError();
        }
        return Promise.reject(error);
      }
    );
  }

  private async handleAuthError() {
    // Clear invalid token
    await Preferences.remove({ key: "authToken" });
    // Could trigger a logout or redirect to login
    console.warn("Authentication token expired or invalid");
  }

  protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  protected async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  protected async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  protected async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export default BaseAPIClient;
