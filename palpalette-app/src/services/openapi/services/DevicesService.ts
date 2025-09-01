/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ClaimByCodeDto } from '../models/ClaimByCodeDto';
import type { Device } from '../models/Device';
import type { LightingSystemConfigDto } from '../models/LightingSystemConfigDto';
import type { LightingSystemStatusDto } from '../models/LightingSystemStatusDto';
import type { NotificationResponseDto } from '../models/NotificationResponseDto';
import type { RegisterDeviceDto } from '../models/RegisterDeviceDto';
import type { UpdateDeviceDto } from '../models/UpdateDeviceDto';
import type { UpdateLightingSystemDto } from '../models/UpdateLightingSystemDto';
import type { UpdateStatusDto } from '../models/UpdateStatusDto';
import type { UserNotificationDto } from '../models/UserNotificationDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DevicesService {
    /**
     * Register a new device (self-setup)
     * @param requestBody
     * @returns any Device registered successfully
     * @throws ApiError
     */
    public static devicesControllerRegisterDevice(
        requestBody: RegisterDeviceDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/devices/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request - validation error`,
                409: `Device already exists`,
            },
        });
    }
    /**
     * Get pairing code for device
     * @param deviceId Device ID
     * @returns any Pairing code retrieved successfully
     * @throws ApiError
     */
    public static devicesControllerGetPairingCode(
        deviceId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/devices/pairing-code/{deviceId}',
            path: {
                'deviceId': deviceId,
            },
            errors: {
                404: `Device not found`,
            },
        });
    }
    /**
     * Claim a device using pairing code
     * @param requestBody
     * @returns any Device claimed successfully
     * @throws ApiError
     */
    public static devicesControllerClaimByCode(
        requestBody: ClaimByCodeDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/devices/claim-by-code',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request - invalid pairing code`,
                401: `Unauthorized`,
                404: `Device or pairing code not found`,
            },
        });
    }
    /**
     * Reset device to unclaimed state
     * @param id Device ID
     * @returns any Device reset successfully
     * @throws ApiError
     */
    public static devicesControllerResetDevice(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/devices/{id}/reset',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - not device owner`,
                404: `Device not found`,
            },
        });
    }
    /**
     * Update device status (for device self-reporting)
     * @param id Device ID
     * @param requestBody
     * @returns any Device status updated successfully
     * @throws ApiError
     */
    public static devicesControllerUpdateStatus(
        id: string,
        requestBody: UpdateStatusDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/devices/{id}/status',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request - validation error`,
                404: `Device not found`,
            },
        });
    }
    /**
     * Find device by MAC address
     * @param macAddress MAC address of the device
     * @returns any Device found
     * @throws ApiError
     */
    public static devicesControllerFindDeviceByMacAddress(
        macAddress: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/devices/by-mac/{macAddress}',
            path: {
                'macAddress': macAddress,
            },
            errors: {
                404: `Device not found`,
            },
        });
    }
    /**
     * Discover unpaired devices available for pairing
     * @returns any List of discoverable unpaired devices
     * @throws ApiError
     */
    public static devicesControllerDiscoverUnpairedDevices(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/devices/discover/unpaired',
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public static devicesControllerDebugAllDevices(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/devices/debug/all-devices',
        });
    }
    /**
     * @param deviceId
     * @returns any
     * @throws ApiError
     */
    public static devicesControllerGetDevicePairingInfo(
        deviceId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/devices/{deviceId}/pairing-info',
            path: {
                'deviceId': deviceId,
            },
        });
    }
    /**
     * Configure lighting system for device
     * @param id Device ID
     * @param requestBody
     * @returns any Lighting system configured successfully
     * @returns Device
     * @throws ApiError
     */
    public static devicesControllerConfigureLightingSystem(
        id: string,
        requestBody: LightingSystemConfigDto,
    ): CancelablePromise<any | Device> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/devices/{id}/lighting/configure',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request - validation error`,
                401: `Unauthorized`,
                403: `Forbidden - not device owner`,
                404: `Device not found`,
            },
        });
    }
    /**
     * Update lighting system configuration
     * @param id Device ID
     * @param requestBody
     * @returns any Lighting system updated successfully
     * @throws ApiError
     */
    public static devicesControllerUpdateLightingSystem(
        id: string,
        requestBody: UpdateLightingSystemDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/devices/{id}/lighting',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request - validation error`,
                404: `Device not found`,
            },
        });
    }
    /**
     * @param id
     * @returns Device
     * @throws ApiError
     */
    public static devicesControllerResetLightingSystem(
        id: string,
    ): CancelablePromise<Device> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/devices/{id}/lighting',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Test lighting system connection
     * @param id Device ID
     * @returns any Test completed successfully
     * @throws ApiError
     */
    public static devicesControllerTestLightingSystem(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/devices/{id}/lighting/test',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - not device owner`,
                404: `Device not found`,
                500: `Lighting system connection failed`,
            },
        });
    }
    /**
     * @param id
     * @returns LightingSystemStatusDto
     * @throws ApiError
     */
    public static devicesControllerGetLightingSystemStatus(
        id: string,
    ): CancelablePromise<LightingSystemStatusDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/devices/{id}/lighting/status',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param requestBody
     * @returns NotificationResponseDto
     * @throws ApiError
     */
    public static devicesControllerSendUserNotification(
        requestBody: UserNotificationDto,
    ): CancelablePromise<NotificationResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/devices/notifications/user-action',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns LightingSystemStatusDto
     * @throws ApiError
     */
    public static devicesControllerGetMyDevicesLightingSystems(): CancelablePromise<Array<LightingSystemStatusDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/devices/my-devices/lighting-systems',
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public static devicesControllerGetSupportedLightingSystems(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/devices/lighting/supported-systems',
        });
    }
    /**
     * @param systemType
     * @returns any
     * @throws ApiError
     */
    public static devicesControllerGetDefaultLightingConfig(
        systemType: string,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/devices/lighting/{systemType}/default-config',
            path: {
                'systemType': systemType,
            },
        });
    }
    /**
     * Get devices owned by current user
     * @returns any User devices retrieved successfully
     * @throws ApiError
     */
    public static devicesControllerGetMyDevices(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/devices/my-devices',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Get all devices (admin)
     * @returns any All devices retrieved successfully
     * @throws ApiError
     */
    public static devicesControllerFindAll(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/devices',
        });
    }
    /**
     * Get device by ID
     * @param id Device ID
     * @returns any Device retrieved successfully
     * @throws ApiError
     */
    public static devicesControllerFindOne(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/devices/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Device not found`,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns Device
     * @throws ApiError
     */
    public static devicesControllerUpdate(
        id: string,
        requestBody: UpdateDeviceDto,
    ): CancelablePromise<Device> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/devices/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static devicesControllerRemove(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/devices/{id}',
            path: {
                'id': id,
            },
        });
    }
}
