import { useState, useCallback, useEffect } from "react";

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: {
    id: string;
    username: string;
    email?: string;
  } | null;
}

export interface UseAuthReturn extends AuthState {
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
}

const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_KEY = "auth_user";

export const useAuth = (): UseAuthReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    token: null,
    user: null,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const userStr = localStorage.getItem(AUTH_USER_KEY);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setAuthState({
          isAuthenticated: true,
          token,
          user,
        });
      } catch (err) {
        console.error("Failed to parse stored user data:", err);
        // Clear invalid data
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
      }
    }
  }, []);

  const login = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        // This would be replaced with actual API call
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
          throw new Error("Login failed");
        }

        const data = await response.json();
        const { token, user } = data;

        // Store in localStorage
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));

        // Update state
        setAuthState({
          isAuthenticated: true,
          token,
          user,
        });

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Login failed";
        setError(errorMessage);
        console.error("Login error:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const register = useCallback(
    async (
      username: string,
      email: string,
      password: string
    ): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        // This would be replaced with actual API call
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, email, password }),
        });

        if (!response.ok) {
          throw new Error("Registration failed");
        }

        const data = await response.json();
        const { token, user } = data;

        // Store in localStorage
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));

        // Update state
        setAuthState({
          isAuthenticated: true,
          token,
          user,
        });

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Registration failed";
        setError(errorMessage);
        console.error("Registration error:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    // Clear localStorage
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);

    // Clear state
    setAuthState({
      isAuthenticated: false,
      token: null,
      user: null,
    });
    setError(null);
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (!authState.token) return false;

    setLoading(true);
    setError(null);

    try {
      // This would be replaced with actual API call
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authState.token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data = await response.json();
      const { token, user } = data;

      // Update stored token
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));

      // Update state
      setAuthState({
        isAuthenticated: true,
        token,
        user,
      });

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Token refresh failed";
      setError(errorMessage);
      console.error("Token refresh error:", err);

      // On refresh failure, logout the user
      logout();
      return false;
    } finally {
      setLoading(false);
    }
  }, [authState.token, logout]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    ...authState,
    loading,
    error,
    login,
    logout,
    register,
    refreshToken,
    clearError,
  };
};
