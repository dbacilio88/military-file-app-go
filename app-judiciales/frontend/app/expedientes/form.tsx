'use client'

import { useState, useEffect } from 'react'
import { Expediente, CreateExpedienteInput, UpdateExpedienteInput, Grado, SituacionMilitar, ExpedienteEstado, GradoLabels, SituacionMilitarLabels, EstadoExpedienteLabels } from '@/lib/types'
import { expedienteSchema } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'
import { z } from 'zod'

interface ExpedienteFormProps {
    expediente?: Expediente
    onSubmit: (data: CreateExpedienteInput | UpdateExpedienteInput) => Promise<void>
    onCancel: () => void
}

export function ExpedienteForm({ expediente, onSubmit, onCancel }: ExpedienteFormProps) {
    const [formData, setFormData] = useState<CreateExpedienteInput | UpdateExpedienteInput>({
        grado: expediente?.grado || '' as Grado,
        apellidos_nombres: expediente?.apellidos_nombres || '',
        cip: expediente?.cip || '',
        numero_paginas: expediente?.numero_paginas || 1,
        situacion_militar: expediente?.situacion_militar || '' as SituacionMilitar,
        ubicacion: expediente?.ubicacion || '',
        orden: expediente?.orden || 1,
        ano: expediente?.ano || new Date().getFullYear(), // Año por defecto: año actual
        ...(expediente && { estado: expediente.estado })
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const isUpdate = !!expediente

    useEffect(() => {
        if (expediente) {
            setFormData({
                grado: expediente.grado,
                apellidos_nombres: expediente.apellidos_nombres,
                cip: expediente.cip,
                numero_paginas: expediente.numero_paginas,
                situacion_militar: expediente.situacion_militar,
                ubicacion: expediente.ubicacion,
                orden: expediente.orden,
                ano: expediente.ano,
                estado: expediente.estado
            })
        }
    }, [expediente])

    const handleChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }
    }

    const validateForm = (): boolean => {
        try {
            expedienteSchema.parse(formData)
            setErrors({})
            return true
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: Record<string, string> = {}
                error.errors.forEach((err) => {
                    if (err.path) {
                        newErrors[err.path[0]] = err.message
                    }
                })
                setErrors(newErrors)
            }
            return false
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)
        try {
            await onSubmit(formData)
        } finally {
            setIsSubmitting(false)
        }
    }

    const gradoOptions: Grado[] = ['GRAL', 'CRL', 'TTE CRL', 'MY', 'CAP', 'TTE', 'STTE', 'TCO', 'SSOO', 'EC', 'TROPA']
    const situacionMilitarOptions: SituacionMilitar[] = ['Actividad', 'Retiro']
    const estadoOptions: ExpedienteEstado[] = ['dentro', 'fuera']

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    {expediente ? 'Editar Expediente' : 'Nuevo Expediente'}
                </h2>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    <X className="h-5 w-5" />
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Grado */}
                <div>
                    <label htmlFor="grado" className="block text-sm font-medium text-gray-700 mb-1">
                        Grado <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="grado"
                        value={formData.grado}
                        onChange={(e) => handleChange('grado', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            errors.grado ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={isSubmitting}
                    >
                        <option value="">Seleccione un grado</option>
                        {gradoOptions.map((grado) => (
                            <option key={grado} value={grado}>
                                {GradoLabels[grado]}
                            </option>
                        ))}
                    </select>
                    {errors.grado && (
                        <p className="mt-1 text-sm text-red-600">{errors.grado}</p>
                    )}
                </div>

                {/* Situación Militar */}
                <div>
                    <label htmlFor="situacion_militar" className="block text-sm font-medium text-gray-700 mb-1">
                        Situación Militar <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="situacion_militar"
                        value={formData.situacion_militar}
                        onChange={(e) => handleChange('situacion_militar', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            errors.situacion_militar ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={isSubmitting}
                    >
                        <option value="">Seleccione situación</option>
                        {situacionMilitarOptions.map((situacion) => (
                            <option key={situacion} value={situacion}>
                                {SituacionMilitarLabels[situacion]}
                            </option>
                        ))}
                    </select>
                    {errors.situacion_militar && (
                        <p className="mt-1 text-sm text-red-600">{errors.situacion_militar}</p>
                    )}
                </div>

                {/* Apellidos y Nombres */}
                <div className="md:col-span-2">
                    <label htmlFor="apellidos_nombres" className="block text-sm font-medium text-gray-700 mb-1">
                        Apellidos y Nombres <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="apellidos_nombres"
                        type="text"
                        value={formData.apellidos_nombres}
                        onChange={(e) => handleChange('apellidos_nombres', e.target.value)}
                        className={errors.apellidos_nombres ? 'border-red-500' : ''}
                        disabled={isSubmitting}
                        placeholder="Ingrese apellidos y nombres completos"
                    />
                    {errors.apellidos_nombres && (
                        <p className="mt-1 text-sm text-red-600">{errors.apellidos_nombres}</p>
                    )}
                </div>

                {/* CIP */}
                <div>
                    <label htmlFor="cip" className="block text-sm font-medium text-gray-700 mb-1">
                        CIP <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="cip"
                        type="text"
                        value={formData.cip}
                        onChange={(e) => handleChange('cip', e.target.value)}
                        className={errors.cip ? 'border-red-500' : ''}
                        disabled={isSubmitting}
                        placeholder="Ingrese CIP (9 dígitos)"
                        maxLength={9}
                    />
                    {errors.cip && (
                        <p className="mt-1 text-sm text-red-600">{errors.cip}</p>
                    )}
                </div>

                {/* Número de Páginas */}
                <div>
                    <label htmlFor="numero_paginas" className="block text-sm font-medium text-gray-700 mb-1">
                        Número de Páginas <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="numero_paginas"
                        type="number"
                        min="1"
                        value={formData.numero_paginas}
                        onChange={(e) => handleChange('numero_paginas', parseInt(e.target.value) || 1)}
                        className={errors.numero_paginas ? 'border-red-500' : ''}
                        disabled={isSubmitting}
                    />
                    {errors.numero_paginas && (
                        <p className="mt-1 text-sm text-red-600">{errors.numero_paginas}</p>
                    )}
                </div>

                {/* Orden */}
                <div>
                    <label htmlFor="orden" className="block text-sm font-medium text-gray-700 mb-1">
                        Orden <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="orden"
                        type="number"
                        min="1"
                        value={formData.orden}
                        onChange={(e) => handleChange('orden', parseInt(e.target.value) || 1)}
                        className={errors.orden ? 'border-red-500' : ''}
                        disabled={isSubmitting}
                    />
                    {errors.orden && (
                        <p className="mt-1 text-sm text-red-600">{errors.orden}</p>
                    )}
                </div>

                {/* Año */}
                <div>
                    <label htmlFor="ano" className="block text-sm font-medium text-gray-700 mb-1">
                        Año <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="ano"
                        type="number"
                        min="1900"
                        max="2100"
                        value={formData.ano}
                        onChange={(e) => handleChange('ano', parseInt(e.target.value) || new Date().getFullYear())}
                        className={errors.ano ? 'border-red-500' : ''}
                        disabled={isSubmitting}
                        placeholder="Ej: 2025"
                    />
                    {errors.ano && (
                        <p className="mt-1 text-sm text-red-600">{errors.ano}</p>
                    )}
                </div>

                {/* Estado (only for updates) */}
                {isUpdate && (
                    <div>
                        <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                            Estado
                        </label>
                        <select
                            id="estado"
                            value={(formData as UpdateExpedienteInput).estado || ''}
                            onChange={(e) => handleChange('estado', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                errors.estado ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={isSubmitting}
                        >
                            <option value="">Seleccione estado</option>
                            {estadoOptions.map((estado) => (
                                <option key={estado} value={estado}>
                                    {EstadoExpedienteLabels[estado]}
                                </option>
                            ))}
                        </select>
                        {errors.estado && (
                            <p className="mt-1 text-sm text-red-600">{errors.estado}</p>
                        )}
                    </div>
                )}

                {/* Ubicación */}
                <div className={isUpdate ? '' : 'md:col-span-2'}>
                    <label htmlFor="ubicacion" className="block text-sm font-medium text-gray-700 mb-1">
                        Ubicación <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="ubicacion"
                        type="text"
                        value={formData.ubicacion}
                        onChange={(e) => handleChange('ubicacion', e.target.value)}
                        className={errors.ubicacion ? 'border-red-500' : ''}
                        disabled={isSubmitting}
                        placeholder="Ingrese ubicación del expediente"
                    />
                    {errors.ubicacion && (
                        <p className="mt-1 text-sm text-red-600">{errors.ubicacion}</p>
                    )}
                </div>
            </div>

            {/* Información de fechas (solo para expedientes existentes) */}
            {expediente && (
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Registro</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fecha de Registro
                            </label>
                            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900">
                                {new Date(expediente.fecha_registro).toLocaleString('es-ES', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Última Actualización
                            </label>
                            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900">
                                {new Date(expediente.fecha_actualizacion).toLocaleString('es-ES', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-indigo-600 hover:bg-indigo-700"
                >
                    {isSubmitting ? 'Guardando...' : expediente ? 'Actualizar' : 'Crear'}
                </Button>
            </div>
        </form>
    )
}
