'use client'

import { User, Profile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Shield, Users as UsersIcon } from 'lucide-react'

interface UsersTableProps {
    users: User[]
    profiles: Profile[]
    currentUserId: string | null
    selectedUsers: string[]
    onSelectUser: (id: string) => void
    onToggleSelectAll: () => void
    onEdit: (user: User) => void
    onDelete: (user: User) => void
    searchQuery?: string
}

export function UsersTable({
    users,
    profiles,
    currentUserId,
    selectedUsers,
    onSelectUser,
    onToggleSelectAll,
    onEdit,
    onDelete,
    searchQuery = ''
}: UsersTableProps) {
    if (users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 border border-gray-200 rounded-lg bg-white">
                <UsersIcon className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 text-center">No se encontraron usuarios</p>
                <p className="text-gray-500 text-sm text-center mt-1">
                    {searchQuery
                        ? 'Intenta con un término de búsqueda diferente'
                        : 'Crea tu primer usuario haciendo clic en "Nuevo Usuario"'}
                </p>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left">
                            <input
                                type="checkbox"
                                checked={selectedUsers.length === users.length && users.length > 0}
                                onChange={onToggleSelectAll}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Usuario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Documento
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Perfil
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
                    {users.map((user) => {
                        const isCurrentUser = user.id === currentUserId
                        return (
                            <tr
                                key={user.id}
                                className={`hover:bg-gray-50 ${isCurrentUser ? 'bg-blue-50' : ''}`}
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.includes(user.id)}
                                        onChange={() => onSelectUser(user.id)}
                                        disabled={isCurrentUser}
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={
                                            isCurrentUser
                                                ? 'No puedes seleccionar tu propio usuario'
                                                : ''
                                        }
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                                <span className="text-white font-semibold text-sm">
                                                    {user.nombre.charAt(0)}
                                                    {user.apellido.charAt(0)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {user.nombre} {user.apellido}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{user.documento}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                        <Shield className="h-4 w-4 mr-1" />
                                        {profiles.find((p) => p.id === user.profile_id)?.name || 'N/A'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            user.activo
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        <span
                                            className={`h-2 w-2 rounded-full mr-1.5 ${
                                                user.activo ? 'bg-green-500' : 'bg-red-500'
                                            }`}
                                        />
                                        {user.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onEdit(user)}
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onDelete(user)}
                                            disabled={isCurrentUser}
                                            className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                            title={
                                                isCurrentUser
                                                    ? 'No puedes eliminar tu propio usuario'
                                                    : ''
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
