'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile } from '@/lib/api';

interface User {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    documento: string;
    profile_id?: string;
    activo: boolean;
}

export function useAuth() {
    const router = useRouter();
    const isMounted = useRef(false);
    
    // Inicializar sincrónicamente desde sessionStorage
    const [user, setUser] = useState<User | null>(() => {
        if (typeof window !== 'undefined') {
            const userStr = sessionStorage.getItem('user');
            if (userStr) {
                try {
                    return JSON.parse(userStr);
                } catch {
                    return null;
                }
            }
        }
        return null;
    });
    
    const [profileName, setProfileName] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return sessionStorage.getItem('profile_name') || '';
        }
        return '';
    });
    
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Prevenir ejecución duplicada en React Strict Mode
        if (isMounted.current) return;
        isMounted.current = true;

        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = sessionStorage.getItem('access_token');
        const userStr = sessionStorage.getItem('user');
        const storedProfileName = sessionStorage.getItem('profile_name');

        if (token && userStr) {
            try {
                const userData = JSON.parse(userStr);
                setUser(userData);

                // Solo hacer fetch del perfil si existe profile_id Y no está cacheado
                if (userData.profile_id && !storedProfileName) {
                    try {
                        const data = await getProfile(userData.profile_id);
                        
                        if (data.success && data.data) {
                            setProfileName(data.data.name);
                            sessionStorage.setItem('profile_name', data.data.name);
                        }
                    } catch (error) {
                        console.error('Error fetching profile:', error);
                    }
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
                logout();
            }
        }
        setLoading(false);
    };

    const logout = () => {
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('profile_name');
        setUser(null);
        setProfileName('');
        router.push('/login');
    };

    return {
        user,
        profileName,
        loading,
        isAuthenticated: !!user,
        logout,
    };
}
