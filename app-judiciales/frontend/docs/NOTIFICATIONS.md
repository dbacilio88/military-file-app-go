# Sistema de Notificaciones

Sistema completo de notificaciones en tiempo real integrado en el Header de la aplicación.

## Características

### ✅ Funcionalidades Implementadas

- **Badge de contador**: Muestra el número de notificaciones no leídas (máximo 9+)
- **Dropdown interactivo**: Panel desplegable con todas las notificaciones
- **Tipos de notificaciones**: 
  - `info` - Información general (icono azul)
  - `success` - Acciones exitosas (icono verde)
  - `warning` - Advertencias (icono amarillo)
  - `error` - Errores (icono rojo)
- **Gestión de notificaciones**:
  - Marcar individual como leída
  - Marcar todas como leídas
  - Eliminar notificaciones
  - Ver todas las notificaciones
- **Responsive**: Funciona en desktop y móvil
- **Estado visual**: Las notificaciones no leídas tienen un punto azul y fondo resaltado

## Estructura de Archivos

```
frontend/
├── components/
│   ├── Header.tsx                 # Componente principal con botón de notificaciones
│   └── NotificationsPanel.tsx     # Panel desplegable de notificaciones
├── hooks/
│   └── useNotifications.ts        # Hook personalizado para gestionar notificaciones
```

## Uso

### En el Header

El sistema de notificaciones está integrado automáticamente en el componente `Header`:

```tsx
import { Header } from '@/components/Header'

export default function Layout() {
  return (
    <div>
      <Header userName="Admin User" userRole="Administrator" />
      {/* resto del contenido */}
    </div>
  )
}
```

### Hook useNotifications

Para agregar notificaciones desde cualquier componente:

```tsx
import { useNotifications } from '@/hooks/useNotifications'

function MyComponent() {
  const { addNotification } = useNotifications()

  const handleAction = () => {
    // Agregar una notificación de éxito
    addNotification({
      type: 'success',
      title: 'Operación Exitosa',
      message: 'Los datos se han guardado correctamente'
    })
  }

  return <button onClick={handleAction}>Guardar</button>
}
```

## Tipos de Notificación

### Success (Éxito)
```tsx
addNotification({
  type: 'success',
  title: 'Persona Agregada',
  message: 'Juan Pérez ha sido agregado al sistema'
})
```

### Info (Información)
```tsx
addNotification({
  type: 'info',
  title: 'Actualización del Sistema',
  message: 'El sistema se actualizará esta noche a las 2:00 AM'
})
```

### Warning (Advertencia)
```tsx
addNotification({
  type: 'warning',
  title: 'Respaldo Pendiente',
  message: 'Recuerda hacer un respaldo antes de la actualización'
})
```

### Error (Error)
```tsx
addNotification({
  type: 'error',
  title: 'Error de Conexión',
  message: 'No se pudo conectar con el servidor'
})
```

## API del Hook

### useNotifications()

Retorna un objeto con las siguientes propiedades y métodos:

- **notifications**: `Notification[]` - Array de todas las notificaciones
- **unreadCount**: `number` - Cantidad de notificaciones no leídas
- **addNotification**: `(notification) => void` - Agregar nueva notificación
- **markAsRead**: `(id: string) => void` - Marcar como leída
- **markAllAsRead**: `() => void` - Marcar todas como leídas
- **deleteNotification**: `(id: string) => void` - Eliminar notificación
- **clearAll**: `() => void` - Limpiar todas las notificaciones

## Interface Notification

```typescript
interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  time: string
  read: boolean
}
```

## Personalización

### Cambiar el límite del badge

En `Header.tsx`, línea del badge:

```tsx
{unreadCount > 9 ? '9+' : unreadCount}
// Cambiar a:
{unreadCount > 99 ? '99+' : unreadCount}
```

### Modificar colores

En `NotificationsPanel.tsx`, funciones de estilos:

```tsx
const getNotificationBgColor = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return 'bg-green-50'  // Cambiar color de fondo
    // ...
  }
}
```

## Próximas Mejoras

- [ ] Persistencia en localStorage
- [ ] Notificaciones push
- [ ] Sonido al recibir notificación
- [ ] Filtros por tipo
- [ ] Paginación de notificaciones
- [ ] WebSocket para notificaciones en tiempo real
- [ ] Integración con el backend

## Ejemplo Completo

```tsx
'use client'

import { useNotifications } from '@/hooks/useNotifications'
import { Button } from '@/components/ui/button'

export function PersonForm() {
  const { addNotification } = useNotifications()

  const handleSubmit = async (data: PersonData) => {
    try {
      await createPerson(data)
      
      addNotification({
        type: 'success',
        title: 'Persona Creada',
        message: `${data.nombre} ha sido agregado correctamente`
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error al Crear',
        message: 'No se pudo crear la persona. Intenta nuevamente.'
      })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* campos del formulario */}
      <Button type="submit">Crear Persona</Button>
    </form>
  )
}
```
