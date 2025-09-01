/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type LoginRequestDto = {
    /**
     * User email address
     */
    email: string;
    /**
     * User password (minimum 6 characters)
     */
    password: string;
    /**
     * Optional device name for tracking user sessions
     */
    device_name?: string;
};

