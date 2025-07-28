import axios from "axios";
import { getApiUrl } from "../config/api";
import { Preferences } from "@capacitor/preferences";

export interface ColorMessage {
  id: string;
  senderId: string;
  senderName: string;
  colors: Array<{ hex: string }>;
  imageUrl?: string;
  sentAt: string;
  deliveredAt?: string;
}

export interface ReplayResponse {
  success: boolean;
  message: string;
}

export interface SendPaletteResponse {
  success: boolean;
  messages: ColorMessage[];
}

export class MessagesService {
  private static async getAuthHeader() {
    const { value: token } = await Preferences.get({ key: "authToken" });
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Get all received color messages (missed messages)
   */
  static async getReceivedMessages(): Promise<ColorMessage[]> {
    try {
      const headers = await this.getAuthHeader();
      const response = await axios.get(getApiUrl("/users/messages"), {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching received messages:", error);
      throw error;
    }
  }

  /**
   * Get undelivered messages
   */
  static async getUndeliveredMessages(): Promise<ColorMessage[]> {
    try {
      const headers = await this.getAuthHeader();
      const response = await axios.get(
        getApiUrl("/users/messages/undelivered"),
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching undelivered messages:", error);
      throw error;
    }
  }

  /**
   * Replay a message on a specific device
   */
  static async replayMessageOnDevice(
    messageId: string,
    deviceId: string
  ): Promise<ReplayResponse> {
    try {
      const headers = await this.getAuthHeader();
      const response = await axios.post(
        getApiUrl(`/users/messages/${messageId}/replay`),
        { deviceId },
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error("Error replaying message on device:", error);
      throw error;
    }
  }

  /**
   * Send color palette directly to friends (for the main workflow)
   */
  static async sendDirectColorPalette(
    colors: string[],
    friendIds: string[],
    imageUrl?: string
  ): Promise<SendPaletteResponse> {
    try {
      const headers = await this.getAuthHeader();
      const response = await axios.post(
        getApiUrl("/users/palettes/send"),
        {
          colors,
          friendIds,
          imageUrl,
        },
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error("Error sending color palette:", error);
      throw error;
    }
  }
}
