'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { User } from '@/lib/types'
import { Shield, Edit, Trash2, Trash, XIcon, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from '@/components/ui/dialog'
import { useToast } from '@/contexts/ToastContext'

interface UsersTableExampleProps {
  onEditUser?: (user: User) => void
  onViewUser?: (user: User) => void
}

export function UsersTableExample({ onEditUser, onViewUser }: UsersTableExampleProps) {
  const toast = useToast()
  
  // Datos simulados de usuarios con estado local
  const [usuariosSimulados, setUsuariosSimulados] = useState<User[]>([
    {
      id: '1',
      email: 'juan.perez@judiciales.gov',
      nombre: 'Juan',
      apellido: 'Pérez',
      documento: '12345678',
      telefono: '+54 11 4567-8901',
      profile_id: 'admin',
      roles: ['crear', 'leer', 'actualizar', 'eliminar', 'imprimir'],
      activo: true,
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-11-01T14:20:00Z'
    },
    {
      id: '2',
      email: 'maria.garcia@judiciales.gov',
      nombre: 'María',
      apellido: 'García',
      documento: '23456789',
      telefono: '+54 11 4567-8902',
      profile_id: 'editor',
      roles: ['crear', 'leer', 'actualizar', 'ver'],
      activo: true,
      created_at: '2024-02-20T09:15:00Z',
      updated_at: '2024-10-28T11:45:00Z'
    },
    {
      id: '3',
      email: 'carlos.rodriguez@judiciales.gov',
      nombre: 'Carlos',
      apellido: 'Rodríguez',
      documento: '34567890',
      telefono: '+54 11 4567-8903',
      profile_id: 'viewer',
      roles: ['leer', 'ver', 'exportar'],
      activo: true,
      created_at: '2024-03-10T13:25:00Z',
      updated_at: '2024-11-02T16:30:00Z'
    },
    {
      id: '4',
      email: 'ana.martinez@judiciales.gov',
      nombre: 'Ana',
      apellido: 'Martínez',
      documento: '45678901',
      telefono: '+54 11 4567-8904',
      profile_id: 'admin',
      roles: ['crear', 'leer', 'actualizar', 'eliminar', 'imprimir', 'exportar', 'importar'],
      activo: true,
      created_at: '2024-04-05T08:00:00Z',
      updated_at: '2024-11-03T09:15:00Z'
    },
    {
      id: '5',
      email: 'luis.fernandez@judiciales.gov',
      nombre: 'Luis',
      apellido: 'Fernández',
      documento: '56789012',
      telefono: '+54 11 4567-8905',
      profile_id: 'editor',
      roles: ['leer', 'actualizar', 'ver', 'imprimir'],
      activo: false,
      created_at: '2024-05-12T10:45:00Z',
      updated_at: '2024-05-12T10:45:00Z'
    },
    {
      id: '6',
      email: 'laura.torres@empresa.com',
      nombre: 'Laura',
      apellido: 'Torres',
      documento: '56789012',
      telefono: '987-654-3216',
      profile_id: '2',
      roles: ['crear', 'actualizar', 'leer'],
      activo: true,
      created_at: '2024-06-01T11:00:00Z',
      updated_at: '2024-06-01T11:00:00Z'
    },
    {
      id: '7',
      email: 'diego.morales@empresa.com',
      nombre: 'Diego',
      apellido: 'Morales',
      documento: '67890123',
      telefono: '987-654-3217',
      profile_id: '3',
      roles: ['leer', 'exportar', 'imprimir'],
      activo: true,
      created_at: '2024-06-10T12:00:00Z',
      updated_at: '2024-06-10T12:00:00Z'
    },
    {
      id: '8',
      email: 'sofia.ruiz@empresa.com',
      nombre: 'Sofía',
      apellido: 'Ruiz',
      documento: '78901234',
      telefono: '987-654-3218',
      profile_id: '1',
      roles: ['crear', 'eliminar', 'actualizar', 'leer', 'ver'],
      activo: true,
      created_at: '2024-06-15T13:00:00Z',
      updated_at: '2024-06-15T13:00:00Z'
    },
    {
      id: '9',
      email: 'pedro.castro@empresa.com',
      nombre: 'Pedro',
      apellido: 'Castro',
      documento: '89012345',
      telefono: '987-654-3219',
      profile_id: '4',
      roles: ['leer', 'ver'],
      activo: true,
      created_at: '2024-07-01T14:00:00Z',
      updated_at: '2024-07-01T14:00:00Z'
    },
    {
      id: '10',
      email: 'valentina.silva@empresa.com',
      nombre: 'Valentina',
      apellido: 'Silva',
      documento: '90123456',
      telefono: '987-654-3220',
      profile_id: '2',
      roles: ['crear', 'actualizar', 'leer', 'imprimir'],
      activo: true,
      created_at: '2024-07-10T15:00:00Z',
      updated_at: '2024-07-10T15:00:00Z'
    },
    {
      id: '11',
      email: 'ricardo.herrera@empresa.com',
      nombre: 'Ricardo',
      apellido: 'Herrera',
      documento: '01234567',
      telefono: '987-654-3221',
      profile_id: '3',
      roles: ['leer', 'exportar'],
      activo: false,
      created_at: '2024-07-15T16:00:00Z',
      updated_at: '2024-07-15T16:00:00Z'
    },
    {
      id: '12',
      email: 'camila.vargas@empresa.com',
      nombre: 'Camila',
      apellido: 'Vargas',
      documento: '12345098',
      telefono: '987-654-3222',
      profile_id: '1',
      roles: ['crear', 'eliminar', 'actualizar', 'leer', 'ver', 'imprimir'],
      activo: true,
      created_at: '2024-08-01T17:00:00Z',
      updated_at: '2024-08-01T17:00:00Z'
    },
    {
      id: '13',
      email: 'fernando.ortiz@empresa.com',
      nombre: 'Fernando',
      apellido: 'Ortiz',
      documento: '23456109',
      telefono: '987-654-3223',
      profile_id: '4',
      roles: ['leer'],
      activo: true,
      created_at: '2024-08-10T18:00:00Z',
      updated_at: '2024-08-10T18:00:00Z'
    },
    {
      id: '14',
      email: 'gabriela.mendez@empresa.com',
      nombre: 'Gabriela',
      apellido: 'Méndez',
      documento: '34567210',
      telefono: '987-654-3224',
      profile_id: '2',
      roles: ['crear', 'actualizar', 'leer', 'ver'],
      activo: true,
      created_at: '2024-08-15T19:00:00Z',
      updated_at: '2024-08-15T19:00:00Z'
    },
    {
      id: '15',
      email: 'javier.ramos@empresa.com',
      nombre: 'Javier',
      apellido: 'Ramos',
      documento: '45678321',
      telefono: '987-654-3225',
      profile_id: '5',
      roles: ['leer', 'imprimir', 'exportar'],
      activo: false,
      created_at: '2024-09-01T20:00:00Z',
      updated_at: '2024-09-01T20:00:00Z'
    }
  ])

  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [userToView, setUserToView] = useState<User | null>(null)
  const [selectionBarContainer, setSelectionBarContainer] = useState<HTMLElement | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Encontrar el contenedor para el portal
  useEffect(() => {
    const container = document.getElementById('selection-bar')
    setSelectionBarContainer(container)
  }, [])

  // Toggle selección de un usuario
  const toggleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  // Toggle seleccionar todos
  const toggleSelectAll = () => {
    if (selectedUsers.length === currentUsers.length && currentUsers.length > 0) {
      // Deseleccionar todos de la página actual
      setSelectedUsers(prev => prev.filter(id => !currentUsers.find(u => u.id === id)))
    } else {
      // Seleccionar todos de la página actual
      const currentUserIds = currentUsers.map(u => u.id)
      const uniqueIds = Array.from(new Set([...selectedUsers, ...currentUserIds]))
      setSelectedUsers(uniqueIds)
    }
  }

  // Abrir diálogo de eliminación
  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId)
    setIsDeleteDialogOpen(true)
  }

  // Abrir diálogo de eliminación múltiple
  const handleDeleteSelected = () => {
    if (selectedUsers.length === 0) {
      toast.error('No hay usuarios seleccionados')
      return
    }
    setUserToDelete(null)
    setIsDeleteDialogOpen(true)
  }

  // Confirmar eliminación
  const handleConfirmDelete = () => {
    if (userToDelete) {
      // Eliminar un solo usuario
      const user = usuariosSimulados.find(u => u.id === userToDelete)
      setUsuariosSimulados(prev => prev.filter(u => u.id !== userToDelete))
      toast.success(`Usuario "${user?.nombre} ${user?.apellido}" eliminado exitosamente`)
    } else {
      // Eliminar usuarios seleccionados
      setUsuariosSimulados(prev => prev.filter(u => !selectedUsers.includes(u.id)))
      toast.success(`${selectedUsers.length} usuario(s) eliminado(s) exitosamente`)
      setSelectedUsers([])
    }
    setIsDeleteDialogOpen(false)
    setUserToDelete(null)
  }

  // Abrir diálogo de edición
  const handleEditClick = (user: User) => {
    if (onEditUser) {
      onEditUser(user)
    }
  }

  // Abrir diálogo de ver detalle
  const handleViewClick = (user: User) => {
    if (onViewUser) {
      onViewUser(user)
    } else {
      setUserToView(user)
      setIsViewDialogOpen(true)
    }
  }

  const getUserToDeleteInfo = () => {
    if (userToDelete) {
      const user = usuariosSimulados.find(u => u.id === userToDelete)
      return user ? `${user.nombre} ${user.apellido}` : ''
    }
    return `${selectedUsers.length} usuario(s)`
  }

  // Calcular datos de paginación
  const totalPages = Math.ceil(usuariosSimulados.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentUsers = usuariosSimulados.slice(startIndex, endIndex)

  // Cambiar de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setSelectedUsers([]) // Limpiar selección al cambiar de página
  }

  return (
    <>
      {/* Barra de selección en el header usando portal */}
      {selectedUsers.length > 0 && selectionBarContainer && createPortal(
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-indigo-900">
            {selectedUsers.length} usuario(s) seleccionado(s)
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteSelected}
            className="gap-2 h-7"
          >
            <Trash className="h-3.5 w-3.5" />
            Eliminar
          </Button>
        </div>,
        selectionBarContainer
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-1.5 text-left">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
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
            {currentUsers.map((user) => (
              <tr 
                key={user.id} 
                className={`hover:bg-gray-50 transition-colors ${selectedUsers.includes(user.id) ? 'bg-indigo-50' : ''}`}
              >
                <td className="px-3 py-1.5">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleSelectUser(user.id)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </td>
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
                <td className="px-3 py-1.5 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    user.profile_id === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : user.profile_id === 'editor'
                      ? 'bg-blue-100 text-blue-800'
                      : user.profile_id === 'viewer'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    <Shield className="h-3 w-3 mr-1" />
                    {user.profile_id?.toUpperCase() || 'N/A'}
                  </span>
                </td>
                <td className="px-3 py-1.5 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                    user.activo 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    <span className={`h-2 w-2 rounded-full mr-1.5 ${
                      user.activo ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    {user.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-3 py-1.5 whitespace-nowrap text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewClick(user)}
                      className="h-7 w-7 p-0 text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                      title="Ver detalle"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(user)}
                      className="h-7 w-7 p-0 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50"
                      title="Editar usuario"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(user.id)}
                      className="h-7 w-7 p-0 text-red-600 hover:text-red-900 hover:bg-red-50"
                      title="Eliminar usuario"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {usuariosSimulados.length === 0 && (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay usuarios para mostrar</p>
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Mostrando {startIndex + 1} a {Math.min(endIndex, usuariosSimulados.length)} de {usuariosSimulados.length} usuarios
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-4">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Diálogo de Confirmación de Eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsDeleteDialogOpen(false)
          setUserToDelete(null)
        }
      }}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <DialogTitle>Confirmar Eliminación</DialogTitle>
            </div>
            <DialogDescription>
              {userToDelete ? (
                <span>
                  ¿Estás seguro de que deseas eliminar al usuario <strong>"{getUserToDeleteInfo()}"</strong>?
                </span>
              ) : (
                <span>
                  ¿Estás seguro de que deseas eliminar <strong>{selectedUsers.length} usuario(s)</strong>?
                </span>
              )}
              <br />
              <span className="text-red-600 font-medium">Esta acción no se puede deshacer.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
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

      {/* Diálogo de Detalle del Usuario */}
      <Dialog open={isViewDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsViewDialogOpen(false)
          setUserToView(null)
        }
      }}>
        <DialogContent className="max-w-2xl" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              Detalle del Usuario
            </DialogTitle>
          </DialogHeader>
          
          {userToView && (
            <div className="space-y-4">
              {/* Avatar y Nombre */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-white font-bold text-2xl">
                    {userToView.nombre.charAt(0)}{userToView.apellido.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {userToView.nombre} {userToView.apellido}
                  </h3>
                  <p className="text-sm text-gray-600">{userToView.profile_id?.toUpperCase() || 'Sin perfil'}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold mt-1 ${
                    userToView.activo 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    <span className={`h-2 w-2 rounded-full mr-1 ${
                      userToView.activo ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    {userToView.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>

              {/* Información de Contacto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                  <p className="text-sm font-medium text-gray-900 mt-1 break-all">{userToView.email}</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Documento</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">{userToView.documento}</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Teléfono</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">{userToView.telefono || 'No especificado'}</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Perfil</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">{userToView.profile_id?.toUpperCase() || 'Sin perfil'}</p>
                </div>
              </div>

              {/* Roles */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Roles Asignados</label>
                {userToView.roles && userToView.roles.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {userToView.roles.map((role, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 border border-indigo-200"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Sin roles asignados</p>
                )}
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Fecha de Creación</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {new Date(userToView.created_at).toLocaleDateString('es-AR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Última Actualización</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {new Date(userToView.updated_at).toLocaleDateString('es-AR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              onClick={() => {
                setIsViewDialogOpen(false)
                setUserToView(null)
              }}
              className="gap-2"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
