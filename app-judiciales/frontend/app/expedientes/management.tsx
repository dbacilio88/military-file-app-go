'use client'

import { useState, useEffect, useCallback } from 'react'
import { Expediente, CreateExpedienteInput, UpdateExpedienteInput, ExpedienteSearchParams, Grado, SituacionMilitar, ExpedienteEstado, GradoLabels, SituacionMilitarLabels, EstadoExpedienteLabels } from '@/lib/types'
import { getExpedientes, searchExpedientes, createExpediente, updateExpediente, deleteExpediente } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ExpedientesTable } from './table'
import { ExpedienteForm } from './form'
import { ExpedientesImport } from './import'
import { DeleteDialog } from './dialog'
import { Pagination } from './pagination'
import { Plus, Search, Filter, FileText, CheckCircle2, XCircle, X as XIcon, Trash2, UsersIcon, Upload, RefreshCw, Download, Archive } from 'lucide-react'
import { usePermissions } from '@/contexts/authContext'
import { exportExpedientes } from '@/lib/api'
import { EstantesVisualization } from '@/components/EstantesVisualization'

export function ExpedientesManagement() {
    const [expedientes, setExpedientes] = useState<Expediente[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedExpediente, setSelectedExpediente] = useState<Expediente | null>(null)
    const [selectedExpedientes, setSelectedExpedientes] = useState<string[]>([])
    const [expedienteToDelete, setExpedienteToDelete] = useState<Expediente | null>(null)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isImportOpen, setIsImportOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isEstantesOpen, setIsEstantesOpen] = useState(false)
    const [allExpedientes, setAllExpedientes] = useState<Expediente[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [searchValue, setSearchValue] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalExpedientes, setTotalExpedientes] = useState(0)
    const pageSize = 10
    const toast = useToast()

    const { isAdmin } = usePermissions()

    // Filters and search
    const [gradoFilter, setGradoFilter] = useState<Grado | ''>('')
    const [situacionFilter, setSituacionFilter] = useState<SituacionMilitar | ''>('')
    const [estadoFilter, setEstadoFilter] = useState<ExpedienteEstado | ''>('')
    const [fechaInicioFilter, setFechaInicioFilter] = useState('')
    const [fechaFinFilter, setFechaFinFilter] = useState('')
    const [showFilters, setShowFilters] = useState(false)

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        dentro: 0,
        fuera: 0
    })

    // Función para obtener estadísticas completas
    const fetchStats = useCallback(async () => {
        try {
            // Obtener todos los expedientes para calcular estadísticas reales
            const statsParams: ExpedienteSearchParams = {
                page: 1,
                limit: 9999, // Límite alto para obtener todos
            }
            
            const response = await getExpedientes(statsParams.page, statsParams.limit)
            
            if (response.success && response.data?.data) {
                const allExpedientes = response.data.data
                setStats({
                    total: response.data.pagination?.total || allExpedientes.length,
                    dentro: allExpedientes.filter((e: Expediente) => e.estado === 'dentro').length,
                    fuera: allExpedientes.filter((e: Expediente) => e.estado === 'fuera').length
                })
            }
        } catch (error) {
            console.error('Error fetching stats:', error)
            // Mantener stats en 0 si hay error
            setStats({ total: 0, dentro: 0, fuera: 0 })
        }
    }, [])

    const fetchExpedientes = useCallback(async (page: number = 1, filters: { 
        grado?: Grado, 
        situacion?: SituacionMilitar, 
        estado?: ExpedienteEstado,
        fecha_inicio?: string,
        fecha_fin?: string
    } = {}) => {
        setLoading(true)
        try {
            const hasFilters = filters.grado || filters.situacion || filters.estado || filters.fecha_inicio || filters.fecha_fin;
            let response;

            if (hasFilters) {
                // Usar searchExpedientes cuando hay filtros
                const params: ExpedienteSearchParams = {
                    page,
                    limit: pageSize,
                    ...(filters.grado && { grado: filters.grado }),
                    ...(filters.situacion && { situacion_militar: filters.situacion }),
                    ...(filters.estado && { estado: filters.estado }),
                    ...(filters.fecha_inicio && { fecha_inicio: filters.fecha_inicio }),
                    ...(filters.fecha_fin && { fecha_fin: filters.fecha_fin })
                };
                response = await searchExpedientes(params);
            } else {
                // Usar getExpedientes básico cuando no hay filtros
                response = await getExpedientes(page, pageSize);
            }

            console.log('Expedientes API Response:', response)
            console.log('Response.data:', response.data)
            console.log('Response status:', response.success)
            console.log('Response structure:', Object.keys(response))

            if (response.success && response.data) {
                let expedientesArray: Expediente[] = []
                const responseData = response.data as any

                // La estructura correcta es: response.data.expedientes
                // Manejar caso donde expedientes es null (sin datos)
                if (responseData.expedientes && Array.isArray(responseData.expedientes)) {
                    expedientesArray = responseData.expedientes
                } else if (responseData.expedientes === null) {
                    // Caso específico: expedientes es null, usar array vacío
                    expedientesArray = []
                    console.log('Expedientes is null, using empty array')
                } else if (Array.isArray(responseData)) {
                    // Fallback: si response.data es directamente un array
                    expedientesArray = responseData
                } else {
                    console.warn('Estructura de respuesta inesperada:', responseData)
                    expedientesArray = []
                }
                
                console.log('Expedientes array:', expedientesArray)
                setExpedientes(expedientesArray)
                
                // Usar información de paginación del response
                setTotalPages(responseData.total_pages || 1)
                setTotalExpedientes(responseData.total || expedientesArray.length)
                setCurrentPage(responseData.page || page)

                // Solo actualizar estadísticas en la primera carga
                if (page === 1) {
                    fetchStats()
                }
            } else {
                console.warn('API response structure unexpected:', response)
                setExpedientes([])
                setTotalPages(1)
                setTotalExpedientes(0)
                setStats({ total: 0, dentro: 0, fuera: 0 })
            }
        } catch (error) {
            console.error('Error fetching expedientes:', error)
            console.error('Error details:', JSON.stringify(error, null, 2))
            toast.error('Error al cargar los expedientes')
            setExpedientes([])
            setTotalPages(1)
            setTotalExpedientes(0)
            setStats({ total: 0, dentro: 0, fuera: 0 })
        } finally {
            setLoading(false)
        }
    }, [toast])

    useEffect(() => {
        clearSearch() // Usar la función actualizada para cargar datos iniciales
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Array vacío para ejecutar solo una vez

    const clearSearch = async () => {
        setSearchValue('')
        setSearchQuery('')
        setGradoFilter('')
        setSituacionFilter('')
        setEstadoFilter('')
        setFechaInicioFilter('')
        setFechaFinFilter('')
        setCurrentPage(1) // Reset to first page
        
        const params: ExpedienteSearchParams = {
            page: 1,
            limit: pageSize,
        }
        
        try {
            setLoading(true)
            const response = await searchExpedientes(params)
            
            if (response.success && response.data) {
                const responseData = response.data as any
                let expedientesArray: Expediente[] = []
                
                if (responseData.expedientes && Array.isArray(responseData.expedientes)) {
                    expedientesArray = responseData.expedientes
                } else if (responseData.expedientes === null) {
                    expedientesArray = []
                }
                
                setExpedientes(expedientesArray)
                setTotalPages(responseData.total_pages || 1)
                setTotalExpedientes(responseData.total || expedientesArray.length)
                setCurrentPage(1)
                
                // Update stats for all results
                setStats({
                    total: expedientesArray.length,
                    dentro: expedientesArray.filter(e => e.estado === 'dentro').length,
                    fuera: expedientesArray.filter(e => e.estado === 'fuera').length
                })
            }
        } catch (error) {
            console.error('Error clearing search:', error)
            toast.error('Error al limpiar búsqueda')
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        setSearchQuery(searchValue)
        setCurrentPage(1) // Reset to first page when searching
        
        // Use backend search with global search parameter
        const params: ExpedienteSearchParams = {
            page: 1,
            limit: pageSize,
            search: searchValue.trim() || undefined,
            grado: gradoFilter || undefined,
            situacion_militar: situacionFilter || undefined,
            estado: estadoFilter || undefined,
            fecha_inicio: fechaInicioFilter || undefined,
            fecha_fin: fechaFinFilter || undefined,
        }
        
        try {
            setLoading(true)
            const response = await searchExpedientes(params)
            
            if (response.success && response.data) {
                const responseData = response.data as any
                let expedientesArray: Expediente[] = []
                
                if (responseData.expedientes && Array.isArray(responseData.expedientes)) {
                    expedientesArray = responseData.expedientes
                } else if (responseData.expedientes === null) {
                    expedientesArray = []
                }
                
                setExpedientes(expedientesArray)
                setTotalPages(responseData.total_pages || 1)
                setTotalExpedientes(responseData.total || expedientesArray.length)
                setCurrentPage(1)
                
                // Update search-specific stats
                setStats({
                    total: expedientesArray.length,
                    dentro: expedientesArray.filter(e => e.estado === 'dentro').length,
                    fuera: expedientesArray.filter(e => e.estado === 'fuera').length
                })
            }
        } catch (error) {
            console.error('Error searching expedientes:', error)
            toast.error('Error al buscar los expedientes')
        } finally {
            setLoading(false)
        }
    }

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            // Include search query if present
            const params: ExpedienteSearchParams = {
                page,
                limit: pageSize,
                search: searchQuery.trim() || undefined,
                grado: gradoFilter || undefined,
                situacion_militar: situacionFilter || undefined,
                estado: estadoFilter || undefined,
                fecha_inicio: fechaInicioFilter || undefined,
                fecha_fin: fechaFinFilter || undefined,
            }
            
            if (searchQuery.trim() || gradoFilter || situacionFilter || estadoFilter || fechaInicioFilter || fechaFinFilter) {
                // Use search API
                searchExpedientes(params).then(response => {
                    if (response.success && response.data) {
                        const responseData = response.data as any
                        let expedientesArray: Expediente[] = []
                        
                        if (responseData.expedientes && Array.isArray(responseData.expedientes)) {
                            expedientesArray = responseData.expedientes
                        } else if (responseData.expedientes === null) {
                            expedientesArray = []
                        }
                        
                        setExpedientes(expedientesArray)
                        setTotalPages(responseData.total_pages || 1)
                        setTotalExpedientes(responseData.total || expedientesArray.length)
                        setCurrentPage(page)
                    }
                }).catch(error => {
                    console.error('Error changing page:', error)
                    toast.error('Error al cambiar de página')
                })
            } else {
                // Use basic fetch
                fetchExpedientes(page, {})
            }
        }
    }

    const handleFilterChange = async () => {
        setCurrentPage(1) // Reset to first page when filtering
        
        const params: ExpedienteSearchParams = {
            page: 1,
            limit: pageSize,
            search: searchQuery.trim() || undefined,
            grado: gradoFilter || undefined,
            situacion_militar: situacionFilter || undefined,
            estado: estadoFilter || undefined,
            fecha_inicio: fechaInicioFilter || undefined,
            fecha_fin: fechaFinFilter || undefined,
        }
        
        try {
            setLoading(true)
            const response = await searchExpedientes(params)
            
            if (response.success && response.data) {
                const responseData = response.data as any
                let expedientesArray: Expediente[] = []
                
                if (responseData.expedientes && Array.isArray(responseData.expedientes)) {
                    expedientesArray = responseData.expedientes
                } else if (responseData.expedientes === null) {
                    expedientesArray = []
                }
                
                setExpedientes(expedientesArray)
                setTotalPages(responseData.total_pages || 1)
                setTotalExpedientes(responseData.total || expedientesArray.length)
                setCurrentPage(1)
                
                // Update stats for filtered results
                setStats({
                    total: expedientesArray.length,
                    dentro: expedientesArray.filter(e => e.estado === 'dentro').length,
                    fuera: expedientesArray.filter(e => e.estado === 'fuera').length
                })
            }
        } catch (error) {
            console.error('Error filtering expedientes:', error)
            toast.error('Error al aplicar filtros')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateExpediente = () => {
        setSelectedExpediente(null)
        setIsFormOpen(true)
    }

    const handleImportExpedientes = () => {
        setIsImportOpen(true)
    }

    const handleRefreshTable = () => {
        fetchExpedientes(currentPage, {
            grado: gradoFilter || undefined,
            situacion: situacionFilter || undefined,
            estado: estadoFilter || undefined
        })
    }

    const handleImportComplete = () => {
        setIsImportOpen(false)
        fetchExpedientes(1, {
            grado: gradoFilter || undefined,
            situacion: situacionFilter || undefined,
            estado: estadoFilter || undefined
        })
    }

    const handleEditExpediente = (expediente: Expediente) => {
        setSelectedExpediente(expediente)
        setIsFormOpen(true)
    }

    const handleFormSubmit = async (data: CreateExpedienteInput | UpdateExpedienteInput) => {
        try {
            if (selectedExpediente) {
                // Actualizar expediente
                await updateExpediente(selectedExpediente.id, data as UpdateExpedienteInput)
                toast.success('Expediente actualizado exitosamente')
            } else {
                // Crear expediente
                await createExpediente(data as CreateExpedienteInput)
                toast.success('Expediente creado exitosamente')
            }

            setIsFormOpen(false)
            fetchExpedientes(currentPage, {
                grado: gradoFilter || undefined,
                situacion: situacionFilter || undefined,
                estado: estadoFilter || undefined
            })
            // Actualizar estadísticas después de crear/actualizar
            fetchStats()
        } catch (error: any) {
            console.error('Error saving expediente:', error)
            toast.error(error.message || 'Error al guardar el expediente')
        }
    }

    const handleDeleteExpediente = async () => {
        if (!expedienteToDelete) return

        try {
            await deleteExpediente(expedienteToDelete.id)
            setIsDeleteDialogOpen(false)
            setExpedienteToDelete(null)
            toast.success('Expediente eliminado exitosamente')

            // Refrescar la lista
            const newPage = expedientes.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage
            fetchExpedientes(newPage, {
                grado: gradoFilter || undefined,
                situacion: situacionFilter || undefined,
                estado: estadoFilter || undefined
            })
            // Actualizar estadísticas después de eliminar
            fetchStats()
        } catch (error: any) {
            console.error('Error deleting expediente:', error)
            toast.error(error.message || 'Error al eliminar el expediente')
        }
    }

    // Funciones para selección múltiple
    const handleSelectExpediente = (id: string) => {
        setSelectedExpedientes(prev =>
            prev.includes(id) ? prev.filter(expId => expId !== id) : [...prev, id]
        )
    }

    const toggleSelectAll = () => {
        if (selectedExpedientes.length === expedientes.length && expedientes.length > 0) {
            setSelectedExpedientes([])
        } else {
            setSelectedExpedientes(expedientes.map(exp => exp.id))
        }
    }

    const handleDeleteClick = (expediente?: Expediente) => {
        if (expediente) {
            setExpedienteToDelete(expediente)
            setIsDeleteDialogOpen(true)
        } else if (selectedExpedientes.length > 0) {
            setExpedienteToDelete(null)
            setIsDeleteDialogOpen(true)
        } else {
            toast.warning('Seleccione al menos un expediente')
        }
    }

    const handleDeleteMultiple = async () => {
        try {
            await Promise.all(selectedExpedientes.map(id => deleteExpediente(id)))
            setIsDeleteDialogOpen(false)
            setSelectedExpedientes([])
            toast.success(`${selectedExpedientes.length} expediente(s) eliminado(s) exitosamente`)

            // Refrescar la lista
            const newPage = expedientes.length === selectedExpedientes.length && currentPage > 1 ? currentPage - 1 : currentPage
            fetchExpedientes(newPage, {
                grado: gradoFilter || undefined,
                situacion: situacionFilter || undefined,
                estado: estadoFilter || undefined
            })
            // Actualizar estadísticas después de eliminar múltiples
            fetchStats()
        } catch (error: any) {
            console.error('Error deleting expedientes:', error)
            toast.error(error.message || 'Error al eliminar los expedientes')
        }
    }

    const gradoOptions: Grado[] = ['GRAL', 'CRL', 'TTE CRL', 'MY', 'CAP', 'TTE', 'STTE', 'TCO', 'SSOO', 'EC', 'TROPA']
    const situacionOptions: SituacionMilitar[] = ['Actividad', 'Retiro']
    const estadoOptions: ExpedienteEstado[] = ['dentro', 'fuera']

    // Función para obtener todos los expedientes para la visualización de estantes
    const getAllExpedientesForEstantes = async (): Promise<Expediente[]> => {
        try {
            let allExpedientes: Expediente[] = []
            let currentPage = 1
            const pageSize = 1000 // Usar páginas más grandes
            let hasMoreData = true

            console.log('Iniciando carga de todos los expedientes...')

            while (hasMoreData) {
                const params: ExpedienteSearchParams = {
                    page: currentPage,
                    limit: pageSize,
                }
                
                console.log(`Cargando página ${currentPage}...`)
                const response = await searchExpedientes(params)
                
                if (response.success && response.data) {
                    const responseData = response.data as any
                    if (responseData.expedientes && Array.isArray(responseData.expedientes)) {
                        allExpedientes = [...allExpedientes, ...responseData.expedientes]
                        console.log(`Página ${currentPage}: ${responseData.expedientes.length} expedientes. Total acumulado: ${allExpedientes.length}`)
                        
                        // Si esta página tiene menos expedientes que el límite, ya no hay más datos
                        if (responseData.expedientes.length < pageSize) {
                            hasMoreData = false
                        } else {
                            currentPage++
                        }
                    } else {
                        hasMoreData = false
                    }
                } else {
                    hasMoreData = false
                }
            }

            console.log(`Carga completada. Total de expedientes: ${allExpedientes.length}`)
            return allExpedientes
        } catch (error) {
            console.error('Error fetching all expedientes:', error)
            return []
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-100 rounded-lg">
                    <UsersIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Gestión de Expedientes</h2>
                </div>
                <p className="text-xs text-gray-600 ml-8">
                    Administra los expedientes registrados en elsistema
                </p>
            </div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Expedientes</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <FileText className="h-12 w-12 text-indigo-600" />
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Dentro</p>
                            <p className="text-3xl font-bold text-green-600">{stats.dentro}</p>
                        </div>
                        <CheckCircle2 className="h-12 w-12 text-green-600" />
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Fuera</p>
                            <p className="text-3xl font-bold text-gray-400">{stats.fuera}</p>
                        </div>
                        <XCircle className="h-12 w-12 text-gray-400" />
                    </div>
                </Card>
            </div>

            {/* Header */}
            {!isFormOpen && !isImportOpen && (
                <Card className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Expedientes</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Gestión de expedientes militares
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                Filtros
                            </Button>
                            {selectedExpedientes.length > 0 && (
                                <Button
                                    variant="outline"
                                    onClick={() => handleDeleteClick()}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Eliminar ({selectedExpedientes.length})
                                </Button>
                            )}
                            <Button
                                onClick={handleImportExpedientes}
                                variant="outline"
                                className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Importar Excel
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
                            {isAdmin && (
                                <Button
                                    onClick={async () => {
                                        try {
                                            setLoading(true)
                                            await exportExpedientes()
                                            toast.success('Exportación iniciada, archivo descargado')
                                        } catch (error: any) {
                                            console.error('Error exporting expedientes:', error)
                                            toast.error(error.message || 'Error al exportar expedientes')
                                        } finally {
                                            setLoading(false)
                                        }
                                    }}
                                    variant="outline"
                                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Exportar Excel
                                </Button>
                            )}
                            <Button
                                onClick={() => setIsEstantesOpen(true)}
                                variant="outline"
                                className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                            >
                                <Archive className="h-4 w-4 mr-2" />
                                Ver Estantes
                            </Button>
                            <Button
                                onClick={handleCreateExpediente}
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Nuevo Expediente
                            </Button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mt-4 flex gap-2">
                        <div className="flex-1 relative">
                            <Input
                                type="text"
                                placeholder="Buscar por apellidos/nombres o CIP..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                            />
                            {searchValue && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <XIcon className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <Button onClick={handleSearch}>
                            <Search className="h-4 w-4 mr-2" />
                            Buscar
                        </Button>
                    </div>

                    {/* Filters */}
                    {showFilters && (
                        <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                            {/* Primera fila de filtros */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Grado
                                    </label>
                                    <select
                                        value={gradoFilter}
                                        onChange={(e) => {
                                            setGradoFilter(e.target.value as Grado | '')
                                            handleFilterChange()
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="">Todos</option>
                                        {gradoOptions.map(grado => (
                                            <option key={grado} value={grado}>
                                                {GradoLabels[grado]}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Situación Militar
                                    </label>
                                    <select
                                        value={situacionFilter}
                                        onChange={(e) => {
                                            setSituacionFilter(e.target.value as SituacionMilitar | '')
                                            handleFilterChange()
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="">Todas</option>
                                        {situacionOptions.map(situacion => (
                                            <option key={situacion} value={situacion}>
                                                {SituacionMilitarLabels[situacion]}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Estado
                                    </label>
                                    <select
                                        value={estadoFilter}
                                        onChange={(e) => {
                                            setEstadoFilter(e.target.value as ExpedienteEstado | '')
                                            handleFilterChange()
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="">Todos</option>
                                        {estadoOptions.map(estado => (
                                            <option key={estado} value={estado}>
                                                {EstadoExpedienteLabels[estado]}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-end">
                                    <Button
                                        variant="outline"
                                        onClick={clearSearch}
                                        className="w-full"
                                    >
                                        Limpiar Filtros
                                    </Button>
                                </div>
                            </div>

                            {/* Segunda fila - Filtros de fecha */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fecha Inicio
                                    </label>
                                    <Input
                                        type="date"
                                        value={fechaInicioFilter}
                                        onChange={(e) => {
                                            setFechaInicioFilter(e.target.value)
                                            // Validación: si hay fecha fin, asegurar que inicio <= fin
                                            if (fechaFinFilter && e.target.value > fechaFinFilter) {
                                                setFechaFinFilter('')
                                            }
                                            handleFilterChange()
                                        }}
                                        className="w-full"
                                        placeholder="Seleccionar fecha de inicio"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fecha Fin
                                    </label>
                                    <Input
                                        type="date"
                                        value={fechaFinFilter}
                                        onChange={(e) => {
                                            setFechaFinFilter(e.target.value)
                                            handleFilterChange()
                                        }}
                                        min={fechaInicioFilter || undefined}
                                        className="w-full"
                                        placeholder="Seleccionar fecha de fin"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </Card>
            )}

            {/* Form */}
            {isFormOpen && (
                <Card className="p-6">
                    <ExpedienteForm
                        expediente={selectedExpediente || undefined}
                        onSubmit={handleFormSubmit}
                        onCancel={() => setIsFormOpen(false)}
                    />
                </Card>
            )}

            {/* Import */}
            {isImportOpen && (
                <ExpedientesImport
                    onImportComplete={handleImportComplete}
                    onCancel={() => setIsImportOpen(false)}
                />
            )}

            {/* Table */}
            {!isFormOpen && !isImportOpen && (
                <>
                    {loading ? (
                        <Card className="p-8">
                            <div className="text-center">
                                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                                <p className="mt-2 text-gray-500">Cargando expedientes...</p>
                            </div>
                        </Card>
                    ) : (
                        <Card className="overflow-hidden">
                            <ExpedientesTable
                                expedientes={expedientes}
                                selectedExpedientes={selectedExpedientes}
                                onSelectExpediente={handleSelectExpediente}
                                onSelectAll={toggleSelectAll}
                                onEdit={handleEditExpediente}
                                onDelete={handleDeleteClick}
                            />
                        </Card>
                    )}

                    {/* Pagination */}
                    {!loading && totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    )}
                </>
            )}

            {/* Delete Dialog */}
            <DeleteDialog
                isOpen={isDeleteDialogOpen}
                expedienteToDelete={expedienteToDelete}
                selectedCount={selectedExpedientes.length}
                onConfirm={expedienteToDelete ? handleDeleteExpediente : handleDeleteMultiple}
                onCancel={() => {
                    setIsDeleteDialogOpen(false)
                    setExpedienteToDelete(null)
                }}
            />

            {/* Estantes Visualization */}
            {isEstantesOpen && (
                <EstantesVisualization
                    onClose={() => setIsEstantesOpen(false)}
                />
            )}
        </div>
    )
}
