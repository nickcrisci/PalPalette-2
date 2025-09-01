/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SendPaletteToFriendsDto = {
    /**
     * ID of existing palette to send
     */
    paletteId?: string;
    /**
     * Array of friend user IDs to send palette to
     */
    friendIds: Array<string>;
    /**
     * Direct colors to send (if not using existing palette)
     */
    colors?: Array<string>;
    /**
     * Optional image URL for the palette message
     */
    imageUrl?: string;
};

