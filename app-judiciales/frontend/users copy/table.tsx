'use client'

import { User, Profile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <UsersIcon className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 text-center">No se encontraron usuarios</p>
                    <p className="text-gray-500 text-sm text-center mt-1">
                        {searchQuery
                            ? 'Intenta con un término de búsqueda diferente'
                            : 'Crea tu primer usuario haciendo clic en "Nuevo Usuario"'}
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="overflow-x-auto">
            <Card>
                <CardHeader className="py-2">
                    <CardTitle className="text-base">Lista de Usuarios</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-3 py-2 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.length === users.length && users.length > 0}
                                            onChange={onToggleSelectAll}
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0"
                                        />
                                    </th>
                                    <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">
                                        Usuario
                                    </th>
                                    <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">
                                        Email
                                    </th>
                                    <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">
                                        Documento
                                    </th>
                                    <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">
                                        Perfil
                                    </th>
                                    <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">
                                        Estado
                                    </th>
                                    <th className="px-3 py-1.5 text-right text-xs font-medium text-gray-500 uppercase">
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
                                            className={`hover:bg-gray-50 transition-colors ${isCurrentUser ? 'bg-blue-50' : ''
                                                }`}
                                        >
                                            <td className="px-3 py-2 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUsers.includes(user.id)}
                                                    onChange={() => onSelectUser(user.id)}
                                                    disabled={isCurrentUser}
                                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title={
                                                        isCurrentUser
                                                            ? 'No puedes seleccionar tu propio usuario'
                                                            : ''
                                                    }
                                                />
                                            </td>
                                            <td className="px-3 py-1.5 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-white font-semibold text-xs">
                                                            {user.nombre.charAt(0)}
                                                            {user.apellido.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-xs font-medium text-gray-900 truncate">
                                                            {user.nombre} {user.apellido}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-1.5 whitespace-nowrap">
                                                <div className="text-xs text-gray-900 truncate max-w-[200px]">
                                                    {user.email}
                                                </div>
                                            </td>
                                            <td className="px-3 py-1.5 whitespace-nowrap">
                                                <div className="text-xs text-gray-900">{user.documento}</div>
                                            </td>
                                            <td className="px-3 py-1.5 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                    <Shield className="h-3 w-3 mr-1" />
                                                    {profiles.find((p) => p.id === user.profile_id)?.name ||
                                                        'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-1.5 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${user.activo
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                        }`}
                                                >
                                                    <span
                                                        className={`h-2 w-2 rounded-full mr-1.5 ${user.activo ? 'bg-green-500' : 'bg-red-500'
                                                            }`}
                                                    />
                                                    {user.activo ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-1.5 whitespace-nowrap text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onEdit(user)}
                                                        className="h-6 w-6 p-0 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50"
                                                    >
                                                        <Edit className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onDelete(user)}
                                                        disabled={isCurrentUser}
                                                        className="h-6 w-6 p-0 text-red-600 hover:text-red-900 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title={
                                                            isCurrentUser
                                                                ? 'No puedes eliminar tu propio usuario'
                                                                : ''
                                                        }
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
