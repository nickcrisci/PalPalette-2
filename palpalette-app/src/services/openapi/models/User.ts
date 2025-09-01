/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Device } from './Device';
import type { Message } from './Message';
export type User = {
    id: string;
    email: string;
    passwordHash: string;
    displayName: string;
    createdAt: string;
    updatedAt: string;
    devices: Array<Device>;
    sentMessages: Array<Message>;
    receivedMessages: Array<Message>;
};

