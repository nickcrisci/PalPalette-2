// Environment-based API Configuration
const getEnvironmentConfig = () => {
  // Check if we're in a Vite environment (development/build)
  const isVite = typeof import.meta !== "undefined" && import.meta.env;

  if (isVite) {
    // Vite environment - use import.meta.env
    return {
      BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
      WEBSOCKET_URL:
        import.meta.env.VITE_WEBSOCKET_URL || "http://localhost:3001",
      ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || "development",
      DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === "true",
      LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || "debug",
    };
  } else {
    // Capacitor/native environment - fallback to production values
    return {
      BASE_URL: "http://cides06.gm.fh-koeln.de:3000",
      WEBSOCKET_URL: "http://cides06.gm.fh-koeln.de:3001",
      ENVIRONMENT: "production",
      DEBUG_MODE: false,
      LOG_LEVEL: "error",
    };
  }
};

const ENV_CONFIG = getEnvironmentConfig();

// Log current configuration (only in debug mode)
if (ENV_CONFIG.DEBUG_MODE) {
  console.log("🔧 PalPalette API Configuration:", {
    BASE_URL: ENV_CONFIG.BASE_URL,
    WEBSOCKET_URL: ENV_CONFIG.WEBSOCKET_URL,
    ENVIRONMENT: ENV_CONFIG.ENVIRONMENT,
    DEBUG_MODE: ENV_CONFIG.DEBUG_MODE,
  });
}

export const API_CONFIG = {
  BASE_URL: ENV_CONFIG.BASE_URL,
  WEBSOCKET_URL: ENV_CONFIG.WEBSOCKET_URL,
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login",
      REGISTER: "/auth/register",
      REFRESH: "/auth/refresh",
    },
    DEVICES: {
      MY_DEVICES: "/devices/my-devices",
      CLAIM: "/devices/claim",
      SETUP_COMPLETE: "/devices/setup-complete",
      SETUP_STATUS: (id: string) => `/devices/setup-status/${id}`,
    },
    MESSAGES: {
      SEND: "/messages",
    },
    FRIENDS: {
      SEND_REQUEST: "/users/friends/request",
      RESPOND: "/users/friends/respond",
      LIST: "/users/friends",
      PENDING: "/users/friends/pending",
      SENT: "/users/friends/sent",
    },
    PALETTES: {
      CREATE: "/users/palettes",
      LIST: "/users/palettes",
      GET: (id: string) => `/users/palettes/${id}`,
      UPDATE: (id: string) => `/users/palettes/${id}`,
      DELETE: (id: string) => `/users/palettes/${id}`,
      SEND: "/users/palettes/send",
    },
  },
};

// Environment specific configuration
export const getApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Export environment config for other parts of the app
export const ENV = ENV_CONFIG;
