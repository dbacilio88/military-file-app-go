# Sistema de Autenticación - Frontend

## 🔐 Funcionalidad Implementada

Se ha implementado un sistema completo de autenticación con JWT basado en el modelo `UserLogin` del backend.

## 📂 Archivos Creados

### 1. **Página de Login** (`app/login/page.tsx`)
- Formulario de login con validación
- Manejo de errores
- Redirección automática al dashboard después del login
- Almacenamiento de tokens en localStorage

### 2. **Hook de Autenticación** (`hooks/useAuth.ts`)
- `useAuth()` - Hook personalizado para manejar autenticación
- Funciones disponibles:
  - `user` - Datos del usuario autenticado
  - `loading` - Estado de carga
  - `isAuthenticated` - Boolean de autenticación
  - `logout()` - Función para cerrar sesión
  - `hasRole(role)` - Verifica si el usuario tiene un rol específico
  - `hasAnyRole(roles[])` - Verifica si el usuario tiene alguno de los roles

### 3. **Componente de Rutas Protegidas** (`components/ProtectedRoute.tsx`)
- Wrapper para proteger páginas
- Redirección automática a `/login` si no está autenticado
- Verificación de roles requeridos
- Pantalla de carga mientras valida

### 4. **Header Actualizado** (`components/Header.tsx`)
- Muestra información del usuario autenticado
- Botón de logout funcional
- Muestra roles del usuario como badges

## 🚀 Uso

### Proteger una Página

```tsx
import ProtectedRoute from '@/components/ProtectedRoute'

export default function MyPage() {
  return (
    <ProtectedRoute>
      {/* Contenido de la página */}
    </ProtectedRoute>
  )
}
```

### Proteger con Roles Específicos

```tsx
<ProtectedRoute requiredRoles={['crear', 'actualizar']}>
  {/* Solo usuarios con roles 'crear' o 'actualizar' pueden acceder */}
</ProtectedRoute>
```

### Usar el Hook de Autenticación

```tsx
'use client'
import { useAuth } from '@/hooks/useAuth'

export default function MyComponent() {
  const { user, logout, hasRole } = useAuth()
  
  return (
    <div>
      <p>Usuario: {user?.nombre} {user?.apellido}</p>
      <p>Email: {user?.email}</p>
      
      {hasRole('crear') && (
        <button>Crear Nuevo</button>
      )}
      
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  )
}
```

## 🔑 Credenciales de Prueba

- **Email:** `admin@judiciales.com`
- **Password:** `admin123`

## 🌐 Endpoints Utilizados

### Login
```
POST http://localhost:8080/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@judiciales.com",
  "password": "admin123"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "admin@judiciales.com",
      "nombre": "Admin",
      "apellido": "User",
      "roles": ["crear", "eliminar", "actualizar", "leer", ...]
    },
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "expires_at": "2024-01-01T00:00:00Z"
  }
}
```

## 📦 Almacenamiento

Los tokens se guardan en `localStorage`:
- `access_token` - Token JWT de acceso
- `refresh_token` - Token para renovar el access_token
- `user` - Datos del usuario (JSON stringified)

## 🔄 Flujo de Autenticación

1. Usuario ingresa credenciales en `/login`
2. Se realiza POST a `/api/v1/auth/login`
3. Backend valida credenciales
4. Backend retorna tokens y datos del usuario
5. Frontend guarda en localStorage
6. Redirección a `/` (dashboard)
7. `ProtectedRoute` verifica autenticación
8. Si válido, muestra contenido protegido
9. Si inválido, redirige a `/login`

## 🛡️ Roles Disponibles

- `crear` - Crear recursos
- `eliminar` - Eliminar recursos
- `actualizar` - Actualizar recursos
- `leer` - Leer/visualizar recursos
- `imprimir` - Imprimir documentos
- `exportar` - Exportar datos
- `importar` - Importar datos
- `ver` - Ver información general

## ⚙️ Configuración del Backend

El backend ya está configurado con:
- ✅ Endpoint `/api/v1/auth/login` implementado
- ✅ Validación con modelo `UserLogin`
- ✅ Generación de JWT con roles
- ✅ Middleware de autenticación
- ✅ Verificación de roles por usuario

## 🧪 Probar el Login

1. **Iniciar Backend:**
```powershell
cd C:\Users\94183\Documents\judicales\app-judiciales\backend
docker-compose up -d
```

2. **Iniciar Frontend:**
```powershell
cd C:\Users\94183\Documents\judicales\app-judiciales\frontend
npm run dev
```

3. **Acceder:**
- Abrir http://localhost:3000
- Será redirigido a `/login` automáticamente
- Ingresar credenciales: `admin@judiciales.com` / `admin123`
- Será redirigido al dashboard

## 🔧 Personalización

### Cambiar URL del Backend

Editar `app/login/page.tsx` línea 18:
```typescript
const response = await fetch('http://localhost:8080/api/v1/auth/login', {
  // Cambiar URL aquí
})
```

### Agregar Más Roles

Editar el hook `useAuth.ts` para agregar funciones personalizadas:
```typescript
const isAdmin = () => hasRole('administrador')
const canCreate = () => hasRole('crear')
const canDelete = () => hasRole('eliminar')
```

## 📝 Notas

- Los tokens expiran según configuración del backend (default: 24h)
- El `refresh_token` se puede usar en `/api/v1/auth/refresh` para obtener un nuevo token
- El logout actualmente solo limpia localStorage (TODO: blacklist en Redis)
- Los roles se obtienen del perfil del usuario + roles explícitos
