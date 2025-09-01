/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateColorPaletteDto } from '../models/CreateColorPaletteDto';
import type { Friendship } from '../models/Friendship';
import type { Message } from '../models/Message';
import type { RegisterUserDto } from '../models/RegisterUserDto';
import type { RespondToFriendRequestDto } from '../models/RespondToFriendRequestDto';
import type { SendFriendRequestDto } from '../models/SendFriendRequestDto';
import type { SendPaletteToFriendsDto } from '../models/SendPaletteToFriendsDto';
import type { UpdateColorPaletteDto } from '../models/UpdateColorPaletteDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UsersService {
    /**
     * Register a new user (deprecated - use /auth/register)
     * @param requestBody
     * @returns any User successfully registered
     * @throws ApiError
     */
    public static usersControllerRegister(
        requestBody: RegisterUserDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request - validation error`,
                409: `User already exists`,
            },
        });
    }
    /**
     * Send a friend request
     * @param requestBody
     * @returns any Friend request sent successfully
     * @throws ApiError
     */
    public static usersControllerSendFriendRequest(
        requestBody: SendFriendRequestDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/friends/request',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request - validation error`,
                401: `Unauthorized`,
                404: `Target user not found`,
            },
        });
    }
    /**
     * Respond to a friend request
     * @param requestBody
     * @returns any Response recorded successfully
     * @returns Friendship
     * @throws ApiError
     */
    public static usersControllerRespondToFriendRequest(
        requestBody: RespondToFriendRequestDto,
    ): CancelablePromise<any | Friendship> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/friends/respond',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request - validation error`,
                401: `Unauthorized`,
                404: `Friend request not found`,
            },
        });
    }
    /**
     * Get list of friends
     * @returns any List of friends retrieved successfully
     * @throws ApiError
     */
    public static usersControllerGetFriends(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/friends',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Get pending friend requests received
     * @returns any Pending requests retrieved successfully
     * @throws ApiError
     */
    public static usersControllerGetPendingRequests(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/friends/pending',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Get friend requests sent by user
     * @returns any Sent requests retrieved successfully
     * @throws ApiError
     */
    public static usersControllerGetSentRequests(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/friends/sent',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Create a new color palette
     * @param requestBody
     * @returns any Color palette created successfully
     * @throws ApiError
     */
    public static usersControllerCreatePalette(
        requestBody: CreateColorPaletteDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/palettes',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request - validation error`,
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Get user's color palettes
     * @returns any User palettes retrieved successfully
     * @throws ApiError
     */
    public static usersControllerGetUserPalettes(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/palettes',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Send a color palette to friends
     * @param requestBody
     * @returns any Palette sent to friends successfully
     * @returns Message
     * @throws ApiError
     */
    public static usersControllerSendPaletteToFriends(
        requestBody: SendPaletteToFriendsDto,
    ): CancelablePromise<any | Array<Message>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/palettes/send',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request - validation error`,
                401: `Unauthorized`,
                404: `Palette not found`,
            },
        });
    }
    /**
     * Get a specific color palette by ID
     * @param id Color palette ID
     * @returns any Color palette retrieved successfully
     * @throws ApiError
     */
    public static usersControllerGetPalette(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/palettes/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                404: `Palette not found`,
            },
        });
    }
    /**
     * Update a color palette
     * @param id Color palette ID
     * @param requestBody
     * @returns any Color palette updated successfully
     * @throws ApiError
     */
    public static usersControllerUpdatePalette(
        id: string,
        requestBody: UpdateColorPaletteDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/users/palettes/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request - validation error`,
                401: `Unauthorized`,
                403: `Forbidden - not palette owner`,
                404: `Palette not found`,
            },
        });
    }
    /**
     * Delete a color palette
     * @param id Color palette ID
     * @returns any Color palette deleted successfully
     * @throws ApiError
     */
    public static usersControllerDeletePalette(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/users/palettes/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - not palette owner`,
                404: `Palette not found`,
            },
        });
    }
    /**
     * Get received messages for user
     * @returns any Messages retrieved successfully
     * @throws ApiError
     */
    public static usersControllerGetReceivedMessages(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/messages',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Get undelivered messages for user
     * @returns any Undelivered messages retrieved successfully
     * @throws ApiError
     */
    public static usersControllerGetUndeliveredMessages(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/messages/undelivered',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Replay a message on a specific device
     * @param messageId Message ID to replay
     * @returns any Message replayed successfully
     * @throws ApiError
     */
    public static usersControllerReplayMessage(
        messageId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/messages/{messageId}/replay',
            path: {
                'messageId': messageId,
            },
            errors: {
                400: `Bad request - validation error`,
                401: `Unauthorized`,
                404: `Message or device not found`,
            },
        });
    }
    /**
     * Get user by ID (public)
     * @param id User ID
     * @returns any User retrieved successfully
     * @throws ApiError
     */
    public static usersControllerGetUser(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `User not found`,
            },
        });
    }
    /**
     * Update user profile
     * @param id User ID
     * @returns any Profile updated successfully
     * @throws ApiError
     */
    public static usersControllerUpdateProfile(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/users/{id}',
            path: {
                'id': id,
            },
            errors: {
                400: `Bad request - validation error`,
                401: `Unauthorized`,
                403: `Forbidden - not profile owner`,
                404: `User not found`,
            },
        });
    }
    /**
     * Delete user account
     * @param id User ID
     * @returns any User deleted successfully
     * @throws ApiError
     */
    public static usersControllerRemove(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/users/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - not account owner`,
                404: `User not found`,
            },
        });
    }
}
