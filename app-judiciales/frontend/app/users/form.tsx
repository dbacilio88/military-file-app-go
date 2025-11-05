'use client'

import { useState, useEffect } from 'react'
import { User, Profile } from '@/lib/types'
import { userSchema, UserFormData } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'
import { z } from 'zod'

interface UserFormProps {
    user?: User
    onSubmit: (data: UserFormData) => Promise<void>
    onCancel: () => void
    profiles: Profile[]
}

export function UserForm({
    user,
    onSubmit,
    onCancel,
    profiles
}: UserFormProps) {
    const [formData, setFormData] = useState<UserFormData>({
        email: user?.email || '',
        password: '',
        nombre: user?.nombre || '',
        apellido: user?.apellido || '',
        documento: user?.documento || '',
        profile_id: user?.profile_id || ''
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const isUpdate = !!user

    useEffect(() => {
        if (user) {
            setFormData({
                email: user.email,
                password: '',
                nombre: user.nombre,
                apellido: user.apellido,
                documento: user.documento,
                profile_id: user.profile_id || ''
            })
        }
    }, [user])

    const handleChange = (field: string, value: string) => {
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
            userSchema.parse(formData)
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
                <h2 className="text-2xl font-bold text-gray-900">
                    {user ? 'Editar Usuario' : 'Nuevo Usuario'}
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
                {/* Email */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className={errors.email ? 'border-red-500' : ''}
                        disabled={isSubmitting}
                        placeholder="Ingrese email"
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                </div>

                {/* Password */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña {isUpdate ? '(opcional)' : <span className="text-red-500">*</span>}
                    </label>
                    <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        className={errors.password ? 'border-red-500' : ''}
                        disabled={isSubmitting}
                        placeholder={isUpdate ? 'Dejar vacío para mantener contraseña' : 'Ingrese contraseña'}
                    />
                    {errors.password && (
                        <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                </div>

                {/* Nombre */}
                <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="nombre"
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => handleChange('nombre', e.target.value)}
                        className={errors.nombre ? 'border-red-500' : ''}
                        disabled={isSubmitting}
                        placeholder="Ingrese nombre"
                    />
                    {errors.nombre && (
                        <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                    )}
                </div>

                {/* Apellido */}
                <div>
                    <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-1">
                        Apellido <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="apellido"
                        type="text"
                        value={formData.apellido}
                        onChange={(e) => handleChange('apellido', e.target.value)}
                        className={errors.apellido ? 'border-red-500' : ''}
                        disabled={isSubmitting}
                        placeholder="Ingrese apellido"
                    />
                    {errors.apellido && (
                        <p className="mt-1 text-sm text-red-600">{errors.apellido}</p>
                    )}
                </div>

                {/* Documento */}
                <div>
                    <label htmlFor="documento" className="block text-sm font-medium text-gray-700 mb-1">
                        Documento <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="documento"
                        type="text"
                        value={formData.documento}
                        onChange={(e) => handleChange('documento', e.target.value)}
                        className={errors.documento ? 'border-red-500' : ''}
                        disabled={isSubmitting}
                        placeholder="Ingrese documento"
                    />
                    {errors.documento && (
                        <p className="mt-1 text-sm text-red-600">{errors.documento}</p>
                    )}
                </div>

                {/* Profile */}
                <div>
                    <label htmlFor="profile_id" className="block text-sm font-medium text-gray-700 mb-1">
                        Perfil <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="profile_id"
                        value={formData.profile_id}
                        onChange={(e) => handleChange('profile_id', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            errors.profile_id ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={isSubmitting}
                    >
                        <option value="">Seleccione un perfil</option>
                        {profiles.map((profile) => (
                            <option key={profile.id} value={profile.id}>
                                {profile.name}
                            </option>
                        ))}
                    </select>
                    {errors.profile_id && (
                        <p className="mt-1 text-sm text-red-600">{errors.profile_id}</p>
                    )}
                </div>
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
                    disabled={isSubmitting}
                    className="bg-indigo-600 hover:bg-indigo-700"
                >
                    {isSubmitting ? 'Guardando...' : user ? 'Actualizar' : 'Crear'}
                </Button>
            </div>
        </form>
    )
}
