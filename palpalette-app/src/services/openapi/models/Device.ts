/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Message } from './Message';
import type { User } from './User';
export type Device = {
    id: string;
    name: string;
    type: string;
    user: User | null;
    status: string;
    lastSeenAt: string;
    pairingCode: string;
    pairingCodeExpiresAt: string;
    macAddress: string;
    isProvisioned: boolean;
    isOnline: boolean;
    ipAddress: string;
    wifiRSSI: number;
    firmwareVersion: string;
    systemStats: Record<string, any>;
    lightingSystemType: string;
    lightingHostAddress: string;
    lightingPort: number;
    lightingAuthToken: string;
    lightingCustomConfig: Record<string, any>;
    lightingSystemConfigured: boolean;
    lightingLastTestAt: string;
    lightingStatus: string;
    lightingCapabilities: Record<string, any>;
    lightingLastStatusUpdate: string;
    createdAt: string;
    updatedAt: string;
    messages: Array<Message>;
};

