'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Expediente } from '@/lib/types'
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
  Loader2, 
  Search, 
  X as XIcon, 
  Edit,
  Trash2,
  AlertTriangle,
  Save,
  FileText,
  FolderOpen
} from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'
import { ExpedientesTableExample } from './ExpedientesTableExample'

// Schema de validación
const expedienteSchema = z.object({
  numero_expediente: z.string().min(1, 'El número de expediente es requerido'),
  titulo: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  descripcion: z.string().optional(),
  estado: z.enum(['Activo', 'Archivado', 'En proceso', 'Cerrado']),
  fecha_inicio: z.string().min(1, 'La fecha de inicio es requerida'),
  fecha_fin: z.string().optional(),
  juzgado: z.string().optional(),
  tipo_proceso: z.string().optional(),
  partes: z.string().optional(),
})

type ExpedienteFormData = z.infer<typeof expedienteSchema>

export function ExpedientesManagement() {
  const [expedientes, setExpedientes] = useState<Expediente[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedExpediente, setSelectedExpediente] = useState<Expediente | null>(null)
  const [expedienteToDelete, setExpedienteToDelete] = useState<Expediente | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchValue, setSearchValue] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalExpedientes, setTotalExpedientes] = useState(0)
  const pageSize = 10
  const toast = useToast()

  const {
    register,
    handleSubmit: handleFormSubmitWrapper,
    reset,
    setValue,
    formState: { errors, isSubmitting, isValid },
    watch,
  } = useForm<ExpedienteFormData>({
    resolver: zodResolver(expedienteSchema),
    mode: 'onChange',
  })

  useEffect(() => {
    // Simulación: no hay datos de la API
    setLoading(false)
    setExpedientes([])
  }, [])

  useEffect(() => {
    if (selectedExpediente) {
      reset({
        numero_expediente: selectedExpediente.numero_expediente,
        titulo: selectedExpediente.titulo,
        descripcion: selectedExpediente.descripcion || '',
        estado: selectedExpediente.estado,
        fecha_inicio: selectedExpediente.fecha_inicio.split('T')[0],
        fecha_fin: selectedExpediente.fecha_fin ? selectedExpediente.fecha_fin.split('T')[0] : '',
        juzgado: selectedExpediente.juzgado || '',
        tipo_proceso: selectedExpediente.tipo_proceso || '',
        partes: selectedExpediente.partes || '',
      })
    } else {
      reset({ 
        numero_expediente: '', 
        titulo: '', 
        descripcion: '', 
        estado: 'Activo',
        fecha_inicio: '',
        fecha_fin: '',
        juzgado: '',
        tipo_proceso: '',
        partes: '',
      })
    }
  }, [selectedExpediente, reset, isFormOpen])

  const handleSearch = () => {
    setSearchQuery(searchValue)
    setCurrentPage(1)
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
  }

  const handleCreateExpediente = () => {
    setSelectedExpediente(null)
    setIsFormOpen(true)
  }

  const handleEditExpediente = (expediente: Expediente) => {
    setSelectedExpediente(expediente)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (expediente: Expediente) => {
    setExpedienteToDelete(expediente)
    setIsDeleteDialogOpen(true)
  }

  const handleFormSubmit = async (data: ExpedienteFormData) => {
    try {
      if (selectedExpediente) {
        toast.success('Expediente actualizado exitosamente')
      } else {
        toast.success('Expediente creado exitosamente')
      }
      
      setIsFormOpen(false)
      setSelectedExpediente(null)
      reset()
    } catch (error: any) {
      console.error('Error saving expediente:', error)
      toast.error(error.message || 'Error al guardar el expediente')
    }
  }

  const handleConfirmDelete = async () => {
    if (!expedienteToDelete) return

    try {
      toast.success('Expediente eliminado exitosamente')
      setIsDeleteDialogOpen(false)
      setExpedienteToDelete(null)
    } catch (error: any) {
      console.error('Error deleting expediente:', error)
      toast.error(error.message || 'Error al eliminar el expediente')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1 bg-indigo-100 rounded-lg">
            <FolderOpen className="h-4 w-4 text-indigo-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Gestión de Expedientes</h2>
        </div>
        <p className="text-xs text-gray-600 ml-8">
          Administra los expedientes judiciales del sistema
        </p>
      </div>

      {/* Stats */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardContent className="py-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Total de Expedientes</p>
              <p className="text-xl font-bold text-indigo-600">{totalExpedientes}</p>
            </div>
            <div className="p-1.5 bg-indigo-100 rounded-full">
              <FileText className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions Bar */}
      {expedientes.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              placeholder="Buscar por número, título o juzgado..."
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
            onClick={handleCreateExpediente}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Expediente
          </Button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-600">Cargando expedientes...</p>
          </CardContent>
        </Card>
      ) : expedientes.length === 0 ? (
        <>
          {/* Mensaje de ejemplo */}
          <Card className="mb-4 bg-blue-50 border-blue-200">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <FolderOpen className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">Mostrando datos de ejemplo</p>
                  <p className="text-xs text-blue-700">No se pudo conectar con la API. Aquí hay algunos expedientes simulados.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Tabla de ejemplo */}
          <Card>
            <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Lista de Expedientes (Ejemplo)</CardTitle>
              <div className="flex items-center gap-3">
                <div id="expedientes-selection-bar"></div>
                <Button 
                  onClick={handleCreateExpediente}
                  className="bg-indigo-600 hover:bg-indigo-700 h-7"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Expediente
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ExpedientesTableExample onEditExpediente={handleEditExpediente} />
            </CardContent>
          </Card>
        </>
      ) : null}

      {/* Expediente Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(open) => {
        // No hacer nada cuando intenta cerrar desde afuera
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {selectedExpediente ? 'Editar Expediente' : 'Crear Nuevo Expediente'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmitWrapper(handleFormSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Número de Expediente */}
              <div className="relative">
                <Input 
                  {...register('numero_expediente')} 
                  placeholder=" " 
                  className="peer"
                />
                <label className="absolute left-2 -top-2.5 bg-white px-1 text-xs font-medium text-gray-600 transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-600">
                  Número de Expediente <span className="text-red-500">*</span>
                </label>
                {errors.numero_expediente && (
                  <p className="text-sm text-red-500 mt-1">{errors.numero_expediente.message}</p>
                )}
              </div>

              {/* Título */}
              <div className="relative">
                <Input 
                  {...register('titulo')} 
                  placeholder=" " 
                  className="peer"
                />
                <label className="absolute left-2 -top-2.5 bg-white px-1 text-xs font-medium text-gray-600 transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-600">
                  Título <span className="text-red-500">*</span>
                </label>
                {errors.titulo && (
                  <p className="text-sm text-red-500 mt-1">{errors.titulo.message}</p>
                )}
              </div>

              {/* Estado */}
              <div>
                <select 
                  {...register('estado')} 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Activo">Activo</option>
                  <option value="En proceso">En proceso</option>
                  <option value="Archivado">Archivado</option>
                  <option value="Cerrado">Cerrado</option>
                </select>
                {errors.estado && (
                  <p className="text-sm text-red-500 mt-1">{errors.estado.message}</p>
                )}
              </div>

              {/* Fecha Inicio */}
              <div className="relative">
                <Input 
                  {...register('fecha_inicio')} 
                  type="date"
                  placeholder=" " 
                  className="peer"
                />
                <label className="absolute left-2 -top-2.5 bg-white px-1 text-xs font-medium text-gray-600">
                  Fecha de Inicio <span className="text-red-500">*</span>
                </label>
                {errors.fecha_inicio && (
                  <p className="text-sm text-red-500 mt-1">{errors.fecha_inicio.message}</p>
                )}
              </div>

              {/* Fecha Fin */}
              <div className="relative">
                <Input 
                  {...register('fecha_fin')} 
                  type="date"
                  placeholder=" " 
                  className="peer"
                />
                <label className="absolute left-2 -top-2.5 bg-white px-1 text-xs font-medium text-gray-600">
                  Fecha de Fin
                </label>
                {errors.fecha_fin && (
                  <p className="text-sm text-red-500 mt-1">{errors.fecha_fin.message}</p>
                )}
              </div>

              {/* Juzgado */}
              <div className="relative">
                <Input 
                  {...register('juzgado')} 
                  placeholder=" " 
                  className="peer"
                />
                <label className="absolute left-2 -top-2.5 bg-white px-1 text-xs font-medium text-gray-600 transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-600">
                  Juzgado
                </label>
                {errors.juzgado && (
                  <p className="text-sm text-red-500 mt-1">{errors.juzgado.message}</p>
                )}
              </div>

              {/* Tipo de Proceso */}
              <div className="relative">
                <Input 
                  {...register('tipo_proceso')} 
                  placeholder=" " 
                  className="peer"
                />
                <label className="absolute left-2 -top-2.5 bg-white px-1 text-xs font-medium text-gray-600 transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-600">
                  Tipo de Proceso
                </label>
                {errors.tipo_proceso && (
                  <p className="text-sm text-red-500 mt-1">{errors.tipo_proceso.message}</p>
                )}
              </div>

              {/* Partes */}
              <div className="relative md:col-span-2">
                <Input 
                  {...register('partes')} 
                  placeholder=" " 
                  className="peer"
                />
                <label className="absolute left-2 -top-2.5 bg-white px-1 text-xs font-medium text-gray-600 transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-600">
                  Partes
                </label>
                {errors.partes && (
                  <p className="text-sm text-red-500 mt-1">{errors.partes.message}</p>
                )}
              </div>

              {/* Descripción */}
              <div className="relative md:col-span-2">
                <textarea 
                  {...register('descripcion')} 
                  placeholder=" " 
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 peer"
                />
                <label className="absolute left-2 -top-2.5 bg-white px-1 text-xs font-medium text-gray-600 transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-600">
                  Descripción
                </label>
                {errors.descripcion && (
                  <p className="text-sm text-red-500 mt-1">{errors.descripcion.message}</p>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsFormOpen(false)
                  setSelectedExpediente(null)
                  reset()
                }}
                className="gap-2"
              >
                <XIcon className="h-4 w-4" />
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !isValid} 
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : selectedExpediente ? (
                  <>
                    <Save className="h-4 w-4" />
                    Actualizar
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
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
              <DialogTitle>¿Eliminar expediente?</DialogTitle>
            </div>
            <DialogDescription>
              {expedienteToDelete && (
                <span>
                  ¿Estás seguro de que deseas eliminar el expediente <strong>"{expedienteToDelete.numero_expediente} - {expedienteToDelete.titulo}"</strong>? Esta acción no se puede deshacer.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setExpedienteToDelete(null)
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
