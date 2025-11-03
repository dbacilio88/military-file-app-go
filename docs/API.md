# API Documentation - Sistema de Expedientes Judiciales

## 📋 Índice

1. [Información General](#información-general)
2. [Autenticación](#autenticación)
3. [Endpoints](#endpoints)
4. [Modelos de Datos](#modelos-de-datos)
5. [Códigos de Error](#códigos-de-error)
6. [Ejemplos de Uso](#ejemplos-de-uso)

## 🌐 Información General

- **Base URL**: `http://localhost:8080/api/v1`
- **Formato**: JSON
- **Autenticación**: JWT Bearer Token
- **Versionado**: URL path (`/api/v1/`)

## 🔐 Autenticación

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "contraseña123"
}
```

**Respuesta exitosa:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "64f8a123b2c3d4e5f6789012",
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "role": "secretary"
    }
  }
}
```

### Refresh Token

```http
POST /auth/refresh
Authorization: Bearer <token>
```

### Logout

```http
POST /auth/logout
Authorization: Bearer <token>
```

## 📋 Endpoints

### 👥 Usuarios

#### Obtener todos los usuarios

```http
GET /users
Authorization: Bearer <token>
```

**Query Parameters:**

- `page` (int): Número de página (default: 1)
- `limit` (int): Elementos por página (default: 10)
- `role` (string): Filtrar por rol
- `search` (string): Buscar por nombre o email

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "64f8a123b2c3d4e5f6789012",
        "name": "Juan Pérez",
        "email": "juan@example.com",
        "role": "judge",
        "active": true,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "total_pages": 3
    }
  }
}
```

#### Crear usuario

```http
POST /users
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "María García",
  "email": "maria@example.com",
  "password": "contraseña123",
  "role": "secretary",
  "court_id": "64f8a123b2c3d4e5f6789999"
}
```

#### Obtener usuario por ID

```http
GET /users/{id}
Authorization: Bearer <token>
```

#### Actualizar usuario

```http
PUT /users/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "María García Martínez",
  "email": "maria.garcia@example.com",
  "role": "secretary"
}
```

#### Eliminar usuario

```http
DELETE /users/{id}
Authorization: Bearer <token>
```

### 📁 Expedientes

#### Obtener todos los expedientes

```http
GET /expedientes
Authorization: Bearer <token>
```

**Query Parameters:**

- `page` (int): Número de página
- `limit` (int): Elementos por página
- `status` (string): Estado del expediente
- `court_id` (string): ID del juzgado
- `date_from` (string): Fecha desde (YYYY-MM-DD)
- `date_to` (string): Fecha hasta (YYYY-MM-DD)
- `search` (string): Buscar en número o descripción

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "expedientes": [
      {
        "id": "64f8a123b2c3d4e5f6789013",
        "numero": "EXP-2024-001234",
        "descripcion": "Demanda por daños y perjuicios",
        "estado": "activo",
        "tipo": "civil",
        "juzgado": {
          "id": "64f8a123b2c3d4e5f6789999",
          "nombre": "Juzgado Civil 1"
        },
        "demandante": {
          "nombre": "José Martínez",
          "identificacion": "12345678901"
        },
        "demandado": {
          "nombre": "Empresa XYZ S.A.",
          "identificacion": "20123456789"
        },
        "fecha_inicio": "2024-01-15T00:00:00Z",
        "fecha_actualizacion": "2024-01-20T15:30:00Z",
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-20T15:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "total_pages": 15
    }
  }
}
```

#### Crear expediente

```http
POST /expedientes
Authorization: Bearer <token>
Content-Type: application/json

{
  "descripcion": "Nueva demanda laboral",
  "tipo": "laboral",
  "juzgado_id": "64f8a123b2c3d4e5f6789999",
  "demandante": {
    "nombre": "Ana López",
    "identificacion": "98765432109",
    "telefono": "+51999888777",
    "email": "ana@example.com"
  },
  "demandado": {
    "nombre": "Corporación ABC",
    "identificacion": "20987654321",
    "representante": "Carlos Rodríguez"
  },
  "monto_pretension": 50000.00,
  "observaciones": "Demanda por despido injustificado"
}
```

#### Obtener expediente por ID

```http
GET /expedientes/{id}
Authorization: Bearer <token>
```

#### Actualizar expediente

```http
PUT /expedientes/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "estado": "en_proceso",
  "observaciones": "Actualización de estado por audiencia programada"
}
```

#### Obtener movimientos del expediente

```http
GET /expedientes/{id}/movimientos
Authorization: Bearer <token>
```

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "movimientos": [
      {
        "id": "64f8a123b2c3d4e5f6789014",
        "tipo": "actuacion",
        "descripcion": "Audiencia de conciliación programada",
        "fecha": "2024-01-20T09:00:00Z",
        "usuario": {
          "id": "64f8a123b2c3d4e5f6789012",
          "name": "Juan Pérez"
        },
        "documento_adjunto": "audiencia_001.pdf",
        "created_at": "2024-01-18T14:30:00Z"
      }
    ]
  }
}
```

#### Agregar movimiento al expediente

```http
POST /expedientes/{id}/movimientos
Authorization: Bearer <token>
Content-Type: application/json

