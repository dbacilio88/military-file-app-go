'use client';

import React from 'react';
import { Permission, PERMISSIONS_BY_CATEGORY } from '@/lib/types';

interface PermissionsSelectorProps {
  selectedPermissions: string[];
  onPermissionsChange: (permissions: string[]) => void;
  disabled?: boolean;
}

export default function PermissionsSelector({
  selectedPermissions,
  onPermissionsChange,
  disabled = false,
}: PermissionsSelectorProps) {
  // Definir colores por categoría
  const categoryColors = {
    users: {
      border: 'border-blue-200',
      bg: 'bg-blue-50',
      checkbox: 'text-blue-600 focus:ring-blue-500',
      header: 'text-blue-900',
      tag: 'bg-blue-100 text-blue-800'
    },
    profiles: {
      border: 'border-green-200',
      bg: 'bg-green-50',
      checkbox: 'text-green-600 focus:ring-green-500',
      header: 'text-green-900',
      tag: 'bg-green-100 text-green-800'
    },
    expedientes: {
      border: 'border-purple-200',
      bg: 'bg-purple-50',
      checkbox: 'text-purple-600 focus:ring-purple-500',
      header: 'text-purple-900',
      tag: 'bg-purple-100 text-purple-800'
    },
    system: {
      border: 'border-orange-200',
      bg: 'bg-orange-50',
      checkbox: 'text-orange-600 focus:ring-orange-500',
      header: 'text-orange-900',
      tag: 'bg-orange-100 text-orange-800'
    }
  };

  const handlePermissionToggle = (permissionName: string) => {
    if (disabled) return;
    
    const isSelected = selectedPermissions.includes(permissionName);
    
    if (isSelected) {
      // Remover permiso
      onPermissionsChange(selectedPermissions.filter(p => p !== permissionName));
    } else {
      // Agregar permiso
      onPermissionsChange([...selectedPermissions, permissionName]);
    }
  };

  const handleCategoryToggle = (categoryPermissions: Permission[]) => {
    if (disabled) return;
    
    const categoryPermissionNames = categoryPermissions.map(p => p.name);
    const allCategorySelected = categoryPermissionNames.every(name => 
      selectedPermissions.includes(name)
    );
    
    if (allCategorySelected) {
      // Remover todos los permisos de la categoría
      onPermissionsChange(
        selectedPermissions.filter(p => !categoryPermissionNames.includes(p))
      );
    } else {
      // Agregar todos los permisos de la categoría
      const newPermissions = [...selectedPermissions];
      categoryPermissionNames.forEach(name => {
        if (!newPermissions.includes(name)) {
          newPermissions.push(name);
        }
      });
      onPermissionsChange(newPermissions);
    }
  };

  const isCategorySelected = (categoryPermissions: Permission[]) => {
    const categoryPermissionNames = categoryPermissions.map(p => p.name);
    return categoryPermissionNames.every(name => selectedPermissions.includes(name));
  };

  const isCategoryPartiallySelected = (categoryPermissions: Permission[]) => {
    const categoryPermissionNames = categoryPermissions.map(p => p.name);
    const selectedCount = categoryPermissionNames.filter(name => 
      selectedPermissions.includes(name)
    ).length;
    return selectedCount > 0 && selectedCount < categoryPermissionNames.length;
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {Object.entries(PERMISSIONS_BY_CATEGORY).map(([category, permissions]) => {
          const colors = categoryColors[category as keyof typeof categoryColors];
          return (
            <div key={category} className={`border rounded-lg p-4 ${colors.border} ${colors.bg}`}>
              <div className="flex items-center space-x-2 mb-3">
                <input
                  type="checkbox"
                  id={`category-${category}`}
                  checked={isCategorySelected(permissions)}
                  ref={(el) => {
                    if (el) {
                      el.indeterminate = isCategoryPartiallySelected(permissions);
                    }
                  }}
                  onChange={() => handleCategoryToggle(permissions)}
                  disabled={disabled}
                  className={`rounded border-gray-300 ${colors.checkbox}`}
                />
                <label
                  htmlFor={`category-${category}`}
                  className={`text-sm font-medium capitalize cursor-pointer ${colors.header}`}
                >
                  {category === 'expedientes' ? 'Expedientes' : 
                   category === 'users' ? 'Usuarios' :
                   category === 'profiles' ? 'Perfiles' :
                   category === 'system' ? 'Sistema' : category}
                </label>
              </div>
              
              <div className="space-y-2 ml-6">
                {permissions.map((permission) => (
                  <div key={permission.name} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={permission.name}
                      checked={selectedPermissions.includes(permission.name)}
                      onChange={() => handlePermissionToggle(permission.name)}
                      disabled={disabled}
                      className={`rounded border-gray-300 ${colors.checkbox}`}
                    />
                    <label
                      htmlFor={permission.name}
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      {permission.description}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      {selectedPermissions.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Permisos seleccionados ({selectedPermissions.length}):
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedPermissions.map((permission) => {
              // Encontrar la categoría del permiso para usar su color
              const permissionCategory = Object.entries(PERMISSIONS_BY_CATEGORY).find(
                ([, perms]) => perms.some(p => p.name === permission)
              )?.[0] as keyof typeof categoryColors;
              
              const colors = permissionCategory ? categoryColors[permissionCategory] : categoryColors.users;
              
              return (
                <span
                  key={permission}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.tag}`}
                >
                  {permission}
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => handlePermissionToggle(permission)}
                      className="ml-1 inline-flex items-center justify-center w-4 h-4 text-current opacity-60 hover:opacity-100"
                    >
                      ×
                    </button>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}