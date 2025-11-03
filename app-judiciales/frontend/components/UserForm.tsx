'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { userSchema, UserFormData } from '@/lib/validation'
import { User } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'

interface UserFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: UserFormData) => void
  user?: User | null
}

export function UserForm({ open, onClose, onSubmit, user }: UserFormProps) {
  const [roles, setRoles] = useState<string[]>([])
  const [newRole, setNewRole] = useState('')
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  })

  useEffect(() => {
    if (user) {
      reset({
        email: user.email,
        password: '',
        nombre: user.nombre,
        apellido: user.apellido,
        documento: user.documento,
        telefono: user.telefono || '',
        profile_id: user.profile_id || '',
      })
      setRoles(user.roles || [])
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
  }, [user, reset])

  const handleFormSubmit = async (data: UserFormData) => {
    const submitData = {
      ...data,
      roles: roles.length > 0 ? roles : undefined,
      password: data.password || undefined,
    }
    await onSubmit(submitData as UserFormData)
    reset()
    setRoles([])
  }

  const addRole = () => {
    if (newRole.trim() && !roles.includes(newRole.trim())) {
      const updatedRoles = [...roles, newRole.trim()]
      setRoles(updatedRoles)
      setValue('roles', updatedRoles)
      setNewRole('')
    }
  }

  const removeRole = (roleToRemove: string) => {
    const updatedRoles = roles.filter(role => role !== roleToRemove)
    setRoles(updatedRoles)
    setValue('roles', updatedRoles)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addRole()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {user ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <Input 
                {...register('email')} 
                type="email"
                placeholder="usuario@ejemplo.com" 
                className="mt-1"
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Contraseña {user ? '(dejar vacío para no cambiar)' : <span className="text-red-500">*</span>}
              </label>
              <Input 
                {...register('password')} 
                type="password"
                placeholder={user ? 'Dejar vacío para mantener actual' : 'Mínimo 6 caracteres'}
                className="mt-1"
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Nombre */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Nombre <span className="text-red-500">*</span>
              </label>
              <Input 
                {...register('nombre')} 
                placeholder="Juan" 
                className="mt-1"
              />
              {errors.nombre && (
                <p className="text-sm text-red-500 mt-1">{errors.nombre.message}</p>
              )}
            </div>

            {/* Apellido */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Apellido <span className="text-red-500">*</span>
              </label>
              <Input 
                {...register('apellido')} 
                placeholder="Pérez" 
                className="mt-1"
              />
              {errors.apellido && (
                <p className="text-sm text-red-500 mt-1">{errors.apellido.message}</p>
              )}
            </div>

            {/* Documento */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Documento <span className="text-red-500">*</span>
              </label>
              <Input 
                {...register('documento')} 
                placeholder="12345678" 
                className="mt-1"
              />
              {errors.documento && (
                <p className="text-sm text-red-500 mt-1">{errors.documento.message}</p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Teléfono
              </label>
              <Input 
                {...register('telefono')} 
                placeholder="+51 999 999 999" 
                className="mt-1"
              />
              {errors.telefono && (
                <p className="text-sm text-red-500 mt-1">{errors.telefono.message}</p>
              )}
            </div>

            {/* Profile ID */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Profile ID
              </label>
              <Input 
                {...register('profile_id')} 
                placeholder="profile_123" 
                className="mt-1"
              />
              {errors.profile_id && (
                <p className="text-sm text-red-500 mt-1">{errors.profile_id.message}</p>
              )}
            </div>

            {/* Roles */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Roles
              </label>
              <div className="flex gap-2 mb-2">
                <Input 
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Agregar rol (ej: admin, user)" 
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  onClick={addRole}
                  variant="outline"
                  className="shrink-0"
                >
                  Agregar
                </Button>
              </div>
              {roles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {roles.map((role, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {role}
                      <button
                        type="button"
                        onClick={() => removeRole(role)}
                        className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : user ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
