'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  documento: string;
  telefono: string;
  profile_id?: string;
  roles: string[];
  activo: boolean;
}

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profileName, setProfileName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        
        // Fetch profile name if profile_id exists
        if (userData.profile_id) {
          try {
            const response = await fetch(`http://localhost:8080/api/v1/profiles/${userData.profile_id}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data) {
                setProfileName(data.data.name);
                localStorage.setItem('profile_name', data.data.name);
              }
            }
          } catch (error) {
            console.error('Error fetching profile:', error);
            // Fallback to stored profile name
            const storedProfileName = localStorage.getItem('profile_name');
            if (storedProfileName) {
              setProfileName(storedProfileName);
            }
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
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('profile_name');
    setUser(null);
    setProfileName('');
    router.push('/login');
  };

  const hasRole = (role: string) => {
    return user?.roles?.includes(role) || false;
  };

  const hasAnyRole = (roles: string[]) => {
    return roles.some(role => user?.roles?.includes(role)) || false;
  };

  return {
    user,
    profileName,
    loading,
    isAuthenticated: !!user,
    logout,
    hasRole,
    hasAnyRole,
  };
}
