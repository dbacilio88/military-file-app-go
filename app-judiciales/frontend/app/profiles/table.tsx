'use client'

import { Profile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Shield, CheckCircle2, XCircle } from 'lucide-react'

interface ProfilesTableProps {
    profiles: Profile[]
    onEdit: (profile: Profile) => void
    onDelete: (profile: Profile) => void
}

export function ProfilesTable({ profiles, onEdit, onDelete }: ProfilesTableProps) {
    return (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
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
                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                No hay perfiles registrados
                            </td>
                        </tr>
                    ) : (
                        profiles.map((profile) => (
                            <tr key={profile.id} className="hover:bg-gray-50">
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
                                    {/* Si no existe la propiedad active, asumimos que es activo para perfiles del sistema */}
                                    {(profile.active !== undefined ? profile.active : profile.is_system) ? (
                                        <div className="flex items-center text-green-600">
                                            <CheckCircle2 className="h-4 w-4 mr-1" />
                                            <span className="text-sm font-medium">Activo</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-gray-400">
                                            <XCircle className="h-4 w-4 mr-1" />
                                            <span className="text-sm font-medium">Inactivo</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onEdit(profile)}
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onDelete(profile)}
                                            className="text-red-600 hover:text-red-900"
                                            disabled={profile.is_system}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
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
