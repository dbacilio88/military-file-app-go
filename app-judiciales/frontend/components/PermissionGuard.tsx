'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/contexts/authContext';

interface ProtectedComponentProps {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean; // Si es true, necesita TODOS los permisos. Si es false, necesita AL MENOS UNO
  fallback?: ReactNode;
  adminOnly?: boolean;
}

/**
 * Componente para proteger elementos de la UI basado en permisos
 * 
 * Uso:
 * <ProtectedComponent permission="user:create">
 *   <CreateUserButton />
 * </ProtectedComponent>
 * 
 * <ProtectedComponent permissions={["user:read", "user:update"]} requireAll={false}>
 *   <UserActions />
 * </ProtectedComponent>
 */
export function ProtectedComponent({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  adminOnly = false
}: ProtectedComponentProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, user } = useAuth();

  // Si no hay usuario autenticado, no mostrar nada
  if (!user) {
    return <>{fallback}</>;
  }

  // Verificar si es solo para administradores
  if (adminOnly && !user.isAdmin) {
    return <>{fallback}</>;
  }

  // Si se especifica un permiso individual
  if (permission) {
    if (!hasPermission(permission)) {
      return <>{fallback}</>;
    }
  }

  // Si se especifican múltiples permisos
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
    
    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

interface ProtectedRouteProps {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  adminOnly?: boolean;
  redirectTo?: string;
}

/**
 * Componente para proteger rutas completas
 * Redirige a la página de acceso denegado si no tiene permisos
 */
export function ProtectedRoute({
  children,
  permission,
  permissions,
  requireAll = false,
  adminOnly = false,
  redirectTo = '/access-denied'
}: ProtectedRouteProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, user, isLoading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si no hay usuario autenticado, redirigir al login
  if (!user) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }

  // Verificar permisos
  let hasAccess = true;

  if (adminOnly && !user.isAdmin) {
    hasAccess = false;
  }

  if (permission && !hasPermission(permission)) {
    hasAccess = false;
  }

  if (permissions && permissions.length > 0) {
    const permissionCheck = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
    
    if (!permissionCheck) {
      hasAccess = false;
    }
  }

  // Si no tiene acceso, mostrar página de acceso denegado
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Acceso Denegado</h3>
          <p className="mt-2 text-sm text-gray-500">
            No tienes permisos para acceder a esta página.
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Usuario: {user.email} | Perfil: {user.profile?.name || 'Sin perfil'}
          </p>
          <div className="mt-6">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Regresar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Hook personalizado para verificar permisos en componentes
 */
export function usePermissionCheck() {
  const { hasPermission, hasAnyPermission, hasAllPermissions, user } = useAuth();

  return {
    canAccess: (permission: string) => hasPermission(permission),
    canAccessAny: (permissions: string[]) => hasAnyPermission(permissions),
    canAccessAll: (permissions: string[]) => hasAllPermissions(permissions),
    isAdmin: user?.isAdmin || false,
    userPermissions: user?.permissions || [],
    userProfile: user?.profile?.name || 'Sin perfil'
  };
}