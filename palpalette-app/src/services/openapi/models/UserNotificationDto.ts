/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UserNotificationDto = {
    deviceId: string;
    action: UserNotificationDto.action;
    message: string;
    instructions?: string;
    pairingCode?: string;
    timeout?: number;
    timestamp?: number;
    additionalData?: Record<string, any>;
};
export namespace UserNotificationDto {
    export enum action {
        PRESS_POWER_BUTTON = 'press_power_button',
        ENTER_PAIRING_CODE = 'enter_pairing_code',
        AUTHENTICATION_SUCCESS = 'authentication_success',
        AUTHENTICATION_FAILED = 'authentication_failed',
        NANOLEAF_PAIRING = 'nanoleaf_pairing',
        NANOLEAF_PAIRING_PROGRESS = 'nanoleaf_pairing_progress',
        NANOLEAF_PAIRING_SUCCESS = 'nanoleaf_pairing_success',
        NANOLEAF_PAIRING_FAILED = 'nanoleaf_pairing_failed',
        LIGHTING_AUTHENTICATION_REQUIRED = 'lighting_authentication_required',
    }
}

