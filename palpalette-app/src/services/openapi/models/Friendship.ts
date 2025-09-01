/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from './User';
export type Friendship = {
    id: string;
    requesterId: string;
    addresseeId: string;
    status: Friendship.status;
    requester: User;
    addressee: User;
    createdAt: string;
    updatedAt: string;
};
export namespace Friendship {
    export enum status {
        PENDING = 'pending',
        ACCEPTED = 'accepted',
        BLOCKED = 'blocked',
    }
}

