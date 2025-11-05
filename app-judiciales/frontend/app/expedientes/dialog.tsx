'use client'

import { Expediente } from '@/lib/types'
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
    onCancel: () => void
    onConfirm: () => void
    expedienteToDelete: Expediente | null
    selectedCount?: number
}

export function DeleteDialog({
    isOpen,
    onCancel,
    onConfirm,
    expedienteToDelete,
    selectedCount = 0
}: DeleteDialogProps) {
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
                    {expedienteToDelete ? (
                        <p className="text-gray-700">
                            ¿Estás seguro de que quieres eliminar el expediente{' '}
                            <span className="font-semibold">
                                Orden {expedienteToDelete.orden} - {expedienteToDelete.apellidos_nombres}
                            </span>
                            ?
                        </p>
                    ) : (
                        <p className="text-gray-700">
                            ¿Estás seguro de que quieres eliminar{' '}
                            <span className="font-semibold">{selectedCount} expediente(s)</span>{' '}
                            seleccionado(s)?
                        </p>
                    )}
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        className="order-2 sm:order-1"
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        className="order-1 sm:order-2"
                    >
                        {expedienteToDelete
                            ? 'Eliminar Expediente'
                            : `Eliminar ${selectedCount} Expediente(s)`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
