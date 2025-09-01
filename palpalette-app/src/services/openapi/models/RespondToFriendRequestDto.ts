/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type RespondToFriendRequestDto = {
    /**
     * ID of the friendship request
     */
    friendshipId: string;
    /**
     * Action to take on the friend request
     */
    action: RespondToFriendRequestDto.action;
};
export namespace RespondToFriendRequestDto {
    /**
     * Action to take on the friend request
     */
    export enum action {
        ACCEPT = 'accept',
        DECLINE = 'decline',
    }
}

