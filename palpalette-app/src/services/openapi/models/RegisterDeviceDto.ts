/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type RegisterDeviceDto = {
    /**
     * MAC address of the device in XX:XX:XX:XX:XX:XX format
     */
    macAddress: string;
    /**
     * IP address of the device
     */
    ipAddress?: string;
    /**
     * Type of the device
     */
    deviceType?: string;
    /**
     * Firmware version of the device
     */
    firmwareVersion?: string;
    /**
     * Type of lighting system to connect to
     */
    lightingSystemType?: string;
    /**
     * Host address of the lighting system
     */
    lightingHostAddress?: string;
    /**
     * Port for lighting system connection
     */
    lightingPort?: number;
    /**
     * Authentication token for lighting system
     */
    lightingAuthToken?: string;
    /**
     * Custom configuration object for specific lighting systems
     */
    lightingCustomConfig?: Record<string, any>;
};

