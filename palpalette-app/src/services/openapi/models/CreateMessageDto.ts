/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateMessageDto = {
    /**
     * ID of the user sending the message
     */
    senderId: string;
    /**
     * ID of the user receiving the message
     */
    recipientId: string;
    /**
     * ID of the device to display the colors
     */
    deviceId: string;
    /**
     * Array of color codes (hex format) to display
     */
    colors: Array<string>;
    /**
     * Optional text content for the message
     */
    content?: string;
};

