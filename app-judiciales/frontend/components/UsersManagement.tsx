'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, UserSearchParams, Profile } from '@/lib/types'
import { getUsers, createUser, updateUser, deleteUser, getProfiles } from '@/lib/api'
import { userSchema, UserFormData } from '@/lib/validation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from '@/components/ui/dialog'
import { 
  Plus, 
  Users as UsersIcon, 
  Loader2, 
  Search, 
  X as XIcon, 
  ChevronLeft, 
  ChevronRight,
  Edit,
  Trash2,
  Mail,
  Phone,
  FileText,
  Shield,
  AlertTriangle,
  Save,
  UserPlus
} from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'
import { UsersTableExample } from './UsersTableExample'

export function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchValue, setSearchValue] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [roles, setRoles] = useState<string[]>([])
  const pageSize = 10
  const toast = useToast()

  // Roles disponibles en el sistema según documentación Swagger
  const availableRoles = [
    { id: 'crear', label: 'Crear', description: 'Crear nuevos registros', color: 'bg-green-50 border-green-200 hover:bg-green-100 text-green-700' },
    { id: 'eliminar', label: 'Eliminar', description: 'Eliminar registros', color: 'bg-red-50 border-red-200 hover:bg-red-100 text-red-700' },
    { id: 'actualizar', label: 'Actualizar', description: 'Modificar registros', color: 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700' },
    { id: 'leer', label: 'Leer', description: 'Consultar/listar registros', color: 'bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700' },
    { id: 'imprimir', label: 'Imprimir', description: 'Generar documentos imprimibles', color: 'bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-700' },
    { id: 'exportar', label: 'Exportar', description: 'Exportar datos', color: 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100 text-cyan-700' },
    { id: 'importar', label: 'Importar', description: 'Importar datos', color: 'bg-teal-50 border-teal-200 hover:bg-teal-100 text-teal-700' },
    { id: 'ver', label: 'Ver', description: 'Visualizar detalles', color: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100 text-indigo-700' },
  ]

  const {
    register,
    handleSubmit: handleFormSubmitWrapper,
    reset,
    setValue,
    formState: { errors, isSubmitting, isValid },
    watch,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    mode: 'onChange',
  })

  const fetchUsers = async (page: number = 1, search: string = '') => {
    setLoading(true)
    try {
      const params: UserSearchParams = {
        page,
        limit: pageSize,
      }

      if (search.trim()) {
        params.email = search
        params.nombre = search
        params.documento = search
      }

      const response = await getUsers(params)
      
      if (response.success && response.data) {
        setUsers(response.data.data)
        setTotalPages(response.data.pagination.totalPages)
        setTotalUsers(response.data.pagination.total)
        setCurrentPage(page)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Error al cargar los usuarios')
      setUsers([])
      setTotalPages(1)
      setTotalUsers(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(currentPage, searchQuery)
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    try {
      const response = await getProfiles()
      if (response.success && response.data) {
        setProfiles(response.data)
      }
    } catch (error) {
      console.error('Error fetching profiles:', error)
      toast.error('Error al cargar los perfiles')
    }
  }

  useEffect(() => {
    if (selectedUser) {
      reset({
        email: selectedUser.email,
        password: '',
        nombre: selectedUser.nombre,
        apellido: selectedUser.apellido,
        documento: selectedUser.documento,
        telefono: selectedUser.telefono || '',
        profile_id: selectedUser.profile_id || '',
      })
      setRoles(selectedUser.roles || [])
    } else {
      reset({ 
        email: '', 
        password: '', 
        nombre: '', 
        apellido: '', 
        documento: '', 
        telefono: '', 
        profile_id: '',
      })
      setRoles([])
    }
  }, [selectedUser, reset, isFormOpen])

  const handleSearch = () => {
    setSearchQuery(searchValue)
    setCurrentPage(1)
    fetchUsers(1, searchValue)
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleClearSearch = () => {
    setSearchValue('')
    setSearchQuery('')
    setCurrentPage(1)
    fetchUsers(1, '')
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchUsers(page, searchQuery)
  }

  const handleCreateUser = () => {
    setSelectedUser(null)
    setIsFormOpen(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    setIsDeleteDialogOpen(true)
  }

  const toggleRole = (roleId: string) => {
    const updatedRoles = roles.includes(roleId)
      ? roles.filter(r => r !== roleId)
      : [...roles, roleId]
    setRoles(updatedRoles)
    setValue('roles', updatedRoles)
  }

  const removeRole = (roleToRemove: string) => {
    const updatedRoles = roles.filter(role => role !== roleToRemove)
    setRoles(updatedRoles)
    setValue('roles', updatedRoles)
  }

  const handleFormSubmit = async (data: UserFormData) => {
    try {
      if (selectedUser) {
        const updateData: any = {
          email: data.email,
          nombre: data.nombre,
          apellido: data.apellido,
          documento: data.documento,
          telefono: data.telefono || undefined,
          profile_id: data.profile_id || undefined,
          roles: roles.length > 0 ? roles : undefined,
        }
        
        if (data.password && data.password.trim() !== '') {
          updateData.password = data.password
        }

        await updateUser(selectedUser.id, updateData)
        toast.success('Usuario actualizado exitosamente')
      } else {
        if (!data.password || data.password.trim() === '') {
          toast.error('La contraseña es requerida para crear un nuevo usuario')
          return
        }

        const createData: any = {
          email: data.email,
          password: data.password,
          nombre: data.nombre,
          apellido: data.apellido,
          documento: data.documento,
          telefono: data.telefono || undefined,
          profile_id: data.profile_id || undefined,
          roles: roles.length > 0 ? roles : undefined,
        }

        await createUser(createData)
        toast.success('Usuario creado exitosamente')
      }
      
      setIsFormOpen(false)
      setSelectedUser(null)
      setRoles([])
      reset()
      fetchUsers(currentPage, searchQuery)
    } catch (error: any) {
      console.error('Error saving user:', error)
      toast.error(error.message || 'Error al guardar el usuario')
    }
  }

  const handleConfirmDelete = async () => {
    if (!userToDelete) return

    try {
      await deleteUser(userToDelete.id)
      toast.success('Usuario eliminado exitosamente')
      setIsDeleteDialogOpen(false)
      setUserToDelete(null)
      
      if (users.length === 1 && currentPage > 1) {
        fetchUsers(currentPage - 1, searchQuery)
      } else {
        fetchUsers(currentPage, searchQuery)
      }
    } catch (error: any) {
      console.error('Error deleting user:', error)
      toast.error(error.message || 'Error al eliminar el usuario')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1 bg-indigo-100 rounded-lg">
            <Shield className="h-4 w-4 text-indigo-600" />
          </div>
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
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              placeholder="Buscar por email, nombre o documento..."
              className="pl-10 pr-10"
            />
            {searchValue && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                onClick={handleClearSearch}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button 
            onClick={handleCreateUser}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-600">Cargando usuarios...</p>
          </CardContent>
        </Card>
      ) : users.length === 0 ? (
        <>
          {/* Mensaje de ejemplo */}
          <Card className="mb-4 bg-blue-50 border-blue-200">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">Mostrando datos de ejemplo</p>
                  <p className="text-xs text-blue-700">No se pudo conectar con la API. Aquí hay algunos usuarios simulados.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Tabla de ejemplo */}
          <Card>
            <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Lista de Usuarios (Ejemplo)</CardTitle>
              <div className="flex items-center gap-3">
                <div id="selection-bar"></div>
                <Button 
                  onClick={handleCreateUser}
                  className="bg-indigo-600 hover:bg-indigo-700 h-7"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Usuario
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <UsersTableExample onEditUser={handleEditUser} />
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Users Table */}
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
                          Roles
                        </th>
                        <th className="px-3 py-1.5 text-right text-xs font-medium text-gray-500 uppercase">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr 
                          key={user.id} 
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-3 py-1.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-semibold text-xs">
                                  {user.nombre.charAt(0)}{user.apellido.charAt(0)}
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
                            <div className="text-xs text-gray-900">
                              {user.documento}
                            </div>
                          </td>
                          <td className="px-3 py-1.5">
                            {user.roles && user.roles.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {user.roles.slice(0, 3).map((role, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                                  >
                                    {role}
                                  </span>
                                ))}
                                {user.roles.length > 3 && (
                                  <span className="text-xs text-gray-500">
                                    +{user.roles.length - 3}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">Sin roles</span>
                            )}
                          </td>
                          <td className="px-3 py-1.5 whitespace-nowrap text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditUser(user)}
                                className="h-7 w-7 p-0 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(user)}
                                className="h-7 w-7 p-0 text-red-600 hover:text-red-900 hover:bg-red-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
              <div className="text-sm text-gray-600">
                Mostrando {(currentPage - 1) * pageSize + 1} a {Math.min(currentPage * pageSize, totalUsers)} de {totalUsers} usuarios
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium px-4">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* User Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(open) => {
        // No hacer nada cuando intenta cerrar desde afuera
        // Solo se puede cerrar con los botones
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {selectedUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmitWrapper(handleFormSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div className="relative">
                <Input 
                  {...register('email')} 
                  type="email"
                  placeholder=" " 
                  className="peer"
                />
                <label className="absolute left-2 -top-2.5 bg-white px-1 text-xs font-medium text-gray-600 transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-600">
                  Email <span className="text-red-500">*</span>
                </label>
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="relative">
                <Input 
                  {...register('password')} 
                  type="password"
                  placeholder=" "
                  className="peer"
                />
                <label className="absolute left-2 -top-2.5 bg-white px-1 text-xs font-medium text-gray-600 transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-600">
                  Contraseña {selectedUser ? '(opcional)' : <span className="text-red-500">*</span>}
                </label>
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Nombre */}
              <div className="relative">
                <Input 
                  {...register('nombre')} 
                  placeholder=" " 
                  className="peer"
                />
                <label className="absolute left-2 -top-2.5 bg-white px-1 text-xs font-medium text-gray-600 transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-600">
                  Nombre <span className="text-red-500">*</span>
                </label>
                {errors.nombre && (
                  <p className="text-sm text-red-500 mt-1">{errors.nombre.message}</p>
                )}
              </div>

              {/* Apellido */}
              <div className="relative">
                <Input 
                  {...register('apellido')} 
                  placeholder=" " 
                  className="peer"
                />
                <label className="absolute left-2 -top-2.5 bg-white px-1 text-xs font-medium text-gray-600 transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-600">
                  Apellido <span className="text-red-500">*</span>
                </label>
                {errors.apellido && (
                  <p className="text-sm text-red-500 mt-1">{errors.apellido.message}</p>
                )}
              </div>

              {/* Documento */}
              <div className="relative">
                <Input 
                  {...register('documento')} 
                  placeholder=" " 
                  className="peer"
                />
                <label className="absolute left-2 -top-2.5 bg-white px-1 text-xs font-medium text-gray-600 transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-600">
                  Documento <span className="text-red-500">*</span>
                </label>
                {errors.documento && (
                  <p className="text-sm text-red-500 mt-1">{errors.documento.message}</p>
                )}
              </div>

              {/* Teléfono */}
              <div className="relative">
                <Input 
                  {...register('telefono')} 
                  placeholder=" " 
                  className="peer"
                />
                <label className="absolute left-2 -top-2.5 bg-white px-1 text-xs font-medium text-gray-600 transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-600">
                  Teléfono
                </label>
                {errors.telefono && (
                  <p className="text-sm text-red-500 mt-1">{errors.telefono.message}</p>
                )}
              </div>

              {/* Profile ID */}
              <div>
                <select 
                  {...register('profile_id')} 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-muted-foreground [&:not([value=''])]:text-foreground"
                >
                  <option value="">Seleccionar perfil</option>
                  {profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name}
                    </option>
                  ))}
                </select>
                {errors.profile_id && (
                  <p className="text-sm text-red-500 mt-1">{errors.profile_id.message}</p>
                )}
              </div>

              {/* Roles */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Roles
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {availableRoles.map((role) => (
                    <div 
                      key={role.id}
                      className={`flex items-center gap-2 p-2 border rounded transition-colors ${role.color}`}
                    >
                      <input
                        type="checkbox"
                        id={`role-${role.id}`}
                        checked={roles.includes(role.id)}
                        onChange={() => toggleRole(role.id)}
                        className="h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-offset-0"
                      />
                      <label 
                        htmlFor={`role-${role.id}`}
                        className="flex-1 cursor-pointer text-sm font-medium"
                        title={role.description}
                      >
                        {role.label}
                      </label>
                    </div>
                  ))}
                </div>
                {roles.length > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    {roles.length} rol{roles.length !== 1 ? 'es' : ''} seleccionado{roles.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsFormOpen(false)
                  setSelectedUser(null)
                  setRoles([])
                  reset()
                }}
                className="gap-2"
              >
                <XIcon className="h-4 w-4" />
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !isValid || (Object.keys(errors).length > 0)} 
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : selectedUser ? (
                  <>
                    <Save className="h-4 w-4" />
                    Actualizar
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Crear
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        // No hacer nada cuando intenta cerrar desde afuera
      }}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <DialogTitle>¿Eliminar usuario?</DialogTitle>
            </div>
            <DialogDescription>
              {userToDelete && (
                <span>
                  ¿Estás seguro de que deseas eliminar al usuario <strong>"{userToDelete.nombre} {userToDelete.apellido}"</strong>? Esta acción no se puede deshacer.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setUserToDelete(null)
              }}
              className="gap-2"
            >
              <XIcon className="h-4 w-4" />
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
