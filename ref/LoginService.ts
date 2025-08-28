import { AuthenticationService, OpenAPI } from '../openapi';
import { Device } from '@capacitor/device';
import { preferences } from '../../preferences';

/**
 * Login with email and password and return the API-Token.
 * The API-Token is automatically set for subsequent API requests.
 * @param email Email address
 * @param password Password
 * @param deviceName Device name (optional)
 */
export async function login(
    email: string,
    password: string,
    deviceName?: string,
): Promise<string> {
    const token = await AuthenticationService.requestAccessToken({
        email,
        password,
        device_name: deviceName ?? (await resolveDeviceName()),
    });

    await preferences.authToken.set(token);

    return token;
}

/**
 * Resolve the device name. If the device name cannot be resolved, a fallback is used.
 */
async function resolveDeviceName(
    fallback = 'Magic-Painting - Mobile App',
): Promise<string> {
    try {
        return (await Device.getInfo()).name ?? fallback;
    } catch (e) {
        return fallback;
    }
}
