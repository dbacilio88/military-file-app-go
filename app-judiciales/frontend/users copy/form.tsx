'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, Profile } from '@/lib/types'
import { userSchema, UserFormData } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog'
import { Loader2, Save } from 'lucide-react'

interface UserFormProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: UserFormData) => Promise<void>
    selectedUser: User | null
    profiles: Profile[]
}

export function UserForm({
    isOpen,
    onClose,
    onSubmit,
    selectedUser,
    profiles
}: UserFormProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isValid }
    } = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        mode: 'onChange'
    })

    // Resetear el formulario cuando cambia el usuario seleccionado
    useEffect(() => {
        if (selectedUser) {
            reset({
                email: selectedUser.email,
                password: '',
                nombre: selectedUser.nombre,
                apellido: selectedUser.apellido,
                documento: selectedUser.documento,
                profile_id: selectedUser.profile_id || ''
            })
        } else {
            reset({
                email: '',
                password: '',
                nombre: '',
                apellido: '',
                documento: '',
                profile_id: ''
            })
        }
    }, [selectedUser, reset])

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        return handleSubmit(onSubmit)(e)
    }

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open: boolean) => {
                // No hacer nada cuando intenta cerrar desde afuera
                // Solo se puede cerrar con los botones
            }}
        >
            <DialogContent
                className="max-w-xl max-h-[90vh] overflow-y-auto"
                onInteractOutside={(e: any) => e.preventDefault()}
            >
                <DialogHeader className="pb-2">
                    <DialogTitle className="text-lg font-semibold">
                        {selectedUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleFormSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Email */}
                        <div className="relative">
                            <Input
                                type="email"
                                {...register('email')}
                                placeholder=" "
                                className="peer h-9"
                            />
                            <label className="absolute left-2 -top-2.5 bg-white px-1 text-xs font-medium text-gray-600 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-600">
                                Email <span className="text-red-500">*</span>
                            </label>
                            {errors.email && (
                                <p className="text-xs text-red-500 mt-0.5">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <Input
                                type="password"
                                {...register('password')}
                                placeholder=" "
                                className="peer h-9"
                            />
                            <label className="absolute left-2 -top-2.5 bg-white px-1 text-xs font-medium text-gray-600 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-600">
                                Contraseña{' '}
                                {selectedUser ? (
                                    '(opcional)'
                                ) : (
                                    <span className="text-red-500">*</span>
                                )}
                            </label>
                            {errors.password && (
                                <p className="text-xs text-red-500 mt-0.5">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Nombre */}
                        <div className="relative">
                            <Input {...register('nombre')} placeholder=" " className="peer h-9" />
                            <label className="absolute left-2 -top-2.5 bg-white px-1 text-xs font-medium text-gray-600 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-600">
                                Nombre <span className="text-red-500">*</span>
                            </label>
                            {errors.nombre && (
                                <p className="text-xs text-red-500 mt-0.5">{errors.nombre.message}</p>
                            )}
                        </div>

                        {/* Apellido */}
                        <div className="relative">
                            <Input {...register('apellido')} placeholder=" " className="peer h-9" />
                            <label className="absolute left-2 -top-2.5 bg-white px-1 text-xs font-medium text-gray-600 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-600">
                                Apellido <span className="text-red-500">*</span>
                            </label>
                            {errors.apellido && (
                                <p className="text-xs text-red-500 mt-0.5">{errors.apellido.message}</p>
                            )}
                        </div>

                        {/* Documento */}
                        <div className="relative">
                            <Input {...register('documento')} placeholder=" " className="peer h-9" />
                            <label className="absolute left-2 -top-2.5 bg-white px-1 text-xs font-medium text-gray-600 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-600">
                                Documento <span className="text-red-500">*</span>
                            </label>
                            {errors.documento && (
                                <p className="text-xs text-red-500 mt-0.5">{errors.documento.message}</p>
                            )}
                        </div>

                        {/* Profile */}
                        <div className="relative">
                            <select
                                {...register('profile_id')}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">Seleccionar perfil *</option>
                                {profiles.map((profile) => (
                                    <option key={profile.id} value={profile.id}>
                                        {profile.name}
                                    </option>
                                ))}
                            </select>
                            {errors.profile_id && (
                                <p className="text-xs text-red-500 mt-0.5">
                                    {errors.profile_id.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="order-2 sm:order-1"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !isValid}
                            className="order-1 sm:order-2 bg-indigo-600 hover:bg-indigo-700"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    {selectedUser ? 'Actualizar Usuario' : 'Crear Usuario'}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
