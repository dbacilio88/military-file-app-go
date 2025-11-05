'use client'

import { Expediente, GradoLabels, SituacionMilitarLabels, EstadoExpedienteLabels } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, CheckCircle2, XCircle } from 'lucide-react'

interface ExpedientesTableProps {
    expedientes: Expediente[]
    selectedExpedientes: string[]
    onSelectExpediente: (id: string) => void
    onSelectAll: () => void
    onEdit: (expediente: Expediente) => void
    onDelete: (expediente: Expediente) => void
}

export function ExpedientesTable({
    expedientes,
    selectedExpedientes,
    onSelectExpediente,
    onSelectAll,
    onEdit,
    onDelete
}: ExpedientesTableProps) {
    const allSelected = expedientes.length > 0 && selectedExpedientes.length === expedientes.length

    const getGradoBadgeColor = (grado: string) => {
        switch (grado) {
            case 'GRAL': return 'bg-red-100 text-red-800'
            case 'CRL': return 'bg-red-100 text-red-800'
            case 'TTE CRL': return 'bg-orange-100 text-orange-800'
            case 'MY': return 'bg-yellow-100 text-yellow-800'
            case 'CAP': return 'bg-blue-100 text-blue-800'
            case 'TTE': return 'bg-blue-100 text-blue-800'
            case 'STTE': return 'bg-cyan-100 text-cyan-800'
            case 'TCO': return 'bg-purple-100 text-purple-800'
            case 'SSOO': return 'bg-indigo-100 text-indigo-800'
            case 'EC': return 'bg-green-100 text-green-800'
            case 'TROPA': return 'bg-gray-100 text-gray-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left">
                            <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={onSelectAll}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Orden
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Grado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Apellidos y Nombres
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            CIP
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Páginas
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Situación
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ubicación
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
                    {expedientes.length === 0 ? (
                        <tr>
                            <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                                No hay expedientes registrados
                            </td>
                        </tr>
                    ) : (
                        expedientes.map((expediente) => (
                            <tr key={expediente.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <input
                                        type="checkbox"
                                        checked={selectedExpedientes.includes(expediente.id)}
                                        onChange={() => onSelectExpediente(expediente.id)}
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-medium text-gray-900">
                                        #{expediente.orden}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getGradoBadgeColor(expediente.grado)}`}>
                                        {GradoLabels[expediente.grado]}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">
                                        {expediente.apellidos_nombres}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                        {expediente.cip}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-gray-900">
                                        {expediente.numero_paginas}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        expediente.situacion_militar === 'Actividad'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-orange-100 text-orange-800'
                                    }`}>
                                        {SituacionMilitarLabels[expediente.situacion_militar]}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-500 max-w-xs truncate" title={expediente.ubicacion}>
                                        {expediente.ubicacion}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {expediente.estado === 'dentro' ? (
                                        <div className="flex items-center text-green-600">
                                            <CheckCircle2 className="h-4 w-4 mr-1" />
                                            <span className="text-sm font-medium">{EstadoExpedienteLabels[expediente.estado]}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-gray-400">
                                            <XCircle className="h-4 w-4 mr-1" />
                                            <span className="text-sm font-medium">{EstadoExpedienteLabels[expediente.estado]}</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onEdit(expediente)}
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onDelete(expediente)}
                                            className="text-red-600 hover:text-red-900"
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
