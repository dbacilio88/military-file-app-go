'use client'

import { useState, useEffect, useCallback } from 'react'
import { User, UserSearchParams, Profile } from '@/lib/types'
import { getUsers, createUser, updateUser, deleteUser, getProfiles } from '@/lib/api'
import { UserFormData } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
    Plus,
    Users as UsersIcon,
    Loader2,
    X as XIcon,
    Trash2,
    Shield,
    Filter
} from 'lucide-react'
import { useToast } from '@/contexts/toastContext'
import { UsersTable } from './table'
import { UserForm } from './form'
import { Pagination } from './pagination'
import { DeleteDialog } from './dialog'

export function UsersManagement() {
    const [users, setUsers] = useState<User[]>([])
    const [profiles, setProfiles] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [selectedUsers, setSelectedUsers] = useState<string[]>([])
    const [userToDelete, setUserToDelete] = useState<User | null>(null)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalUsers, setTotalUsers] = useState(0)
    const pageSize = 10
    const toast = useToast()

    // Filtros
    const [profileFilter, setProfileFilter] = useState<string>('')
    const [activoFilter, setActivoFilter] = useState<string>('')
    const [showFilters, setShowFilters] = useState(false)

    // Obtener el ID del usuario actual en sesión
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('user')
            if (userStr) {
                try {
                    const user = JSON.parse(userStr)
                    setCurrentUserId(user.id)
                } catch (error) {
                    console.error('Error parsing user from localStorage:', error)
                }
            }
        }
    }, [])

    const fetchUsers = useCallback(async (page: number = 1) => {
        setLoading(true)
        try {
            const params: UserSearchParams = {
                page,
                limit: pageSize,
            }

            const response = await getUsers(params)

            console.log('Response from API:', response)
            console.log('Response.data:', response.data)

            if (response.success && response.data) {
                // El backend puede devolver un array directamente o un objeto con data
                let usersArray: User[] = []
                const responseData = response.data as any

                if (Array.isArray(responseData)) {
                    // Si response.data es un array directamente
                    usersArray = responseData
                } else if (responseData.data && Array.isArray(responseData.data)) {
                    // Si está envuelto en response.data.data
                    usersArray = responseData.data
                } else if (responseData.id) {
                    // Si es un solo objeto de usuario
                    usersArray = [responseData as User]
                }

                console.log('Users array:', usersArray)
                
                // Aplicar filtros del lado del cliente
                let filteredUsers = usersArray
                
                if (profileFilter) {
                    filteredUsers = filteredUsers.filter(user => user.profile_id === profileFilter)
                }
                
                if (activoFilter !== '') {
                    const isActive = activoFilter === 'true'
                    filteredUsers = filteredUsers.filter(user => user.activo === isActive)
                }
                
                setUsers(filteredUsers)
                setTotalPages(responseData.pagination?.totalPages || 1)
                setTotalUsers(responseData.pagination?.total || filteredUsers.length)
                setCurrentPage(page)
            } else {
                console.warn('API response structure unexpected:', response)
                setUsers([])
                setTotalPages(1)
                setTotalUsers(0)
            }
        } catch (error) {
            console.error('Error fetching users:', error)
            console.error('Error details:', JSON.stringify(error, null, 2))
            toast.error('Error al cargar los usuarios')
            setUsers([])
            setTotalPages(1)
            setTotalUsers(0)
        } finally {
            setLoading(false)
        }
    }, [toast, profileFilter, activoFilter])

    const fetchProfiles = useCallback(async () => {
        try {
            const response = await getProfiles()
            if (response.success && response.data) {
                setProfiles(response.data)
            } else {
                console.warn('Profiles API response structure unexpected:', response)
                setProfiles([])
            }
        } catch (error) {
            console.error('Error fetching profiles:', error)
            toast.error('Error al cargar los perfiles')
            setProfiles([])
        }
    }, [toast])

    useEffect(() => {
        fetchUsers(1) // Solo cargar la primera vez con valores por defecto
        fetchProfiles()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Array vacío para ejecutar solo una vez

    const clearFilters = () => {
        setProfileFilter('')
        setActivoFilter('')
        fetchUsers(1)
    }

    const handleFilterChange = () => {
        fetchUsers(1)
    }

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            fetchUsers(page)
        }
    }

    const handleCreateUser = () => {
        setSelectedUser(null)
        setIsFormOpen(true)
    }

    const handleEditUser = (user: User) => {
        setSelectedUser(user)
        setIsFormOpen(true)
    }

    const handleFormSubmit = async (data: UserFormData) => {
        try {
            if (selectedUser) {
                // Actualizar usuario
                await updateUser(selectedUser.id, data)
                toast.success('Usuario actualizado exitosamente')
            } else {
                // Crear usuario
                if (!data.password) {
                    toast.error('La contraseña es requerida para crear un nuevo usuario')
                    return
                }
                const createUserData = {
                    ...data,
                    password: data.password as string
                }
                await createUser(createUserData)
                toast.success('Usuario creado exitosamente')
            }

            setIsFormOpen(false)
            fetchUsers(currentPage)
        } catch (error: any) {
            console.error('Error saving user:', error)
            toast.error(error.message || 'Error al guardar el usuario')
        }
    }

    const handleDeleteUser = async () => {
        if (!userToDelete) return

        try {
            await deleteUser(userToDelete.id)
            setIsDeleteDialogOpen(false)
            setUserToDelete(null)
            toast.success('Usuario eliminado exitosamente')

            // Refrescar la lista
            const newPage = users.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage
            fetchUsers(newPage)
        } catch (error: any) {
            console.error('Error deleting user:', error)
            toast.error(error.message || 'Error al eliminar el usuario')
        }
    }

    // Funciones para selección múltiple
    const handleSelectUser = (id: string) => {
        // No permitir seleccionar el usuario actual
        if (id === currentUserId) {
            toast.error('No puedes seleccionar tu propio usuario')
            return
        }
        setSelectedUsers(prev =>
            prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
        )
    }

    const toggleSelectAll = () => {
        if (selectedUsers.length === users.length && users.length > 0) {
            setSelectedUsers([])
        } else {
            // Filtrar el usuario actual al seleccionar todos
            setSelectedUsers(users.filter(u => u.id !== currentUserId).map(u => u.id))
        }
    }

    const handleDeleteClick = (user?: User) => {
        if (user) {
            // Verificar si el usuario a eliminar es el usuario actual
            if (user.id === currentUserId) {
                toast.error('No puedes eliminar tu propio usuario')
                return
            }
            setUserToDelete(user)
            setIsDeleteDialogOpen(true)
        } else if (selectedUsers.length > 0) {
            setUserToDelete(null)
            setIsDeleteDialogOpen(true)
        }
    }

    const handleDeleteMultiple = async () => {
        try {
            await Promise.all(selectedUsers.map(id => deleteUser(id)))
            setIsDeleteDialogOpen(false)
            setSelectedUsers([])
            toast.success(`${selectedUsers.length} usuario(s) eliminado(s) exitosamente`)

            // Refrescar la lista
            const newPage = users.length === selectedUsers.length && currentPage > 1 ? currentPage - 1 : currentPage
            fetchUsers(newPage)
        } catch (error: any) {
            console.error('Error deleting users:', error)
            toast.error(error.message || 'Error al eliminar los usuarios')
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-100 rounded-lg">
                    <UsersIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Gestión de Usuarios</h2>
                </div>
                <p className="text-xs text-gray-600 ml-8">
                    Administra los usuarios del sistema
                </p>
            </div>

            {/* Stats */}
            <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                <CardContent className="py-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-600">Total de Usuarios</p>
                            <p className="text-xl font-bold text-indigo-600">{totalUsers}</p>
                        </div>
                        <div className="p-1.5 bg-indigo-100 rounded-full">
                            <UsersIcon className="h-5 w-5 text-indigo-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Actions Bar */}
            {users.length > 0 && (
                <>
                    <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                        <div className="flex items-center gap-3 flex-1">
                            {/* Barra de selección */}
                            {selectedUsers.length > 0 && (
                                <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-200 rounded-md px-3 py-1">
                                    <span className="text-sm font-medium text-indigo-900">
                                        {selectedUsers.length} usuario(s) seleccionado(s)
                                    </span>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDeleteClick(undefined)}
                                        className="h-7"
                                    >
                                        <Trash2 className="h-4 w-4 mr-1.5" />
                                        Eliminar
                                    </Button>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                Filtros
                            </Button>
                            <Button
                                onClick={() => {
                                    window.location.href = '/profiles'
                                }}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                <Shield className="h-4 w-4 mr-2" />
                                Gestionar Perfiles
                            </Button>
                            <Button
                                onClick={handleCreateUser}
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Nuevo Usuario
                            </Button>
                        </div>
                    </div>

                    {/* Filtros */}
                    {showFilters && (
                        <Card className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Perfil
                                    </label>
                                    <select
                                        value={profileFilter}
                                        onChange={(e) => {
                                            setProfileFilter(e.target.value)
                                            handleFilterChange()
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Todos los perfiles</option>
                                        {profiles.map(profile => (
                                            <option key={profile.id} value={profile.id}>
                                                {profile.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Estado
                                    </label>
                                    <select
                                        value={activoFilter}
                                        onChange={(e) => {
                                            setActivoFilter(e.target.value)
                                            handleFilterChange()
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Todos los estados</option>
                                        <option value="true">Activo</option>
                                        <option value="false">Inactivo</option>
                                    </select>
                                </div>

                                <div className="flex items-end">
                                    <Button
                                        variant="outline"
                                        onClick={clearFilters}
                                        className="w-full"
                                    >
                                        Limpiar Filtros
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}
                </>
            )}

            {/* Content */}
            {loading ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
                        <p className="text-gray-600">Cargando usuarios...</p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Users Table */}
                    <UsersTable
                        users={users}
                        profiles={profiles}
                        currentUserId={currentUserId}
                        selectedUsers={selectedUsers}
                        onSelectUser={handleSelectUser}
                        onToggleSelectAll={toggleSelectAll}
                        onEdit={handleEditUser}
                        onDelete={handleDeleteClick}
                       // searchQuery={searchQuery}
                    />

                    {/* Pagination */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalUsers}
                        pageSize={pageSize}
                        onPageChange={handlePageChange}
                    />
                </>
            )}

            {/* User Form Dialog */}
            <UserForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleFormSubmit}
                selectedUser={selectedUser}
                profiles={profiles}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false)
                    setUserToDelete(null)
                }}
                onConfirm={userToDelete ? handleDeleteUser : handleDeleteMultiple}
                userToDelete={userToDelete}
                selectedUsersCount={selectedUsers.length}
            />
        </div>
    )
}