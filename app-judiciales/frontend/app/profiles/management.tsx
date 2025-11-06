'use client'

import { useState, useEffect, useCallback } from 'react'
import { Profile, CreateProfileInput, UpdateProfileInput } from '@/lib/types'
import { ProfileFormData } from '@/lib/validations'
import { 
    getProfiles, 
    createProfile, 
    updateProfile, 
    deleteProfile 
} from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, Shield, Loader2, Search, X as XIcon, Filter, RefreshCw, Trash2 } from 'lucide-react'
import { useToast } from '@/contexts/toastContext'
import { ProfilesTable } from './table'
import { ProfileForm } from './form'
import { DeleteDialog } from './dialog'

export function ProfilesManagement() {
    const [profiles, setProfiles] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
    const [selectedProfiles, setSelectedProfiles] = useState<string[]>([])
    const [profileToDelete, setProfileToDelete] = useState<Profile | null>(null)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchValue, setSearchValue] = useState('')
    
    // Filtros
    const [activeFilter, setActiveFilter] = useState<string>('')
    const [systemFilter, setSystemFilter] = useState<string>('')
    const [showFilters, setShowFilters] = useState(false)
    
    const toast = useToast()

    const fetchProfiles = useCallback(async () => {
        setLoading(true)
        try {
            const response = await getProfiles()
            
            console.log('Profiles API Response:', response)
            console.log('Profiles Data:', response.data)
            
            if (response.success && response.data) {
                let profilesArray = response.data

                // Log para debug de estado activo
                profilesArray.forEach(profile => {
                    console.log(`Profile ${profile.name}: active=${profile.active}, type=${typeof profile.active}`)
                })

                // Aplicar filtros client-side
                if (activeFilter !== '') {
                    const isActive = activeFilter === 'true'
                    profilesArray = profilesArray.filter(profile => {
                        // Si no existe active, usar is_system como fallback
                        const profileActive = profile.active !== undefined ? profile.active : profile.is_system
                        return profileActive === isActive
                    })
                }

                if (systemFilter !== '') {
                    const isSystem = systemFilter === 'true'
                    profilesArray = profilesArray.filter(profile => profile.is_system === isSystem)
                }

                setProfiles(profilesArray)
            }
        } catch (error: any) {
            console.error('Error fetching profiles:', error)
            toast.error(error.message || 'Error al cargar perfiles')
        } finally {
            setLoading(false)
        }
    }, [toast, activeFilter, systemFilter])

    useEffect(() => {
        fetchProfiles()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeFilter, systemFilter])

    const handleFilterChange = () => {
        fetchProfiles()
    }

    const clearFilters = () => {
        setActiveFilter('')
        setSystemFilter('')
    }

    const handleSearch = () => {
        setSearchValue(searchQuery)
    }

    const clearSearch = () => {
        setSearchQuery('')
        setSearchValue('')
    }

    // Funciones para selección múltiple
    const handleSelectProfile = (id: string) => {
        const profile = profiles.find(p => p.id === id)
        if (profile?.is_system) {
            toast.error('No se puede seleccionar perfiles del sistema')
            return
        }
        setSelectedProfiles(prev =>
            prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
        )
    }

    const toggleSelectAll = () => {
        if (selectedProfiles.length === profiles.filter(p => !p.is_system).length && profiles.filter(p => !p.is_system).length > 0) {
            setSelectedProfiles([])
        } else {
            // Solo seleccionar perfiles que no son del sistema
            setSelectedProfiles(profiles.filter(p => !p.is_system).map(p => p.id))
        }
    }

    const handleDeleteClick = (profile?: Profile) => {
        if (profile) {
            // Verificar si es un perfil del sistema
            if (profile.is_system) {
                toast.error('No se puede eliminar un perfil del sistema')
                return
            }
            setProfileToDelete(profile)
            setIsDeleteDialogOpen(true)
        } else if (selectedProfiles.length > 0) {
            setProfileToDelete(null)
            setIsDeleteDialogOpen(true)
        }
    }

    const handleCreateProfile = () => {
        setSelectedProfile(null)
        setIsFormOpen(true)
    }

    const handleRefreshTable = () => {
        fetchProfiles()
    }

    const handleEditProfile = (profile: Profile) => {
        setSelectedProfile(profile)
        setIsFormOpen(true)
    }

    const handleDeleteProfile = (profile: Profile) => {
        if (profile.is_system) {
            setProfileToDelete(profile)
            setIsDeleteDialogOpen(true)
            return
        }
        setProfileToDelete(profile)
        setIsDeleteDialogOpen(true)
    }

    const handleFormSubmit = async (data: ProfileFormData) => {
        try {
            if (selectedProfile) {
                // Actualizar perfil existente
                const updateData: UpdateProfileInput = {
                    name: data.name,
                    description: data.description,
                    active: data.active,
                    permissions: data.permissions
                }
                
                await updateProfile(selectedProfile.id, updateData)
                
                toast.success('Perfil actualizado exitosamente')
            } else {
                // Crear nuevo perfil
                const createData: CreateProfileInput = {
                    name: data.name,
                    slug: data.slug,
                    description: data.description,
                    active: data.active,
                    permissions: data.permissions
                }
                
                await createProfile(createData)
                
                toast.success('Perfil creado exitosamente')
            }
            
            setIsFormOpen(false)
            setSelectedProfile(null)
            await fetchProfiles()
        } catch (error: any) {
            console.error('Error saving profile:', error)
            toast.error(error.message || 'Error al guardar perfil')
        }
    }

    const handleConfirmDelete = async () => {
        if (!profileToDelete || profileToDelete.is_system) {
            setIsDeleteDialogOpen(false)
            setProfileToDelete(null)
            return
        }

        try {
            await deleteProfile(profileToDelete.id)
            
            toast.success('Perfil eliminado exitosamente')
            setIsDeleteDialogOpen(false)
            setProfileToDelete(null)
            await fetchProfiles()
        } catch (error: any) {
            console.error('Error deleting profile:', error)
            toast.error(error.message || 'Error al eliminar perfil')
        }
    }

    const filteredProfiles = profiles.filter(profile => {
        if (!searchValue) return true
        const search = searchValue.toLowerCase()
        return (
            profile.name.toLowerCase().includes(search) ||
            profile.slug.toLowerCase().includes(search) ||
            profile.description?.toLowerCase().includes(search)
        )
    })

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="h-8 w-8 text-indigo-600" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Gestión de Perfiles
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Administra perfiles y permisos del sistema
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Perfiles</p>
                                <p className="text-3xl font-bold text-gray-900">{profiles.length}</p>
                            </div>
                            <Shield className="h-12 w-12 text-indigo-600" />
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Perfiles Activos</p>
                                <p className="text-3xl font-bold text-green-600">
                                    {profiles.filter(p => p.active !== undefined ? p.active : p.is_system).length}
                                </p>
                            </div>
                            <Shield className="h-12 w-12 text-green-600" />
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Sistema</p>
                                <p className="text-3xl font-bold text-blue-600">
                                    {profiles.filter(p => p.is_system).length}
                                </p>
                            </div>
                            <Shield className="h-12 w-12 text-blue-600" />
                        </div>
                    </Card>
                </div>

                {/* Actions Bar */}
                {!isFormOpen && (
                    <Card className="p-6 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Perfiles</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Gestión de perfiles y permisos
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => setShowFilters(!showFilters)}
                                    variant="outline"
                                >
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filtros
                                </Button>
                                <Button
                                    onClick={handleRefreshTable}
                                    variant="outline"
                                    size="sm"
                                    className="px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                                    title="Actualizar tabla"
                                    disabled={loading}
                                >
                                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                </Button>
                                {selectedProfiles.length > 0 && (
                                    <Button
                                        variant="destructive"
                                        onClick={() => handleDeleteClick()}
                                        className="bg-red-600 hover:bg-red-700"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Eliminar ({selectedProfiles.length})
                                    </Button>
                                )}
                                <Button
                                    onClick={handleCreateProfile}
                                    className="bg-indigo-600 hover:bg-indigo-700"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nuevo Perfil
                                </Button>
                            </div>
                        </div>

                        {/* Filters */}
                        {showFilters && (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Estado
                                    </label>
                                    <select
                                        value={activeFilter}
                                        onChange={(e) => {
                                            setActiveFilter(e.target.value)
                                            handleFilterChange()
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="">Todos</option>
                                        <option value="true">Activos</option>
                                        <option value="false">Inactivos</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tipo
                                    </label>
                                    <select
                                        value={systemFilter}
                                        onChange={(e) => {
                                            setSystemFilter(e.target.value)
                                            handleFilterChange()
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="">Todos</option>
                                        <option value="true">Sistema</option>
                                        <option value="false">Personalizados</option>
                                    </select>
                                </div>

                                <div className="flex items-end">
                                    <Button
                                        onClick={clearFilters}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Limpiar Filtros
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                )}

                {/* Profile Form */}
                {isFormOpen && (
                    <Card className="p-6 mb-6">
                        <ProfileForm
                            profile={selectedProfile || undefined}
                            onSubmit={handleFormSubmit}
                            onCancel={() => {
                                setIsFormOpen(false)
                                setSelectedProfile(null)
                            }}
                        />
                    </Card>
                )}

                {/* Table */}
                {!isFormOpen && (
                    <Card>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                                </div>
                            ) : (
                                <ProfilesTable
                                    profiles={filteredProfiles}
                                    selectedProfiles={selectedProfiles}
                                    onSelectProfile={handleSelectProfile}
                                    onToggleSelectAll={toggleSelectAll}
                                    onEdit={handleEditProfile}
                                    onDelete={handleDeleteProfile}
                                />
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Delete Dialog */}
                <DeleteDialog
                    isOpen={isDeleteDialogOpen}
                    onClose={() => {
                        setIsDeleteDialogOpen(false)
                        setProfileToDelete(null)
                    }}
                    onConfirm={handleConfirmDelete}
                    profileToDelete={profileToDelete}
                />
            </div>
        </div>
    )
}
