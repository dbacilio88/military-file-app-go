'use client';

import { ComponentType, useEffect } from 'react';
import { useAuth } from '@/contexts/authContext';

interface WithPermissionsOptions {
  permissions?: string[];
  requireAll?: boolean;
  adminOnly?: boolean;
  redirectTo?: string;
}

/**
 * Higher-Order Component para proteger páginas/componentes con permisos
 * 
 * Uso:
 * export default withPermissions(UserListPage, {
 *   permissions: ['user:read'],
 *   adminOnly: false
 * });
 */
export function withPermissions<T extends object>(
  WrappedComponent: ComponentType<T>,
  options: WithPermissionsOptions = {}
) {
  const {
    permissions = [],
    requireAll = false,
    adminOnly = false,
    redirectTo = '/access-denied'
  } = options;

  const ProtectedComponent = (props: T) => {
    const { user, hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = useAuth();

    useEffect(() => {
      // Si no está cargando y no hay usuario, redirigir al login
      if (!isLoading && !user) {
        window.location.href = '/login';
        return;
      }

      // Si hay usuario pero no tiene permisos, redirigir
      if (!isLoading && user) {
        let hasAccess = true;

        if (adminOnly && !user.isAdmin) {
          hasAccess = false;
        }

        if (permissions.length > 0) {
          const permissionCheck = requireAll 
            ? hasAllPermissions(permissions)
            : hasAnyPermission(permissions);
          
          if (!permissionCheck) {
            hasAccess = false;
          }
        }

        if (!hasAccess) {
          window.location.href = redirectTo;
          return;
        }
      }
    }, [user, isLoading, hasAnyPermission, hasAllPermissions]);

    // Mostrar loading
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    // Si no hay usuario, no mostrar nada (se redirigirá)
    if (!user) {
      return null;
    }

    // Verificar permisos
    let hasAccess = true;

    if (adminOnly && !user.isAdmin) {
      hasAccess = false;
    }

    if (permissions.length > 0) {
      const permissionCheck = requireAll 
        ? hasAllPermissions(permissions)
        : hasAnyPermission(permissions);
      
      if (!permissionCheck) {
        hasAccess = false;
      }
    }

    // Si no tiene acceso, no mostrar nada (se redirigirá)
    if (!hasAccess) {
      return null;
    }

    // Renderizar el componente protegido
    return <WrappedComponent {...props} />;
  };

  ProtectedComponent.displayName = `withPermissions(${WrappedComponent.displayName || WrappedComponent.name})`;

  return ProtectedComponent;
}

/**
 * HOC específico para páginas de administrador
 */
export function withAdminOnly<T extends object>(WrappedComponent: ComponentType<T>) {
  return withPermissions(WrappedComponent, { adminOnly: true });
}

/**
 * HOC específico para gestión de usuarios
 */
export function withUserManagement<T extends object>(WrappedComponent: ComponentType<T>) {
  return withPermissions(WrappedComponent, {
    permissions: ['user:read', 'user:create', 'user:update', 'user:delete'],
    requireAll: false
  });
}

/**
 * HOC específico para gestión de expedientes
 */
export function withExpedienteManagement<T extends object>(WrappedComponent: ComponentType<T>) {
  return withPermissions(WrappedComponent, {
    permissions: ['expediente:read']
  });
}