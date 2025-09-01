/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Device } from './Device';
import type { User } from './User';
export type Message = {
    id: string;
    sender: User;
    recipient: User;
    device: Device;
    colors: Array<Record<string, any>>;
    imageUrl: string;
    sentAt: string;
    deliveredAt: string;
    status: Message.status;
};
export namespace Message {
    export enum status {
        SENT = 'sent',
        DELIVERED = 'delivered',
        FAILED = 'failed',
    }
}

