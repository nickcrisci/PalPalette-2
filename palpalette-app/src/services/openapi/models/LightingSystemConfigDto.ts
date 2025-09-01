/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type LightingSystemConfigDto = {
    /**
     * Type of lighting system
     */
    lightingSystemType: LightingSystemConfigDto.lightingSystemType;
    /**
     * IP address or hostname of the lighting system
     */
    lightingHostAddress?: string;
    /**
     * Port number for the lighting system connection
     */
    lightingPort?: number;
    /**
     * Authentication token for the lighting system
     */
    lightingAuthToken?: string;
    /**
     * Additional configuration specific to the lighting system type
     */
    lightingCustomConfig?: Record<string, any>;
};
export namespace LightingSystemConfigDto {
    /**
     * Type of lighting system
     */
    export enum lightingSystemType {
        NANOLEAF = 'nanoleaf',
        WLED = 'wled',
        WS2812 = 'ws2812',
        PHILIPS_HUE = 'philips_hue',
    }
}

