/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateMessageDto } from '../models/CreateMessageDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MessagesService {
    /**
     * Create a new message
     * @param requestBody
     * @returns any Message created successfully
     * @throws ApiError
     */
    public static messagesControllerCreate(
        requestBody: CreateMessageDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/messages',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request - validation error`,
            },
        });
    }
    /**
     * Get all messages (admin)
     * @returns any All messages retrieved successfully
     * @throws ApiError
     */
    public static messagesControllerFindAll(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/messages',
        });
    }
    /**
     * Get message by ID
     * @param id Message ID
     * @returns any Message retrieved successfully
     * @throws ApiError
     */
    public static messagesControllerFindById(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/messages/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Message not found`,
            },
        });
    }
    /**
     * Get messages for a specific recipient
     * @param recipientId Recipient user ID
     * @returns any Messages retrieved successfully
     * @throws ApiError
     */
    public static messagesControllerFindByRecipient(
        recipientId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/messages/recipient/{recipientId}',
            path: {
                'recipientId': recipientId,
            },
            errors: {
                404: `Recipient not found`,
            },
        });
    }
}
