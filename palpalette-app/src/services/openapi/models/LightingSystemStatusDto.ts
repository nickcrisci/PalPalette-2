/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type LightingSystemStatusDto = {
    /**
     * Type of lighting system
     */
    lightingSystemType: string;
    /**
     * IP address of the lighting system
     */
    lightingHostAddress?: string;
    /**
     * Port of the lighting system
     */
    lightingPort?: number;
    /**
     * Whether the lighting system is configured
     */
    lightingSystemConfigured: boolean;
    /**
     * Current status of the lighting system
     */
    lightingStatus: string;
    /**
     * Last time the lighting system was tested
     */
    lightingLastTestAt?: string;
    /**
     * Whether the lighting system requires authentication
     */
    requiresAuthentication: boolean;
    /**
     * Capabilities of the lighting system
     */
    capabilities?: Record<string, any>;
};

