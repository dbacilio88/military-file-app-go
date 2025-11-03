'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { personSchema, PersonFormData } from '@/lib/validation'
import { Person } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface PersonFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: PersonFormData) => void
  person?: Person | null
}

export function PersonForm({ open, onClose, onSubmit, person }: PersonFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PersonFormData>({
    resolver: zodResolver(personSchema),
  })

  useEffect(() => {
    if (person) {
      reset({
        dni: person.dni,
        nombre: person.nombre,
        edad: person.edad,
      })
    } else {
      reset({ dni: '', nombre: '', edad: 0 })
    }
  }, [person, reset])

  const handleFormSubmit = async (data: PersonFormData) => {
    await onSubmit(data)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{person ? 'Edit Person' : 'Add New Person'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">DNI</label>
            <Input {...register('dni')} placeholder="12345678" maxLength={8} />
            {errors.dni && <p className="text-sm text-red-500 mt-1">{errors.dni.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">Nombre</label>
            <Input {...register('nombre')} placeholder="John Doe" />
            {errors.nombre && <p className="text-sm text-red-500 mt-1">{errors.nombre.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">Edad</label>
            <Input
              {...register('edad', { valueAsNumber: true })}
              type="number"
              placeholder="25"
              min="0"
              max="150"
            />
            {errors.edad && <p className="text-sm text-red-500 mt-1">{errors.edad.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : person ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
