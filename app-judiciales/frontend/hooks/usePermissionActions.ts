'use client';

import { useAuth } from '@/contexts/authContext';
import { useCallback } from 'react';

/**
 * Hook para ejecutar acciones solo si el usuario tiene permisos
 */
export function usePermissionAction() {
  const { hasPermission, hasAnyPermission, hasAllPermissions, user } = useAuth();

  /**
   * Ejecuta una acción solo si el usuario tiene el permiso especificado
   */
  const executeWithPermission = useCallback((
    permission: string,
    action: () => void | Promise<void>,
    onDenied?: () => void
  ) => {
    if (hasPermission(permission)) {
      return action();
    } else {
      console.warn(`Permission denied: ${permission} for user ${user?.email}`);
      if (onDenied) {
        onDenied();
      }
    }
  }, [hasPermission, user?.email]);

  /**
   * Ejecuta una acción solo si el usuario tiene al menos uno de los permisos
   */
  const executeWithAnyPermission = useCallback((
    permissions: string[],
    action: () => void | Promise<void>,
    onDenied?: () => void
  ) => {
    if (hasAnyPermission(permissions)) {
      return action();
    } else {
      console.warn(`Permission denied: ${permissions.join(' OR ')} for user ${user?.email}`);
      if (onDenied) {
        onDenied();
      }
    }
  }, [hasAnyPermission, user?.email]);

  /**
   * Ejecuta una acción solo si el usuario tiene todos los permisos
   */
  const executeWithAllPermissions = useCallback((
    permissions: string[],
    action: () => void | Promise<void>,
    onDenied?: () => void
  ) => {
    if (hasAllPermissions(permissions)) {
      return action();
    } else {
      console.warn(`Permission denied: ${permissions.join(' AND ')} for user ${user?.email}`);
      if (onDenied) {
        onDenied();
      }
    }
  }, [hasAllPermissions, user?.email]);

  /**
   * Ejecuta una acción solo si el usuario es administrador
   */
  const executeAsAdmin = useCallback((
    action: () => void | Promise<void>,
    onDenied?: () => void
  ) => {
    if (user?.isAdmin) {
      return action();
    } else {
      console.warn(`Admin permission denied for user ${user?.email}`);
      if (onDenied) {
        onDenied();
      }
    }
  }, [user?.isAdmin, user?.email]);

  return {
    executeWithPermission,
    executeWithAnyPermission,
    executeWithAllPermissions,
    executeAsAdmin,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin: user?.isAdmin || false
  };
}

/**
 * Hook específico para acciones de usuarios
 */
export function useUserActions() {
  const { executeWithPermission, executeAsAdmin } = usePermissionAction();

  const createUser = useCallback((action: () => void | Promise<void>) => {
    return executeWithPermission('user:create', action);
  }, [executeWithPermission]);

  const updateUser = useCallback((action: () => void | Promise<void>) => {
    return executeWithPermission('user:update', action);
  }, [executeWithPermission]);

  const deleteUser = useCallback((action: () => void | Promise<void>) => {
    return executeWithPermission('user:delete', action);
  }, [executeWithPermission]);

  const viewUsers = useCallback((action: () => void | Promise<void>) => {
    return executeWithPermission('user:read', action);
  }, [executeWithPermission]);

  return {
    createUser,
    updateUser,
    deleteUser,
    viewUsers,
    executeAsAdmin
  };
}

/**
 * Hook específico para acciones de expedientes
 */
export function useExpedienteActions() {
  const { executeWithPermission } = usePermissionAction();

  const createExpediente = useCallback((action: () => void | Promise<void>) => {
    return executeWithPermission('expediente:create', action);
  }, [executeWithPermission]);

  const updateExpediente = useCallback((action: () => void | Promise<void>) => {
    return executeWithPermission('expediente:update', action);
  }, [executeWithPermission]);

  const deleteExpediente = useCallback((action: () => void | Promise<void>) => {
    return executeWithPermission('expediente:delete', action);
  }, [executeWithPermission]);

  const viewExpedientes = useCallback((action: () => void | Promise<void>) => {
    return executeWithPermission('expediente:read', action);
  }, [executeWithPermission]);

  return {
    createExpediente,
    updateExpediente,
    deleteExpediente,
    viewExpedientes
  };
}

/**
 * Hook específico para acciones de perfiles
 */
export function useProfileActions() {
  const { executeWithPermission, executeAsAdmin } = usePermissionAction();

  const createProfile = useCallback((action: () => void | Promise<void>) => {
    return executeWithPermission('profile:create', action);
  }, [executeWithPermission]);

  const updateProfile = useCallback((action: () => void | Promise<void>) => {
    return executeWithPermission('profile:update', action);
  }, [executeWithPermission]);

  const deleteProfile = useCallback((action: () => void | Promise<void>) => {
    return executeWithPermission('profile:delete', action);
  }, [executeWithPermission]);

  const viewProfiles = useCallback((action: () => void | Promise<void>) => {
    return executeWithPermission('profile:read', action);
  }, [executeWithPermission]);

  return {
    createProfile,
    updateProfile,
    deleteProfile,
    viewProfiles,
    executeAsAdmin
  };
}