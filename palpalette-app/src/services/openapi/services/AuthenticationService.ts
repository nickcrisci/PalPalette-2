/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LoginRequestDto } from '../models/LoginRequestDto';
import type { RegisterUserDto } from '../models/RegisterUserDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthenticationService {
    /**
     * Register a new user
     * @param requestBody
     * @returns any User successfully registered
     * @throws ApiError
     */
    public static authControllerRegister(
        requestBody: RegisterUserDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request - validation error`,
                409: `User already exists`,
            },
        });
    }
    /**
     * Login user and get access tokens
     * @param requestBody
     * @returns any Login successful
     * @throws ApiError
     */
    public static authControllerLogin(
        requestBody: LoginRequestDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Invalid credentials`,
            },
        });
    }
    /**
     * Refresh access tokens using refresh token
     * @param requestBody
     * @returns any Tokens refreshed successfully
     * @throws ApiError
     */
    public static authControllerRefresh(
        requestBody: {
            refresh_token: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/refresh',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Invalid refresh token`,
            },
        });
    }
    /**
     * Logout user and invalidate tokens
     * @returns any Logout successful
     * @throws ApiError
     */
    public static authControllerLogout(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/logout',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Validate an access token
     * @param requestBody
     * @returns any Token is valid
     * @throws ApiError
     */
    public static authControllerValidate(
        requestBody: {
            token: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/validate',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Token is invalid`,
            },
        });
    }
}
