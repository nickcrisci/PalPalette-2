import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";

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
      const storedToken = localStorage.getItem("auth_token");
      const userStr = localStorage.getItem("auth_user");
      if (storedToken && userStr) {
        setToken(storedToken);
        setUser(JSON.parse(userStr));
        console.log("✅ Loaded stored authentication data");
      }
    } catch (error) {
      console.error("❌ Failed to load stored auth data:", error);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh user data from server
   */
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const userStr = localStorage.getItem("auth_user");
      if (userStr) {
        setUser(JSON.parse(userStr));
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
      const { AuthenticationService } = await import(
        "../services/openapi/services/AuthenticationService"
      );
      const loginDto = { email, password };
      const data = await AuthenticationService.authControllerLogin(loginDto);
      console.log(data);
      const { access_token, refresh_token, user: userData } = data;
      localStorage.setItem("auth_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("auth_user", JSON.stringify(userData));
      setToken(access_token);
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
      const { AuthenticationService } = await import(
        "../services/openapi/services/AuthenticationService"
      );
      const registerDto = { email, password, displayName };
      const data = await AuthenticationService.authControllerRegister(
        registerDto
      );
      const { access_token, refresh_token, user: userData } = data;
      localStorage.setItem("auth_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("auth_user", JSON.stringify(userData));
      setToken(access_token);
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
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("auth_user");
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
