import { User } from '../models/User';
import { createContext } from 'react';

export interface AuthContextType {
    token?: string;
    user?: User;
    loading: boolean;

    login(email: string, password: string): Promise<void>;

    logout(): Promise<void>;

    refreshUser(): Promise<void>;
}

export const authContext = createContext<AuthContextType | undefined>(
    undefined,
);
