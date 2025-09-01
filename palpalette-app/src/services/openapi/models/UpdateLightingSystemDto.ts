/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateLightingSystemDto = {
    /**
     * Type of lighting system
     */
    lightingSystemType?: UpdateLightingSystemDto.lightingSystemType;
    /**
     * Updated IP address or hostname
     */
    lightingHostAddress?: string;
    /**
     * Updated port number
     */
    lightingPort?: number;
    /**
     * Updated authentication token
     */
    lightingAuthToken?: string;
    /**
     * Updated custom configuration
     */
    lightingCustomConfig?: Record<string, any>;
    /**
     * Whether the lighting system is configured
     */
    lightingSystemConfigured?: boolean;
    /**
     * Current status of the lighting system
     */
    lightingStatus?: UpdateLightingSystemDto.lightingStatus;
};
export namespace UpdateLightingSystemDto {
    /**
     * Type of lighting system
     */
    export enum lightingSystemType {
        NANOLEAF = 'nanoleaf',
        WLED = 'wled',
        WS2812 = 'ws2812',
        PHILIPS_HUE = 'philips_hue',
    }
    /**
     * Current status of the lighting system
     */
    export enum lightingStatus {
        UNKNOWN = 'unknown',
        WORKING = 'working',
        ERROR = 'error',
        AUTHENTICATION_REQUIRED = 'authentication_required',
    }
}

