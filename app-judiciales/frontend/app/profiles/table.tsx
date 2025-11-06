'use client'

import { Profile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Shield, Edit } from 'lucide-react'
import { useAuth } from '@/contexts/authContext'

interface ProfilesTableProps {
    profiles: Profile[]
    selectedProfiles: string[]
    onSelectProfile: (id: string) => void
    onToggleSelectAll: () => void
    onEdit: (profile: Profile) => void
    onDelete: (profile: Profile) => void
}

export function ProfilesTable({ 
    profiles, 
    selectedProfiles, 
    onSelectProfile, 
    onToggleSelectAll, 
    onEdit, 
    onDelete 
}: ProfilesTableProps) {
    const { hasPermission, user } = useAuth()
    
    // Permisos para acciones
    const canEdit = hasPermission('profile:update') || user?.isAdmin
    const canDelete = hasPermission('profile:delete') || user?.isAdmin
    return (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left">
                            <input
                                type="checkbox"
                                checked={selectedProfiles.length === profiles.length && profiles.length > 0}
                                onChange={onToggleSelectAll}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nombre
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Slug
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Descripción
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Permisos
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {profiles.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                No hay perfiles registrados
                            </td>
                        </tr>
                    ) : (
                        profiles.map((profile) => (
                            <tr key={profile.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <input
                                        type="checkbox"
                                        checked={selectedProfiles.includes(profile.id)}
                                        onChange={() => onSelectProfile(profile.id)}
                                        disabled={profile.is_system}
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={
                                            profile.is_system
                                                ? 'No se puede seleccionar perfil del sistema'
                                                : ''
                                        }
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="text-sm font-medium text-gray-900">
                                            {profile.name}
                                        </div>
                                        {profile.is_system && (
                                            <div title="Perfil del sistema">
                                                <Shield className="ml-2 h-4 w-4 text-blue-600" />
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                        {profile.slug}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-500 max-w-xs truncate" title={profile.description || ''}>
                                        {profile.description || '-'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                                        {profile.permissions.length} permisos
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {/* Usar el mismo formato que la tabla de usuarios */}
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            (profile.active !== undefined ? profile.active : true)
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        <span
                                            className={`h-2 w-2 rounded-full mr-1.5 ${
                                                (profile.active !== undefined ? profile.active : true) ? 'bg-green-500' : 'bg-red-500'
                                            }`}
                                        />
                                        {(profile.active !== undefined ? profile.active : true) ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end gap-2">
                                        {canEdit && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onEdit(profile)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                                title="Editar perfil"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {canDelete && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onDelete(profile)}
                                                disabled={profile.is_system}
                                                className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                                title={profile.is_system ? 'No se puede eliminar perfil del sistema' : 'Eliminar perfil'}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {!canEdit && !canDelete && (
                                            <span className="text-sm text-gray-400 italic">
                                                Solo lectura
                                            </span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}