{
  "tipo": "resolucion",
  "descripcion": "Sentencia emitida",
  "fecha": "2024-01-25T15:00:00Z",
  "documento_adjunto": "sentencia_final.pdf"
}
```

### 🏛️ Juzgados

#### Obtener todos los juzgados

```http
GET /juzgados
Authorization: Bearer <token>
```

#### Crear juzgado

```http
POST /juzgados
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "Juzgado Penal 5",
  "tipo": "penal",
  "direccion": "Av. Judicial 123, Lima",
  "telefono": "+51123456789",
  "email": "penal5@poder-judicial.gob.pe"
}
```

### 📊 Reportes

#### Dashboard de estadísticas

```http
GET /reports/dashboard
Authorization: Bearer <token>
```

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "total_expedientes": 1250,
    "expedientes_activos": 450,
    "expedientes_resueltos": 800,
    "nuevos_este_mes": 45,
    "por_tipo": {
      "civil": 500,
      "penal": 300,
      "laboral": 250,
      "familia": 200
    },
    "por_estado": {
      "activo": 450,
      "en_proceso": 200,
      "resuelto": 600
    }
  }
}
```

#### Reporte de expedientes por período

```http
GET /reports/expedientes
Authorization: Bearer <token>
```

**Query Parameters:**

- `date_from` (string): Fecha desde (YYYY-MM-DD)
- `date_to` (string): Fecha hasta (YYYY-MM-DD)
- `court_id` (string): ID del juzgado
- `type` (string): Tipo de expediente
- `format` (string): pdf, excel, json (default: json)

## 📊 Modelos de Datos

### Usuario

```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "role": "admin|judge|secretary|lawyer",
  "court_id": "string",
  "active": "boolean",
  "last_login": "datetime",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Expediente

```json
{
  "id": "string",
  "numero": "string",
  "descripcion": "string",
  "estado": "activo|en_proceso|suspendido|resuelto|archivado",
  "tipo": "civil|penal|laboral|familia|comercial|administrativo",
  "prioridad": "baja|media|alta|urgente",
  "juzgado_id": "string",
  "demandante": {
    "nombre": "string",
    "identificacion": "string",
    "tipo_identificacion": "dni|ruc|ce",
    "telefono": "string",
    "email": "string",
    "direccion": "string"
  },
  "demandado": {
    "nombre": "string",
    "identificacion": "string",
    "tipo_identificacion": "dni|ruc|ce",
    "representante": "string",
    "telefono": "string",
    "email": "string",
    "direccion": "string"
  },
  "monto_pretension": "number",
  "fecha_inicio": "datetime",
  "fecha_vencimiento": "datetime",
  "observaciones": "string",
  "documentos": ["string"],
  "tags": ["string"],
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Movimiento

```json
{
  "id": "string",
  "expediente_id": "string",
  "tipo": "ingreso|actuacion|resolucion|notificacion|archivo",
  "descripcion": "string",
  "fecha": "datetime",
  "usuario_id": "string",
  "documento_adjunto": "string",
  "visible_publico": "boolean",
  "created_at": "datetime"
}
```

### Juzgado

```json
{
  "id": "string",
  "nombre": "string",
  "tipo": "civil|penal|laboral|familia|comercial",
  "direccion": "string",
  "telefono": "string",
  "email": "string",
  "juez_titular": "string",
  "activo": "boolean",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

## ⚠️ Códigos de Error

### Autenticación

- `401` - No autorizado
- `403` - Token inválido o expirado
- `422` - Credenciales incorrectas

### Validación

- `400` - Datos de entrada inválidos
- `409` - Conflicto (registro duplicado)
- `422` - Error de validación

### Recursos

- `404` - Recurso no encontrado
- `405` - Método no permitido

### Servidor

- `500` - Error interno del servidor
- `503` - Servicio no disponible

### Ejemplo de respuesta de error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Los datos proporcionados no son válidos",
    "details": [
      {
        "field": "email",
        "message": "El email no tiene un formato válido"
      },
      {
        "field": "password",
        "message": "La contraseña debe tener al menos 8 caracteres"
      }
    ]
  }
}
```

## 💡 Ejemplos de Uso

### Flujo completo: Crear expediente

```bash
# 1. Autenticarse
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "secretario@juzgado.com",
    "password": "contraseña123"
  }'

# Respuesta: { "data": { "token": "eyJ..." } }

# 2. Crear expediente
curl -X POST http://localhost:8080/api/v1/expedientes \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{
    "descripcion": "Demanda por daños y perjuicios",
    "tipo": "civil",
    "juzgado_id": "64f8a123b2c3d4e5f6789999",
    "demandante": {
      "nombre": "José Martínez",
      "identificacion": "12345678901",
      "telefono": "+51999888777"
    },
    "demandado": {
      "nombre": "Empresa XYZ S.A.",
      "identificacion": "20123456789"
    },
    "monto_pretension": 75000.00
  }'

# 3. Agregar movimiento
curl -X POST http://localhost:8080/api/v1/expedientes/64f8a123b2c3d4e5f6789013/movimientos \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "actuacion",
    "descripcion": "Demanda admitida a trámite",
    "fecha": "2024-01-15T10:30:00Z"
  }'
```

### Búsqueda avanzada de expedientes

```bash
curl -X GET "http://localhost:8080/api/v1/expedientes?search=EXP-2024&status=activo&date_from=2024-01-01&limit=20" \
  -H "Authorization: Bearer eyJ..."
```

### Generar reporte en PDF

```bash
curl -X GET "http://localhost:8080/api/v1/reports/expedientes?date_from=2024-01-01&date_to=2024-01-31&format=pdf" \
  -H "Authorization: Bearer eyJ..." \
  --output reporte_enero_2024.pdf
```

## 🔧 Rate Limiting

- **Login**: 5 intentos por minuto por IP
- **API General**: 1000 requests por hora por usuario
- **Reportes**: 10 requests por minuto por usuario

## 📋 Versionado

- Versionado semántico: `v1.0.0`
- Backward compatibility garantizada en versiones menores
- Deprecation warnings en headers: `X-API-Deprecated: true`

---

**Documentación generada automáticamente desde OpenAPI specs**  
**Última actualización**: 2024-11-02