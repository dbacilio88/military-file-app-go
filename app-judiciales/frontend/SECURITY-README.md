# 🔐 Sistema de Seguridad y Autorización

## Resumen

Este sistema implementa un control de acceso granular basado en roles y permisos para el Sistema de Expedientes Militares. Permite controlar qué usuarios pueden acceder a qué recursos y realizar qué acciones.

## 🏗️ Arquitectura de Seguridad

### 1. **Autenticación (Authentication)**
- **JWT Tokens**: Tokens seguros para identificar usuarios
- **Contexto de Autenticación**: Estado global del usuario autenticado
- **Almacenamiento**: localStorage para persistencia entre sesiones

### 2. **Autorización (Authorization)**
- **Permisos granulares**: Control específico por recurso y acción
- **Roles/Perfiles**: Agrupación de permisos
- **Validación en tiempo real**: Verificación continua de permisos

## 📋 Permisos Disponibles

### Usuarios (users)
- `user:read` - Ver usuarios
- `user:create` - Crear usuarios
- `user:update` - Actualizar usuarios
- `user:delete` - Eliminar usuarios

### Perfiles (profiles)
- `profile:read` - Ver perfiles
- `profile:create` - Crear perfiles
- `profile:update` - Actualizar perfiles
- `profile:delete` - Eliminar perfiles

### Expedientes (expedientes)
- `expediente:read` - Ver expedientes
- `expediente:create` - Crear expedientes
- `expediente:update` - Actualizar expedientes
- `expediente:delete` - Eliminar expedientes

### Sistema (system)
- `system:admin` - Administrador del sistema (acceso total)

## 🔧 Implementación

### 1. **Contexto de Autenticación**

```tsx
// En el layout principal
import { AuthProvider } from '@/contexts/authContext';

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
```

### 2. **Hook de Autenticación**

```tsx
import { useAuth } from '@/contexts/authContext';

function MyComponent() {
  const { user, hasPermission, logout } = useAuth();
  
  if (hasPermission('user:create')) {
    // Mostrar botón crear usuario
  }
}
```

### 3. **Protección de Componentes**

```tsx
import { ProtectedComponent } from '@/components/PermissionGuard';

function UserActions() {
  return (
    <div>
      <ProtectedComponent permission="user:create">
        <CreateUserButton />
      </ProtectedComponent>
      
      <ProtectedComponent permissions={["user:update", "user:delete"]} requireAll={false}>
        <UserEditActions />
      </ProtectedComponent>
      
      <ProtectedComponent adminOnly={true}>
        <AdminPanel />
      </ProtectedComponent>
    </div>
  );
}
```

### 4. **Protección de Páginas**

```tsx
import { ProtectedRoute } from '@/components/PermissionGuard';

export default function UsersPage() {
  return (
    <ProtectedRoute permissions={['user:read']}>
      <UsersContent />
    </ProtectedRoute>
  );
}
```

### 5. **HOC para Páginas**

```tsx
import { withPermissions, withAdminOnly } from '@/components/withPermissions';

// Proteger página completa
const ProtectedUsersPage = withPermissions(UsersPage, {
  permissions: ['user:read']
});

// Solo para administradores
const AdminPage = withAdminOnly(AdminPanel);

export default ProtectedUsersPage;
```

### 6. **Hooks de Acciones**

```tsx
import { useUserActions, useExpedienteActions } from '@/hooks/usePermissionActions';

function UserManagement() {
  const { createUser, deleteUser, viewUsers } = useUserActions();
  
  const handleCreateUser = () => {
    createUser(() => {
      // Acción solo se ejecuta si tiene permiso
      console.log('Creating user...');
    });
  };
  
  const handleDeleteUser = (id: string) => {
    deleteUser(() => {
      // Acción solo se ejecuta si tiene permiso
      console.log('Deleting user:', id);
    });
  };
}
```

## 🔒 Ejemplos de Uso

### Página de Gestión de Usuarios

