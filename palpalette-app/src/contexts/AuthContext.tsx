import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { authService } from "../services/AuthService";

export interface User {
  id: string;
  email: string;
  displayName: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Load stored authentication data on app start
   */
  const loadStoredAuth = useCallback(async () => {
    try {
      setLoading(true);
      const storedToken = await authService.getStoredToken();
      const storedUser = await authService.getStoredUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        console.log("✅ Loaded stored authentication data");
      }
    } catch (error) {
      console.error("❌ Failed to load stored auth data:", error);
      // Clear invalid data
      await authService.logout();
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh user data from server
   */
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      // The auth service will handle token refresh automatically via interceptors
      // Just reload the stored user data
      const storedUser = await authService.getStoredUser();
      if (storedUser) {
        setUser(storedUser);
      }
    } catch (error) {
      console.error("❌ Failed to refresh user data:", error);
    }
  }, []);

  /**
   * Login with email and password
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { token: authToken, user: userData } = await authService.login(
        email,
        password
      );

      setToken(authToken);
      setUser(userData);

      console.log("✅ Login successful");
      return true;
    } catch (error) {
      console.error("❌ Login failed:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register new user
   */
  const register = async (
    email: string,
    password: string,
    displayName: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      const { token: authToken, user: userData } = await authService.register(
        email,
        password,
        displayName
      );

      setToken(authToken);
      setUser(userData);

      console.log("✅ Registration successful");
      return true;
    } catch (error) {
      console.error("❌ Registration failed:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await authService.logout();

      setToken(null);
      setUser(null);

      console.log("✅ Logout successful");
    } catch (error) {
      console.error("❌ Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load stored auth data on app start
  useEffect(() => {
    loadStoredAuth();
  }, [loadStoredAuth]);
  // Load stored auth data on app start
  useEffect(() => {
    loadStoredAuth();
  }, [loadStoredAuth]);

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user && !!token,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
