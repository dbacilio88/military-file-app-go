'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, AuthenticatedUser, LoginCredentials, LoginResponse } from '@/lib/types';
import { loginUser } from '@/lib/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const loadStoredUser = () => {
      console.log('🚀 Iniciando carga de usuario...');
      try {
        const storedUser = localStorage.getItem('auth_user');
        const storedToken = localStorage.getItem('auth_token');
        
        console.log('📦 Datos en localStorage:', {
          hasStoredUser: !!storedUser,
          hasStoredToken: !!storedToken,
          storedUserLength: storedUser?.length || 0
        });
        
        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser);
          console.log('✅ Usuario encontrado en localStorage:', userData.email);
          setUser({
            ...userData,
            token: storedToken
          });
        }
        // No crear usuario automático - requerir login real
      } catch (error) {
        console.error('❌ Error loading stored user:', error);
        // Limpiar datos corruptos
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
        console.log('🏁 Proceso de carga completado, isLoading = false');
      }
    };

    console.log('🔄 Ejecutando loadStoredUser...');
    loadStoredUser();
  }, []);

  // Función de login
  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      console.log('🔑 Intentando login con backend real:', credentials.email);
      
      // Intentar login real con backend
      const response = await loginUser(credentials);
      
      console.log('📦 Respuesta completa del backend:', {
        user: response.user,
        permissions: response.permissions,
        profile: response.profile,
        token: response.token ? '[TOKEN_PRESENTE]' : '[NO_TOKEN]',
        // Detalles específicos
        permissionsType: typeof response.permissions,
        permissionsLength: response.permissions?.length,
        isArray: Array.isArray(response.permissions),
        userStructure: Object.keys(response.user || {}),
        responseKeys: Object.keys(response),
        // Detalle completo de permisos
        permissionsContent: response.permissions
      });

      // Si no hay permisos en la respuesta, obtenerlos del perfil
      let userPermissions = response.permissions || [];
      
      if (userPermissions.length === 0 && response.user?.profile_id) {
        console.log('🔍 No hay permisos en login, obteniendo del perfil:', response.user.profile_id);
        console.log('🔍 User completo:', response.user);
        console.log('🔍 Profile ID detectado:', response.user.profile_id);
        
        const profileUrl = `http://localhost:8082/api/v1/profiles/${response.user.profile_id}`;
        console.log('🔍 URL del perfil:', profileUrl);
        
        try {
          // Obtener permisos del perfil
          const profileResponse = await fetch(profileUrl, {
            headers: {
              'Authorization': `Bearer ${response.token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('🔍 Response status del perfil:', profileResponse.status);
          
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            console.log('📋 Datos del perfil obtenidos:', profileData);
            
            userPermissions = profileData.data?.permissions || [];
            console.log('✅ Permisos obtenidos del perfil:', userPermissions);
          } else {
            const errorText = await profileResponse.text();
            console.warn('⚠️ No se pudieron obtener permisos del perfil. Status:', profileResponse.status);
            console.warn('⚠️ Error response:', errorText);
          }
        } catch (profileError) {
          console.error('❌ Error obteniendo permisos del perfil:', profileError);
        }
      }

      const authenticatedUser: AuthenticatedUser = {
        ...response.user,
        permissions: userPermissions,
        token: response.token,
        isAdmin: userPermissions.includes('system:admin') || false,
        profile: response.profile
      };

      console.log('👤 Usuario procesado - FINAL:', {
        email: authenticatedUser.email,
        permissions: authenticatedUser.permissions,
        isAdmin: authenticatedUser.isAdmin,
        profile: authenticatedUser.profile,
        permissionsCount: authenticatedUser.permissions.length,
        permissionsDetailed: authenticatedUser.permissions
      });

      // Si no hay permisos desde el backend, mantener array vacío 
      // El usuario solo tendrá los permisos que realmente le fueron asignados
      if (authenticatedUser.permissions.length === 0) {
        console.log('⚠️ Usuario sin permisos desde backend - respetando restricciones');
      }

      // Guardar en localStorage
      localStorage.setItem('auth_user', JSON.stringify({
        ...authenticatedUser,
        token: undefined // No guardar token en el objeto usuario
      }));
      localStorage.setItem('auth_token', response.token);

      // También guardar en cookies para el middleware
      document.cookie = `auth_token=${response.token}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 días

      setUser(authenticatedUser);
      console.log('🎉 Usuario autenticado:', authenticatedUser.email);
    } catch (error) {
      console.error('❌ Login error:', error);
      throw new Error('Credenciales inválidas o error del servidor');
    } finally {
      setIsLoading(false);
    }
  };

  // Función de logout
  const logout = () => {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    // También limpiar las cookies
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setUser(null);
  };

  // Verificar si el usuario tiene un permiso específico
  const hasPermission = (permission: string): boolean => {
    if (!user) {
      console.log(`🔍 hasPermission(${permission}): No hay usuario`);
      return false;
    }
    
    // Los administradores tienen todos los permisos
    if (user.isAdmin) {
      console.log(`🔍 hasPermission(${permission}): Usuario es admin = true`);
      return true;
    }
    
    // Verificar permiso específico
    const hasIt = user.permissions.includes(permission);
    console.log(`🔍 hasPermission(${permission}): ${hasIt}`, {
      userPermissions: user.permissions,
      isAdmin: user.isAdmin
    });
    return hasIt;
  };

  // Verificar si el usuario tiene al menos uno de los permisos
  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user) return false;
    
    // Los administradores tienen todos los permisos
    if (user.isAdmin) return true;
    
    // Verificar si tiene al menos uno de los permisos
    return permissions.some(permission => user.permissions.includes(permission));
  };

  // Verificar si el usuario tiene todos los permisos
  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user) return false;
    
    // Los administradores tienen todos los permisos
    if (user.isAdmin) return true;
    
    // Verificar si tiene todos los permisos
    return permissions.every(permission => user.permissions.includes(permission));
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isLoading
  };

  console.log('🔍 Estado actual del contexto:', {
    hasUser: !!user,
    userEmail: user?.email,
    isAdmin: user?.isAdmin,
    isLoading,
    permissionsCount: user?.permissions?.length || 0
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el contexto de autenticación
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook para verificar permisos específicos
export function usePermissions() {
  const { hasPermission, hasAnyPermission, hasAllPermissions, user } = useAuth();
  
  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin: user?.isAdmin || false,
    permissions: user?.permissions || []
  };
}