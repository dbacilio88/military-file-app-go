'use client'

import { Profile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog'
import { AlertTriangle, ShieldAlert } from 'lucide-react'

interface DeleteDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    profileToDelete: Profile | null
}

export function DeleteDialog({
    isOpen,
    onClose,
    onConfirm,
    profileToDelete
}: DeleteDialogProps) {
    const isSystemProfile = profileToDelete?.is_system || false

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open: boolean) => {
                // No hacer nada cuando intenta cerrar desde afuera
            }}
        >
            <DialogContent 
                className="sm:max-w-[500px]"
                onInteractOutside={(e: any) => e.preventDefault()}
            >
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-full ${isSystemProfile ? 'bg-yellow-100' : 'bg-red-100'}`}>
                            {isSystemProfile ? (
                                <ShieldAlert className="h-6 w-6 text-yellow-600" />
                            ) : (
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            )}
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-semibold text-gray-900">
                                {isSystemProfile ? 'Perfil del Sistema' : 'Confirmar Eliminación'}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-gray-600 mt-1">
                                {isSystemProfile 
                                    ? 'Este perfil está protegido.'
                                    : 'Esta acción no se puede deshacer.'
                                }
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                <div className="py-4">
                    {isSystemProfile ? (
                        <div className="space-y-3">
                            <p className="text-gray-700">
                                El perfil{' '}
                                <span className="font-semibold">{profileToDelete?.name}</span>{' '}
                                es un perfil del sistema y no puede ser eliminado.
                            </p>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                                <p className="text-sm text-yellow-800">
                                    Los perfiles del sistema son esenciales para el funcionamiento 
                                    de la aplicación y están protegidos contra eliminación.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-700">
                            ¿Estás seguro de que quieres eliminar el perfil{' '}
                            <span className="font-semibold">{profileToDelete?.name}</span>?
                        </p>
                    )}
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    {isSystemProfile ? (
                        <Button
                            onClick={onClose}
                            className="w-full"
                        >
                            Entendido
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="order-2 sm:order-1"
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={onConfirm}
                                className="order-1 sm:order-2"
                            >
                                Eliminar Perfil
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
