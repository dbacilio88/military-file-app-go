'use client'

import { useState, useEffect } from 'react'
import { Profile } from '@/lib/types'
import { profileSchema, ProfileFormData } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Shield } from 'lucide-react'
import { z } from 'zod'
import PermissionsSelector from '@/components/PermissionsSelector'

interface ProfileFormProps {
    profile?: Profile
    onSubmit: (data: ProfileFormData) => Promise<void>
    onCancel: () => void
}

export function ProfileForm({
    profile,
    onSubmit,
    onCancel
}: ProfileFormProps) {
    const [formData, setFormData] = useState<ProfileFormData>({
        name: profile?.name || '',
        slug: profile?.slug || '',
        description: profile?.description || '',
        active: profile?.active !== undefined ? profile.active : (profile?.is_system ?? true),
        permissions: profile?.permissions || []
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const isUpdate = !!profile
    const isSystemProfile = profile?.is_system || false

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name,
                slug: profile.slug,
                description: profile.description || '',
                active: profile.active !== undefined ? profile.active : profile.is_system,
                permissions: profile.permissions || []
            })
        }
    }, [profile])

    const handleChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }
    }

    const handlePermissionsChange = (permissions: string[]) => {
        setFormData(prev => ({ ...prev, permissions }))
    }

    const validateForm = (): boolean => {
        try {
            profileSchema.parse(formData)
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

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {profile ? 'Editar Perfil' : 'Nuevo Perfil'}
                    </h2>
                    {isSystemProfile && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-md">
                            <Shield className="h-3 w-3 text-blue-600" />
                            <span className="text-xs text-blue-600 font-medium">Sistema</span>
                        </div>
                    )}
                </div>
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
                {/* Name */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className={errors.name ? 'border-red-500' : ''}
                        disabled={isSubmitting || isSystemProfile}
                        placeholder="Ingrese nombre del perfil"
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                </div>

                {/* Slug */}
                <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                        Slug <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="slug"
                        type="text"
                        value={formData.slug}
                        onChange={(e) => handleChange('slug', e.target.value)}
                        className={errors.slug ? 'border-red-500' : ''}
                        disabled={isSubmitting || isSystemProfile || isUpdate}
                        placeholder="Ingrese slug (identificador único)"
                    />
                    {errors.slug && (
                        <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
                    )}
                    {!isSystemProfile && isUpdate && (
                        <p className="mt-1 text-xs text-gray-500">El slug no puede modificarse</p>
                    )}
                </div>
            </div>

            {/* Description */}
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                </label>
                <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={3}
                    className={`flex w-full rounded-md border ${errors.description ? 'border-red-500' : 'border-gray-300'} bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50`}
                    disabled={isSubmitting || isSystemProfile}
                    placeholder="Ingrese descripción del perfil"
                />
                {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex flex-col">
                    <label htmlFor="active" className="text-sm font-medium text-gray-700">
                        Estado del Perfil
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                        {isSystemProfile 
                            ? 'Los perfiles del sistema no pueden ser desactivados'
                            : formData.active 
                                ? 'El perfil está activo y puede ser asignado a usuarios' 
                                : 'El perfil está inactivo y no puede ser asignado'
                        }
                    </p>
                </div>
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="active"
                        checked={formData.active}
                        onChange={(e) => handleChange('active', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-2"
                        disabled={isSubmitting || isSystemProfile}
                    />
                    <span className={`text-sm font-medium ${formData.active ? 'text-green-600' : 'text-gray-400'}`}>
                        {formData.active ? 'Activo' : 'Inactivo'}
                    </span>
                </div>
            </div>

            {/* Permissions */}
            <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Permisos
                </h3>
                <PermissionsSelector
                    selectedPermissions={formData.permissions}
                    onPermissionsChange={handlePermissionsChange}
                    disabled={isSubmitting || isSystemProfile}
                />
            </div>

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
                    disabled={isSubmitting || isSystemProfile}
                    className="bg-indigo-600 hover:bg-indigo-700"
                >
                    {isSubmitting ? 'Guardando...' : profile ? 'Actualizar' : 'Crear'}
                </Button>
            </div>
        </form>
    )
}
