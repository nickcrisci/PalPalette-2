import { OpenAPI } from "./openapi";

/**
 * Configure the OpenAPI client with the backend base URL and authentication
 */
export function configureApiClient() {
  // Set the base URL for API calls
  OpenAPI.BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Enable credentials for authentication
  OpenAPI.WITH_CREDENTIALS = true;
  OpenAPI.CREDENTIALS = "include";

  // Set up token resolver for authentication
  OpenAPI.TOKEN = async () => {
    // Get token from localStorage or your preferred storage
    const token = localStorage.getItem("auth_token");
    return token || "";
  };
}

/**
 * Set the authentication token for API requests
 */
export function setApiToken(token: string | null) {
  if (token) {
    localStorage.setItem("auth_token", token);
  } else {
    localStorage.removeItem("auth_token");
  }
}

/**
 * Get the current authentication token
 */
export function getApiToken(): string | null {
  return localStorage.getItem("auth_token");
}

/**
 * Clear the authentication token
 */
export function clearApiToken() {
  localStorage.removeItem("auth_token");
}

// Initialize the API client when this module is imported
configureApiClient();