```tsx
'use client';

import { ProtectedRoute, ProtectedComponent } from '@/components/PermissionGuard';
import { useUserActions } from '@/hooks/usePermissionActions';

export default function UsersPage() {
  const { createUser, deleteUser } = useUserActions();
  
  return (
    <ProtectedRoute permissions={['user:read']}>
      <div>
        <h1>Gestión de Usuarios</h1>
        
        {/* Solo mostrar si puede crear usuarios */}
        <ProtectedComponent permission="user:create">
          <button onClick={() => createUser(handleCreate)}>
            Crear Usuario
          </button>
        </ProtectedComponent>
        
        {/* Solo para administradores */}
        <ProtectedComponent adminOnly={true}>
          <AdminUserTools />
        </ProtectedComponent>
        
        <UserList />
      </div>
    </ProtectedRoute>
  );
}
```

### Menú Dinámico con Permisos

```tsx
import { ProtectedComponent } from '@/components/PermissionGuard';

function NavigationMenu() {
  return (
    <nav>
      <ProtectedComponent permission="expediente:read">
        <NavLink href="/expedientes">Expedientes</NavLink>
      </ProtectedComponent>
      
      <ProtectedComponent permission="user:read">
        <NavLink href="/users">Usuarios</NavLink>
      </ProtectedComponent>
      
      <ProtectedComponent permission="profile:read">
        <NavLink href="/profiles">Perfiles</NavLink>
      </ProtectedComponent>
      
      <ProtectedComponent adminOnly={true}>
        <NavLink href="/admin">Administración</NavLink>
      </ProtectedComponent>
    </nav>
  );
}
```

### Tabla con Acciones Condicionales

```tsx
function UserTable({ users }) {
  const { updateUser, deleteUser } = useUserActions();
  
  return (
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Email</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <td>{user.nombre}</td>
            <td>{user.email}</td>
            <td>
              <ProtectedComponent permission="user:update">
                <button onClick={() => updateUser(() => handleEdit(user.id))}>
                  Editar
                </button>
              </ProtectedComponent>
              
              <ProtectedComponent permission="user:delete">
                <button onClick={() => deleteUser(() => handleDelete(user.id))}>
                  Eliminar
                </button>
              </ProtectedComponent>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## 🛡️ Seguridad Adicional

### 1. **Middleware de Next.js**
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Validación de rutas protegidas
  // Verificación de tokens
  // Redirección automática
}
```

### 2. **Headers de Autenticación**
```typescript
// Automático en todas las llamadas API
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}
```

### 3. **Validación del Backend**
- Verificación de permisos en cada endpoint
- Tokens JWT validados en el servidor
- Respuestas 401/403 manejadas automáticamente

## 📊 Dashboard de Permisos

Para administradores, se puede crear un dashboard que muestre:

```tsx
function PermissionsDashboard() {
  const { user } = useAuth();
  
  return (
    <ProtectedComponent adminOnly={true}>
      <div>
        <h2>Permisos del Usuario: {user?.email}</h2>
        <ul>
          {user?.permissions.map(permission => (
            <li key={permission}>✅ {permission}</li>
          ))}
        </ul>
        
        <h3>Perfil: {user?.profile?.name}</h3>
        <p>{user?.profile?.description}</p>
      </div>
    </ProtectedComponent>
  );
}
```

## 🔄 Flujo de Autenticación

1. **Login**: Usuario ingresa credenciales
2. **Verificación**: Backend valida y retorna JWT + permisos
3. **Almacenamiento**: Token y permisos se guardan localmente
4. **Navegación**: Cada página/componente verifica permisos
5. **API Calls**: Token se incluye automáticamente
6. **Logout**: Limpieza de datos y redirección

## ⚠️ Consideraciones Importantes

### Seguridad
- **Nunca confiar solo en el frontend**: Siempre validar en el backend
- **Tokens con expiración**: Implementar refresh tokens
- **HTTPS obligatorio**: En producción
- **Logs de seguridad**: Registrar intentos de acceso no autorizado

### Rendimiento
- **Caché de permisos**: Evitar consultas repetitivas
- **Lazy loading**: Cargar componentes solo cuando se necesiten
- **Optimización de re-renders**: useCallback y useMemo

### UX/UI
- **Feedback claro**: Mostrar por qué algo no está disponible
- **Degradación gradual**: Ocultar vs deshabilitar elementos
- **Estados de carga**: Durante verificaciones de permisos

Este sistema proporciona una base sólida y escalable para manejar la seguridad en toda la aplicación militar de expedientes.