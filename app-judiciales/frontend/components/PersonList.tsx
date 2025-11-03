'use client'

import { Person } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, User } from 'lucide-react'

interface PersonListProps {
  persons: Person[]
  loading: boolean
  onEdit: (person: Person) => void
  onDelete: (id: string) => void
}

export function PersonList({ persons, loading, onEdit, onDelete }: PersonListProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (persons.length === 0) {
    return (
      <Card className="p-12 text-center">
        <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No persons found</h3>
        <p className="text-gray-600">Add a new person to get started</p>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {persons.map((person) => (
        <Card key={person.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{person.nombre}</h3>
                <p className="text-sm text-gray-600">DNI: {person.dni}</p>
                <p className="text-sm text-gray-600">Age: {person.edad}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(person)}
                className="flex-1"
              >
                <Edit className="mr-1 h-3 w-3" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(person.id)}
                className="flex-1"
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
