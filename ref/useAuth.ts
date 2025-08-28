import { useContext } from 'react';
import { authContext } from '../context/authContext';

export function useAuth() {
    return useContext(authContext)!;
}
