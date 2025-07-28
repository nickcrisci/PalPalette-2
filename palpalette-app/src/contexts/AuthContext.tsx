import React, { createContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { getApiUrl, API_CONFIG } from "../config/api";
import { Preferences } from "@capacitor/preferences";

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
  logout: () => void;
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

  // Load stored auth data on app start
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await Preferences.get({ key: "authToken" });
      const storedUser = await Preferences.get({ key: "userData" });

      if (storedToken.value && storedUser.value) {
        setToken(storedToken.value);
        setUser(JSON.parse(storedUser.value));

        // Set axios default header for future requests
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${storedToken.value}`;
      }
    } catch (error) {
      console.error("Failed to load stored auth data:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await axios.post(
        getApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN),
        {
          email,
          password,
        }
      );

      const { access_token, user: userData } = response.data;

      // Store auth data
      await Preferences.set({ key: "authToken", value: access_token });
      await Preferences.set({
        key: "userData",
        value: JSON.stringify(userData),
      });

      setToken(access_token);
      setUser(userData);

      // Set axios default header
      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    displayName: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await axios.post(
        getApiUrl(API_CONFIG.ENDPOINTS.AUTH.REGISTER),
        {
          email,
          password,
          displayName,
        }
      );

      const { access_token, user: userData } = response.data;

      // Store auth data
      await Preferences.set({ key: "authToken", value: access_token });
      await Preferences.set({
        key: "userData",
        value: JSON.stringify(userData),
      });

      setToken(access_token);
      setUser(userData);

      // Set axios default header
      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear stored auth data
      await Preferences.remove({ key: "authToken" });
      await Preferences.remove({ key: "userData" });

      setToken(null);
      setUser(null);

      // Remove axios default header
      delete axios.defaults.headers.common["Authorization"];
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
