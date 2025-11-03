# Cambios Implementados: Sistema de Perfiles y Roles

**Fecha:** 2025-11-03  
**Tipo:** Refactorización del sistema de usuarios

## 📋 Resumen

Se ha implementado un nuevo sistema de **perfiles** y **roles** para reemplazar el sistema anterior de roles fijos. Ahora los usuarios se definen por perfiles que contienen conjuntos de roles/permisos, y pueden tener roles explícitos adicionales que se pueden añadir o quitar dinámicamente.

---

## 🔄 Cambios en el Modelo de Datos

### Antes
```typescript
interface User {
  role: UserRole; // 'admin' | 'abogado' | 'secretario' | 'viewer'
}
```

### Después
```typescript
interface User {
  profileId?: ObjectId;     // Referencia al perfil
  roles: string[];          // Roles explícitos del usuario
}

interface Profile {
  _id: ObjectId;
  name: string;             // "Administrador"
  slug: string;             // "administrador"
  roles: string[];          // ["crear", "eliminar", "actualizar", ...]
  active: boolean;
}
```

---

## 📝 Archivos Modificados

### 1. **Especificaciones**
- ✅ `specs/data-model.md` - Actualizada sección de usuarios y profiles

### 2. **Modelos Go**
- ✅ `internal/models/user.go` - Reemplazado campo `Rol` por `ProfileID` y `Roles[]`
- ✅ `internal/models/profile.go` - **NUEVO** - Modelo de perfil

### 3. **Repositorio**
- ✅ `internal/repository/user_repository.go`
  - Método `Create()` inicializa `Roles` como array vacío si es nil
  - Método `GetByRole()` ahora busca en el array `roles`

### 4. **Servicios**
- ✅ `internal/services/auth_service.go`
  - Token JWT incluye `roles` (array) y `profile_id` en lugar de `role` único
- ✅ `internal/services/services.go`
  - Añadidos métodos básicos CRUD para UserService

### 5. **Middleware**
- ✅ `internal/middleware/auth.go`
  - Claims ahora tiene `Roles []string` y `ProfileID string`
  - `RequireRole()` verifica si el usuario tiene alguno de los roles requeridos en su array

### 6. **Inicialización BD**
- ✅ `init-mongo.js`
  - Crea colección `profiles`
  - Inserta perfil "Administrador" con roles completos
  - Usuario admin vinculado a perfil con roles explícitos

---

## 🎯 Roles Disponibles

Los roles ahora son permisos granulares:

- `crear` - Crear nuevos registros
- `eliminar` - Eliminar registros existentes
- `actualizar` - Modificar registros existentes
- `leer` - Consultar/listar registros
- `imprimir` - Generar documentos imprimibles
- `exportar` - Exportar datos (Excel, PDF, etc.)
- `importar` - Importar datos desde archivos
- `ver` - Visualizar detalles de registros

---

## 🔐 Perfil Administrador (Por Defecto)

```json
{
  "name": "Administrador",
  "slug": "administrador",
  "roles": [
    "crear",
    "eliminar", 
    "actualizar",
    "leer",
    "imprimir",
    "exportar",
    "importar",
    "ver"
  ],
  "active": true
}
```

---

## 👤 Usuario Admin Creado

```json
{
  "_id": ObjectId("69085a403407fd66cece5f47"),
  "email": "admin@judiciales.com",
  "password": "$2a$10$XQK8q7QvQJ5HZ8ZjPz7Ow.YVMzRlH2nN5YJfP3Dz4qE7UJGfQwY0a",
  "nombre": "Administrador Sistema",
  "apellido": "",
  "documento": "12345678",
  "telefono": "+54 11 1234-5678",
  "profile_id": ObjectId("69085a302e6876776bce5f47"),
  "roles": [
    "crear",
    "eliminar",
    "actualizar",
    "leer",
    "imprimir",
    "exportar",
    "importar",
    "ver"
  ],
  "activo": true,
  "created_at": ISODate("2025-11-03T07:31:12.991Z"),
  "updated_at": ISODate("2025-11-03T07:31:12.991Z")
}
```

**Credenciales:**
- Email: `admin@judiciales.com`
- Password: `admin123`

---

## 🚀 Uso del Sistema

### Crear Usuario con Perfil

```go
user := &models.User{
    Email: "usuario@example.com",
    Password: hashedPassword,
    Nombre: "Juan",
    Apellido: "Pérez",
    ProfileID: perfilID,  // ID del perfil asignado
    Roles: []string{"leer", "crear", "actualizar"}, // Roles explícitos
    Activo: true,
}
```

### Añadir/Quitar Roles

```go
// Añadir rol
userRepo.Update(userID, bson.M{
    "$addToSet": bson.M{"roles": "exportar"},
})

// Quitar rol
userRepo.Update(userID, bson.M{
    "$pull": bson.M{"roles": "exportar"},
})
```

### Verificar Permisos en Middleware

```go
// El middleware RequireRole ahora busca en el array de roles
protected.Use(middleware.RequireRole("crear", "actualizar"))
```

---

## 📊 Token JWT Actualizado

```json
{
  "user_id": "69085a403407fd66cece5f47",
  "email": "admin@judiciales.com",
  "roles": ["crear", "eliminar", "actualizar", "leer", "imprimir", "exportar", "importar", "ver"],
  "profile_id": "69085a302e6876776bce5f47",
  "exp": 1730707935,
  "iat": 1730621535
}
```

---

## ✅ Estado del Sistema

- [x] Modelo de datos actualizado
- [x] Código Go refactorizado
- [x] Middleware adaptado
- [x] Base de datos migrada
- [x] Backend desplegado y funcionando
- [x] Usuario admin verificado

### Verificación

```bash
# Health check
curl http://localhost:8080/health

# Ver usuario en MongoDB
docker exec expedientes_mongodb mongosh -u admin -p admin123 \
  --authenticationDatabase admin expedientes_db \
  --eval "db.users.findOne({ email: 'admin@judiciales.com' })"
```

---

## 📚 Próximos Pasos Sugeridos

### Backend
1. Crear repositorio/servicio para `Profile`
2. Endpoints para gestión de perfiles (CRUD)
3. Endpoint para asignar/remover roles a usuarios
4. Validaciones de roles en handlers

### Frontend
1. Interfaz para gestión de perfiles
2. Interfaz para asignar perfiles a usuarios
3. Interfaz para añadir/quitar roles individuales
4. Componente de visualización de permisos

### Seguridad
1. Auditoría de cambios de roles
2. Validación de permisos en cada endpoint
3. Cache de permisos para optimizar

---

## 🔍 Testing

### Verificar migración
```bash
cd app-judiciales/backend
docker exec expedientes_mongodb mongosh -u admin -p admin123 \
  --authenticationDatabase admin expedientes_db \
  --eval "db.profiles.find().pretty()"
```

### Recompilar y desplegar
```bash
docker-compose down backend
docker-compose build backend
docker-compose up -d backend
```

---

**Última actualización:** 2025-11-03  
**Backend Status:** ✅ Funcionando  
**MongoDB Status:** ✅ Migrado  
**Docker Status:** ✅ Desplegado