// API Configuration
export const API_CONFIG = {
  BASE_URL: "http://localhost:3000", // Backend URL
  WEBSOCKET_URL: "http://localhost:3001", // WebSocket server for device communication
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
