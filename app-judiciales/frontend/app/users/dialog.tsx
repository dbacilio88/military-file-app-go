'use client'

import { User } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog'
import { AlertTriangle } from 'lucide-react'

interface DeleteDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    userToDelete: User | null
    selectedUsersCount?: number
}

export function DeleteDialog({
    isOpen,
    onClose,
    onConfirm,
    userToDelete,
    selectedUsersCount = 0
}: DeleteDialogProps) {
    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open: boolean) => {
                // No hacer nada cuando intenta cerrar desde afuera
            }}
        >
            <DialogContent onInteractOutside={(e: any) => e.preventDefault()}>
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 rounded-full">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-semibold text-gray-900">
                                Confirmar Eliminación
                            </DialogTitle>
                            <DialogDescription className="text-sm text-gray-600 mt-1">
                                Esta acción no se puede deshacer.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                <div className="py-4">
                    {userToDelete ? (
                        <p className="text-gray-700">
                            ¿Estás seguro de que quieres eliminar al usuario{' '}
                            <span className="font-semibold">
                                {userToDelete.nombre} {userToDelete.apellido}
                            </span>
                            ?
                        </p>
                    ) : (
                        <p className="text-gray-700">
                            ¿Estás seguro de que quieres eliminar{' '}
                            <span className="font-semibold">{selectedUsersCount} usuario(s)</span>{' '}
                            seleccionado(s)?
                        </p>
                    )}
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
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
                        {userToDelete
                            ? 'Eliminar Usuario'
                            : `Eliminar ${selectedUsersCount} Usuario(s)`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
