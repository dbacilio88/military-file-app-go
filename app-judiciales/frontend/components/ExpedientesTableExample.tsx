'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Expediente } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { FolderOpen, Edit, Trash2, Trash, XIcon, Eye, ChevronLeft, ChevronRight, Calendar, Gavel, FileText, Users } from 'lucide-react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from '@/components/ui/dialog'

interface ExpedientesTableExampleProps {
  onEditExpediente: (expediente: Expediente) => void
}

export function ExpedientesTableExample({ onEditExpediente }: ExpedientesTableExampleProps) {
  const [expedientesSimulados, setExpedientesSimulados] = useState<Expediente[]>([
    {
      id: '1',
      numero_expediente: 'EXP-2024-001',
      titulo: 'Demanda Laboral - Indemnización',
      descripcion: 'Demanda por despido injustificado y pago de prestaciones sociales',
      estado: 'En proceso',
      fecha_inicio: '2024-01-15T00:00:00Z',
      juzgado: 'Juzgado Laboral N° 5',
      tipo_proceso: 'Laboral',
      partes: 'Juan Pérez vs. Empresa XYZ S.A.',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      numero_expediente: 'EXP-2024-002',
      titulo: 'Divorcio Contencioso',
      descripcion: 'Proceso de divorcio con liquidación de bienes',
      estado: 'Activo',
      fecha_inicio: '2024-02-20T00:00:00Z',
      juzgado: 'Juzgado de Familia N° 3',
      tipo_proceso: 'Familia',
      partes: 'María García vs. Carlos López',
      created_at: '2024-02-20T09:15:00Z',
      updated_at: '2024-02-20T09:15:00Z'
    },
    {
      id: '3',
      numero_expediente: 'EXP-2024-003',
      titulo: 'Cobro Ejecutivo',
      descripcion: 'Cobro de deuda por incumplimiento de contrato',
      estado: 'Activo',
      fecha_inicio: '2024-03-10T00:00:00Z',
      fecha_fin: '2024-08-15T00:00:00Z',
      juzgado: 'Juzgado Civil N° 12',
      tipo_proceso: 'Civil',
      partes: 'Banco ABC vs. Roberto Martínez',
      created_at: '2024-03-10T13:25:00Z',
      updated_at: '2024-08-15T16:20:00Z'
    },
    {
      id: '4',
      numero_expediente: 'EXP-2024-004',
      titulo: 'Proceso Penal - Estafa',
      descripcion: 'Investigación por presunto delito de estafa agravada',
      estado: 'En proceso',
      fecha_inicio: '2024-04-05T00:00:00Z',
      juzgado: 'Juzgado Penal N° 8',
      tipo_proceso: 'Penal',
      partes: 'Fiscalía vs. Diego Ramírez',
      created_at: '2024-04-05T08:00:00Z',
      updated_at: '2024-04-05T08:00:00Z'
    },
    {
      id: '5',
      numero_expediente: 'EXP-2023-089',
      titulo: 'Acción de Tutela',
      descripcion: 'Protección de derechos fundamentales en salud',
      estado: 'Cerrado',
      fecha_inicio: '2023-11-12T00:00:00Z',
      fecha_fin: '2024-01-20T00:00:00Z',
      juzgado: 'Juzgado Administrativo N° 2',
      tipo_proceso: 'Constitucional',
      partes: 'Ana Rodríguez vs. EPS Salud Total',
      created_at: '2023-11-12T10:45:00Z',
      updated_at: '2024-01-20T14:30:00Z'
    },
    {
      id: '6',
      numero_expediente: 'EXP-2024-005',
      titulo: 'Nulidad de Contrato',
      descripcion: 'Solicitud de nulidad por vicios en el consentimiento',
      estado: 'Activo',
      fecha_inicio: '2024-06-01T00:00:00Z',
      juzgado: 'Juzgado Civil N° 7',
      tipo_proceso: 'Civil',
      partes: 'Laura Torres vs. Constructora Del Valle',
      created_at: '2024-06-01T11:00:00Z',
      updated_at: '2024-06-01T11:00:00Z'
    },
    {
      id: '7',
      numero_expediente: 'EXP-2024-006',
      titulo: 'Custodia de Menores',
      descripcion: 'Modificación de régimen de custodia y visitas',
      estado: 'En proceso',
      fecha_inicio: '2024-06-10T00:00:00Z',
      juzgado: 'Juzgado de Familia N° 1',
      tipo_proceso: 'Familia',
      partes: 'Diego Morales vs. Sofía Ruiz',
      created_at: '2024-06-10T12:00:00Z',
      updated_at: '2024-06-10T12:00:00Z'
    },
    {
      id: '8',
      numero_expediente: 'EXP-2024-007',
      titulo: 'Daños y Perjuicios',
      descripcion: 'Indemnización por accidente de tránsito',
      estado: 'Activo',
      fecha_inicio: '2024-06-15T00:00:00Z',
      juzgado: 'Juzgado Civil N° 15',
      tipo_proceso: 'Civil',
      partes: 'Pedro Castro vs. Aseguradora Nacional',
      created_at: '2024-06-15T13:00:00Z',
      updated_at: '2024-06-15T13:00:00Z'
    },
    {
      id: '9',
      numero_expediente: 'EXP-2024-008',
      titulo: 'Sucesión Intestada',
      descripcion: 'Proceso sucesorio sin testamento',
      estado: 'Activo',
      fecha_inicio: '2024-07-01T00:00:00Z',
      juzgado: 'Juzgado Civil N° 20',
      tipo_proceso: 'Civil',
      partes: 'Herederos de Valentina Silva',
      created_at: '2024-07-01T14:00:00Z',
      updated_at: '2024-07-01T14:00:00Z'
    },
    {
      id: '10',
      numero_expediente: 'EXP-2024-009',
      titulo: 'Reivindicación de Propiedad',
      descripcion: 'Recuperación de bien inmueble',
      estado: 'En proceso',
      fecha_inicio: '2024-07-10T00:00:00Z',
      juzgado: 'Juzgado Civil N° 9',
      tipo_proceso: 'Civil',
      partes: 'Ricardo Herrera vs. Inmobiliaria Progreso',
      created_at: '2024-07-10T15:00:00Z',
      updated_at: '2024-07-10T15:00:00Z'
    },
    {
      id: '11',
      numero_expediente: 'EXP-2023-145',
      titulo: 'Proceso Ejecutivo',
      descripcion: 'Cobro de obligación hipotecaria',
      estado: 'Archivado',
      fecha_inicio: '2023-08-15T00:00:00Z',
      fecha_fin: '2024-05-20T00:00:00Z',
      juzgado: 'Juzgado Civil N° 18',
      tipo_proceso: 'Civil',
      partes: 'Banco Internacional vs. Camila Vargas',
      created_at: '2023-08-15T16:00:00Z',
      updated_at: '2024-05-20T10:15:00Z'
    },
    {
      id: '12',
      numero_expediente: 'EXP-2024-010',
      titulo: 'Desalojo por Falta de Pago',
      descripcion: 'Proceso de desalojo por mora en arrendamiento',
      estado: 'Activo',
      fecha_inicio: '2024-08-01T00:00:00Z',
      juzgado: 'Juzgado Civil N° 4',
      tipo_proceso: 'Civil',
      partes: 'Fernando Ortiz vs. Gabriela Méndez',
      created_at: '2024-08-01T17:00:00Z',
      updated_at: '2024-08-01T17:00:00Z'
    },
    {
      id: '13',
      numero_expediente: 'EXP-2024-011',
      titulo: 'Lesiones Personales',
      descripcion: 'Proceso penal por lesiones graves',
      estado: 'En proceso',
      fecha_inicio: '2024-08-10T00:00:00Z',
      juzgado: 'Juzgado Penal N° 3',
      tipo_proceso: 'Penal',
      partes: 'Fiscalía vs. Javier Ramos',
      created_at: '2024-08-10T18:00:00Z',
      updated_at: '2024-08-10T18:00:00Z'
    },
    {
      id: '14',
      numero_expediente: 'EXP-2024-012',
      titulo: 'Alimentos para Menores',
      descripcion: 'Fijación de cuota alimentaria',
      estado: 'Activo',
      fecha_inicio: '2024-08-15T00:00:00Z',
      juzgado: 'Juzgado de Familia N° 6',
      tipo_proceso: 'Familia',
      partes: 'Patricia Soto vs. Andrés Villegas',
      created_at: '2024-08-15T19:00:00Z',
      updated_at: '2024-08-15T19:00:00Z'
    },
    {
      id: '15',
      numero_expediente: 'EXP-2023-234',
      titulo: 'Responsabilidad Médica',
      descripcion: 'Demanda por mala praxis médica',
      estado: 'Cerrado',
      fecha_inicio: '2023-09-01T00:00:00Z',
      fecha_fin: '2024-06-30T00:00:00Z',
      juzgado: 'Juzgado Civil N° 22',
      tipo_proceso: 'Civil',
      partes: 'Familia Moreno vs. Clínica San Rafael',
      created_at: '2023-09-01T20:00:00Z',
      updated_at: '2024-06-30T16:45:00Z'
    }
  ])

  const [selectedExpedientes, setSelectedExpedientes] = useState<string[]>([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [expedienteToDelete, setExpedienteToDelete] = useState<string | null>(null)
  const [viewExpediente, setViewExpediente] = useState<Expediente | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectionBarContainer, setSelectionBarContainer] = useState<HTMLElement | null>(null)

  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const totalPages = Math.ceil(expedientesSimulados.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentExpedientes = expedientesSimulados.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setSelectedExpedientes([]) // Limpiar selección al cambiar de página
  }

  useEffect(() => {
    const container = document.getElementById('expedientes-selection-bar')
    setSelectionBarContainer(container)
  }, [])

  const handleSelectExpediente = (id: string) => {
    setSelectedExpedientes(prev => 
      prev.includes(id) 
        ? prev.filter(uid => uid !== id)
        : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedExpedientes.length === currentExpedientes.length && currentExpedientes.length > 0) {
      // Deseleccionar todos los de la página actual
      const currentIds = currentExpedientes.map(exp => exp.id)
      setSelectedExpedientes(prev => prev.filter(id => !currentIds.includes(id)))
    } else {
      // Seleccionar todos los de la página actual
      const currentExpedienteIds = currentExpedientes.map(exp => exp.id)
      const uniqueIds = Array.from(new Set([...selectedExpedientes, ...currentExpedienteIds]))
      setSelectedExpedientes(uniqueIds)
    }
  }

  const handleDeleteClick = (id?: string) => {
    if (id) {
      setExpedienteToDelete(id)
    } else {
      setExpedienteToDelete(null)
    }
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (expedienteToDelete) {
      const expediente = expedientesSimulados.find(exp => exp.id === expedienteToDelete)
      setExpedientesSimulados(prev => prev.filter(exp => exp.id !== expedienteToDelete))
      console.log('Expediente eliminado:', expediente)
    } else {
      setExpedientesSimulados(prev => prev.filter(exp => !selectedExpedientes.includes(exp.id)))
      console.log('Expedientes eliminados:', selectedExpedientes)
      setSelectedExpedientes([])
    }
    setIsDeleteDialogOpen(false)
    setExpedienteToDelete(null)
  }

  const handleEditClick = (expediente: Expediente) => {
    onEditExpediente(expediente)
  }

  const handleViewClick = (expediente: Expediente) => {
    setViewExpediente(expediente)
    setIsViewDialogOpen(true)
  }

  const getExpedienteToDeleteInfo = () => {
    if (expedienteToDelete) {
      const expediente = expedientesSimulados.find(exp => exp.id === expedienteToDelete)
      return expediente
    }
    return null
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Activo':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'En proceso':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Archivado':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'Cerrado':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <>
      {selectionBarContainer && selectedExpedientes.length > 0 && createPortal(
        <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-200 rounded-md px-3 py-1">
          <span className="text-sm font-medium text-indigo-900">
            {selectedExpedientes.length} expediente(s) seleccionado(s)
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteClick()}
            className="h-7"
          >
            <Trash className="h-4 w-4 mr-1.5" />
            Eliminar
          </Button>
        </div>,
        selectionBarContainer
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-2 text-left">
                <input
                  type="checkbox"
                  checked={selectedExpedientes.length === currentExpedientes.length && currentExpedientes.length > 0}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0"
                />
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Número Expediente
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Título
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Juzgado
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Tipo
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Estado
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentExpedientes.map((expediente) => (
              <tr 
                key={expediente.id} 
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-3 py-2 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedExpedientes.includes(expediente.id)}
                    onChange={() => handleSelectExpediente(expediente.id)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0"
                  />
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="text-xs font-medium text-indigo-600">
                    {expediente.numero_expediente}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="text-xs font-medium text-gray-900 max-w-xs truncate">
                    {expediente.titulo}
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="text-xs text-gray-600">
                    {expediente.juzgado || '-'}
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="text-xs text-gray-600">
                    {expediente.tipo_proceso || '-'}
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getEstadoColor(expediente.estado)}`}>
                    {expediente.estado}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewClick(expediente)}
                      className="h-7 w-7 p-0 text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                      title="Ver detalles"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(expediente)}
                      className="h-7 w-7 p-0 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50"
                      title="Editar"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(expediente.id)}
                      className="h-7 w-7 p-0 text-red-600 hover:text-red-900 hover:bg-red-50"
                      title="Eliminar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {expedientesSimulados.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay expedientes para mostrar</p>
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Mostrando {startIndex + 1} a {Math.min(endIndex, expedientesSimulados.length)} de {expedientesSimulados.length} expedientes
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
      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => {}}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <DialogTitle>
                {expedienteToDelete ? '¿Eliminar expediente?' : `¿Eliminar ${selectedExpedientes.length} expedientes?`}
              </DialogTitle>
            </div>
            <DialogDescription>
              {expedienteToDelete ? (
                <span>
                  ¿Estás seguro de que deseas eliminar el expediente <strong>"{getExpedienteToDeleteInfo()?.numero_expediente}"</strong>? Esta acción no se puede deshacer.
                </span>
              ) : (
                <span>
                  ¿Estás seguro de que deseas eliminar los <strong>{selectedExpedientes.length} expedientes</strong> seleccionados? Esta acción no se puede deshacer.
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

      {/* Diálogo de Vista Detallada */}
      <Dialog open={isViewDialogOpen} onOpenChange={(open) => {}}>
        <DialogContent className="max-w-2xl" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-indigo-600" />
              Detalles del Expediente
            </DialogTitle>
          </DialogHeader>
          {viewExpediente && (
            <div className="space-y-4">
              {/* Header con número y estado */}
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <p className="text-sm text-gray-500">Número de Expediente</p>
                  <p className="text-lg font-bold text-indigo-600">{viewExpediente.numero_expediente}</p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getEstadoColor(viewExpediente.estado)}`}>
                  {viewExpediente.estado}
                </span>
              </div>

              {/* Título */}
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Título</p>
                <p className="text-base text-gray-900">{viewExpediente.titulo}</p>
              </div>

              {/* Descripción */}
              {viewExpediente.descripcion && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Descripción</p>
                  <p className="text-sm text-gray-700">{viewExpediente.descripcion}</p>
                </div>
              )}

              {/* Grid de información */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-2">
                  <Gavel className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Juzgado</p>
                    <p className="text-sm font-medium text-gray-900">{viewExpediente.juzgado || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Tipo de Proceso</p>
                    <p className="text-sm font-medium text-gray-900">{viewExpediente.tipo_proceso || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Fecha de Inicio</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(viewExpediente.fecha_inicio)}</p>
                  </div>
                </div>

                {viewExpediente.fecha_fin && (
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Fecha de Fin</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(viewExpediente.fecha_fin)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Partes */}
              {viewExpediente.partes && (
                <div className="flex items-start gap-2 pt-2">
                  <Users className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Partes Involucradas</p>
                    <p className="text-sm font-medium text-gray-900">{viewExpediente.partes}</p>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t text-xs text-gray-500">
                <div>
                  <p className="mb-1">Creado:</p>
                  <p className="font-medium text-gray-700">{formatDate(viewExpediente.created_at)}</p>
                </div>
                <div>
                  <p className="mb-1">Actualizado:</p>
                  <p className="font-medium text-gray-700">{formatDate(viewExpediente.updated_at)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsViewDialogOpen(false)
                setViewExpediente(null)
              }}
              className="gap-2"
            >
              <XIcon className="h-4 w-4" />
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
