# Modelo de Datos - Sistema de Expedientes Judiciales

**Versión:** 1.0.0  
**Fecha:** 2024-11-02  
**Base de Datos:** MongoDB 6.0+

## 📋 Índice

1. [Convenciones Generales](#convenciones-generales)
2. [Colecciones Principales](#colecciones-principales)
3. [Relaciones entre Entidades](#relaciones-entre-entidades)
4. [Índices y Optimizaciones](#índices-y-optimizaciones)
5. [Validaciones](#validaciones)
6. [Ejemplos de Documentos](#ejemplos-de-documentos)

---

## Convenciones Generales

### Nomenclatura

- **Colecciones:** Nombres en plural, snake_case (e.g., `users`, `expedientes`, `audit_logs`)
- **Campos:** camelCase para JavaScript/TypeScript, snake_case para Go
- **IDs:** ObjectId de MongoDB (`_id`)
- **Referencias:** Campos terminados en `Id` o `Ids` (e.g., `userId`, `juzgadoIds`)

### Campos Comunes

Todos los documentos principales incluyen:

```typescript
{
  _id: ObjectId,
  createdAt: Date,      // Timestamp de creación
  updatedAt: Date,      // Timestamp de última modificación
  createdBy: ObjectId,  // Referencia al usuario que creó
  updatedBy: ObjectId   // Referencia al usuario que modificó
}
```

### Soft Delete

Las entidades críticas usan soft delete:

```typescript
{
  deletedAt?: Date,     // null si no está eliminado
  deletedBy?: ObjectId  // Usuario que eliminó
}
```

---

## Colecciones Principales

### 1. users & profiles

**Descripción:** Los usuarios ahora se definen por `profiles` (perfiles). Cada `Profile` agrupa un conjunto de `roles` (permisos) —por ejemplo, el perfil `administrador` contiene permisos como `crear`, `eliminar`, `actualizar`, `leer`, `imprimir`, `exportar`, `importar`, `ver`. Al crear un usuario se le asigna un `profile_id` y opcionalmente una lista `roles` explícita que puede añadir o quitar permisos adicionales.

**Esquema TypeScript (Users):**

```typescript
interface User {
  _id: ObjectId;
  email: string;                    // Único, índice
  password: string;                 // Hash bcrypt
  firstName: string;
  lastName: string;
  profileId?: ObjectId;             // Referencia a profiles
  roles?: string[];                 // Permisos explícitos en el usuario
  isActive: boolean;                // Cuenta activa/inactiva
  lastLogin?: Date;                 // Última sesión
  avatar?: string;                  // URL o path
  phone?: string;
  address?: string;
  preferences?: UserPreferences;    // Configuraciones personales
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  deletedBy?: ObjectId;
}

interface Profile {
  _id: ObjectId;
  name: string;                     // e.g. "Administrador"
  slug: string;                     // e.g. "administrador"
  roles: string[];                  // Lista de permisos asociados al perfil
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type UserRole = string; // ahora cada permiso es una cadena (ej: 'crear', 'leer', 'exportar')

interface UserPreferences {
  theme: 'light' | 'dark';
  language: 'es' | 'en';
  notificationsEnabled: boolean;
  emailNotifications: boolean;
}
```

**Esquema Go (Users & Profiles):**

```go
type User struct {
    ID          primitive.ObjectID  `bson:"_id,omitempty" json:"id"`
    Email       string              `bson:"email" json:"email" validate:"required,email"`
    Password    string              `bson:"password" json:"-"`
    FirstName   string              `bson:"firstName" json:"firstName" validate:"required"`
    LastName    string              `bson:"lastName" json:"lastName" validate:"required"`
    ProfileID   primitive.ObjectID  `bson:"profile_id,omitempty" json:"profile_id,omitempty"`
    Roles       []string            `bson:"roles,omitempty" json:"roles,omitempty"`
    IsActive    bool                `bson:"isActive" json:"isActive"`
    LastLogin   *time.Time          `bson:"lastLogin,omitempty" json:"lastLogin,omitempty"`
    Avatar      string              `bson:"avatar,omitempty" json:"avatar,omitempty"`
    Phone       string              `bson:"phone,omitempty" json:"phone,omitempty"`
    Address     string              `bson:"address,omitempty" json:"address,omitempty"`
    Preferences *UserPreferences    `bson:"preferences,omitempty" json:"preferences,omitempty"`
    CreatedAt   time.Time           `bson:"createdAt" json:"createdAt"`
    UpdatedAt   time.Time           `bson:"updatedAt" json:"updatedAt"`
    DeletedAt   *time.Time          `bson:"deletedAt,omitempty" json:"deletedAt,omitempty"`
    DeletedBy   *primitive.ObjectID `bson:"deletedBy,omitempty" json:"deletedBy,omitempty"`
}

type Profile struct {
    ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
    Name      string             `bson:"name" json:"name"`
    Slug      string             `bson:"slug" json:"slug"`
    Roles     []string           `bson:"roles" json:"roles"`
    Active    bool               `bson:"active" json:"active"`
    CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
    UpdatedAt time.Time          `bson:"updatedAt" json:"updatedAt"`
}
```

**Validaciones MongoDB (sugeridas):**

```javascript
db.createCollection("profiles", {});

db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "password", "firstName", "lastName", "isActive"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "Email válido requerido"
        },
        password: {
          bsonType: "string",
          minLength: 60,
          description: "Password hasheado con bcrypt"
        },
        firstName: { bsonType: "string", minLength: 2, maxLength: 50 },
        lastName:  { bsonType: "string", minLength: 2, maxLength: 50 },
        profile_id: { bsonType: ["objectId", "null"] },
        roles: { bsonType: ["array"], items: { bsonType: "string" } },
        isActive: { bsonType: "bool" }
      }
    }
  }
});
```

---

### 2. expedientes

**Descripción:** Almacena información de expedientes judiciales.

**Esquema TypeScript:**

```typescript
interface Expediente {
  _id: ObjectId;
  grado: string;                    // Grado militar o académico
  apellidosNombres: string;         // Nombres y apellidos completos
  numeroPaginas: number;            // Número de páginas del expediente
  situacionMilitar: string;         // Situación militar del expediente
  cip: string;                      // Código de identificación personal
  estado: ExpedienteEstado;         // 'dentro' | 'fuera'
  ubicacion: string;                // Ubicación física del expediente
  fechaRegistro: Date;              // Fecha de registro del expediente
  fechaActualizacion: Date;         // Fecha de última actualización
  orden: number;                    // Número de orden del expediente
  createdAt: Date;
  updatedAt: Date;
  createdBy: ObjectId;
  updatedBy: ObjectId;
  deletedAt?: Date;
  deletedBy?: ObjectId;
}

type ExpedienteEstado = 'dentro' | 'fuera';

interface Parte {
  tipo: 'persona' | 'empresa';
  nombre: string;
  apellido?: string;                // Solo para persona
  razonSocial?: string;             // Solo para empresa
  documentoTipo: string;            // 'DNI' | 'RUC' | 'CE' | 'Pasaporte'
  documentoNumero: string;
  direccion: string;
  telefono?: string;
  email?: string;
  representante?: string;           // Para empresas
}
```

**Esquema Go:**

```go
type Expediente struct {
    ID                  primitive.ObjectID  `bson:"_id,omitempty" json:"id"`
    Grado               string              `bson:"grado" json:"grado" validate:"required"`
    ApellidosNombres    string              `bson:"apellidos_nombres" json:"apellidos_nombres" validate:"required"`
    NumeroPaginas       int                 `bson:"numero_paginas" json:"numero_paginas" validate:"required,min=1"`
    SituacionMilitar    string              `bson:"situacion_militar" json:"situacion_militar" validate:"required"`
    CIP                 string              `bson:"cip" json:"cip" validate:"required"`
    Estado              string              `bson:"estado" json:"estado" validate:"required,oneof=dentro fuera"`
    Ubicacion           string              `bson:"ubicacion" json:"ubicacion" validate:"required"`
    FechaRegistro       time.Time           `bson:"fecha_registro" json:"fecha_registro" validate:"required"`
    FechaActualizacion  time.Time           `bson:"fecha_actualizacion" json:"fecha_actualizacion" validate:"required"`
    Orden               int                 `bson:"orden" json:"orden" validate:"required,min=1"`
    CreatedAt           time.Time           `bson:"createdAt" json:"createdAt"`
    UpdatedAt           time.Time           `bson:"updatedAt" json:"updatedAt"`
    CreatedBy           primitive.ObjectID  `bson:"createdBy" json:"createdBy"`
    UpdatedBy           primitive.ObjectID  `bson:"updatedBy" json:"updatedBy"`
    DeletedAt           *time.Time          `bson:"deletedAt,omitempty" json:"deletedAt,omitempty"`
    DeletedBy           *primitive.ObjectID `bson:"deletedBy,omitempty" json:"deletedBy,omitempty"`
}
    Ubicacion           string              `bson:"ubicacion" json:"ubicacion" validate:"required"`
    FechaRegistro       time.Time           `bson:"fecha_registro" json:"fecha_registro" validate:"required"`
    FechaActualizacion  time.Time           `bson:"fecha_actualizacion" json:"fecha_actualizacion" validate:"required"`
    CreatedAt           time.Time           `bson:"createdAt" json:"createdAt"`
    UpdatedAt           time.Time           `bson:"updatedAt" json:"updatedAt"`
    CreatedBy           primitive.ObjectID  `bson:"createdBy" json:"createdBy"`
    UpdatedBy           primitive.ObjectID  `bson:"updatedBy" json:"updatedBy"`
    DeletedAt           *time.Time          `bson:"deletedAt,omitempty" json:"deletedAt,omitempty"`
    DeletedBy           *primitive.ObjectID `bson:"deletedBy,omitempty" json:"deletedBy,omitempty"`
}

type Parte struct {
    Tipo            string `bson:"tipo" json:"tipo" validate:"required,oneof=persona empresa"`
    Nombre          string `bson:"nombre" json:"nombre" validate:"required"`
    Apellido        string `bson:"apellido,omitempty" json:"apellido,omitempty"`
    RazonSocial     string `bson:"razonSocial,omitempty" json:"razonSocial,omitempty"`
    DocumentoTipo   string `bson:"documentoTipo" json:"documentoTipo" validate:"required"`
    DocumentoNumero string `bson:"documentoNumero" json:"documentoNumero" validate:"required"`
    Direccion       string `bson:"direccion" json:"direccion" validate:"required"`
    Telefono        string `bson:"telefono,omitempty" json:"telefono,omitempty"`
    Email           string `bson:"email,omitempty" json:"email,omitempty"`
    Representante   string `bson:"representante,omitempty" json:"representante,omitempty"`
}
```

**Validaciones MongoDB:**

```javascript
db.createCollection("expedientes", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["grado", "apellidos_nombres", "numero_paginas", "situacion_militar", 
                 "cip", "estado", "ubicacion", "fecha_registro", "fecha_actualizacion", "orden"],
      properties: {
        grado: {
          bsonType: "string",
          minLength: 1,
          description: "Grado militar o académico requerido"
        },
        apellidos_nombres: {
          bsonType: "string",
          minLength: 3,
          description: "Nombres y apellidos completos requeridos"
        },
        numero_paginas: {
          bsonType: "int",
          minimum: 1,
          description: "Número de páginas debe ser mayor a 0"
        },
        situacion_militar: {
          bsonType: "string",
          minLength: 1,
          description: "Situación militar requerida"
        },
        cip: {
          bsonType: "string",
          minLength: 1,
          description: "CIP requerido"
        },
        estado: {
          enum: ["dentro", "fuera"]
        },
        ubicacion: {
          bsonType: "string",
          minLength: 1,
          description: "Ubicación física requerida"
        },
        fecha_registro: {
          bsonType: "date",
          description: "Fecha de registro requerida"
        },
        fecha_actualizacion: {
          bsonType: "date",
          description: "Fecha de actualización requerida"
        },
        orden: {
          bsonType: "int",
          minimum: 1,
          description: "Número de orden debe ser mayor a 0"
        }
      }
    }
  }
});
```

---

### 3. movimientos

**Descripción:** Registra todos los movimientos/actuaciones de un expediente.

**Esquema TypeScript:**

```typescript
interface Movimiento {
  _id: ObjectId;
  expedienteId: ObjectId;           // Referencia a expedientes
  numero: number;                   // Número correlativo por expediente
  tipo: MovimientoTipo;             // 'audiencia' | 'resolucion' | 'escrito' | 'notificacion' | 'otro'
  descripcion: string;
  fecha: Date;                      // Fecha del movimiento
  ubicacion?: string;               // Sala, juzgado, etc.
  estado: MovimientoEstado;         // 'pendiente' | 'realizado' | 'cancelado'
  responsableId?: ObjectId;         // Usuario responsable
  documentoIds?: ObjectId[];        // Referencias a documentos adjuntos
  observaciones?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: ObjectId;
  updatedBy: ObjectId;
}

type MovimientoTipo = 'audiencia' | 'resolucion' | 'escrito' | 'notificacion' | 'diligencia' | 'otro';
type MovimientoEstado = 'pendiente' | 'realizado' | 'cancelado';
```

**Esquema Go:**

```go
type Movimiento struct {
    ID            primitive.ObjectID   `bson:"_id,omitempty" json:"id"`
    ExpedienteID  primitive.ObjectID   `bson:"expedienteId" json:"expedienteId" validate:"required"`
    Numero        int                  `bson:"numero" json:"numero"`
    Tipo          string               `bson:"tipo" json:"tipo" validate:"required,oneof=audiencia resolucion escrito notificacion diligencia otro"`
    Descripcion   string               `bson:"descripcion" json:"descripcion" validate:"required"`
    Fecha         time.Time            `bson:"fecha" json:"fecha" validate:"required"`
    Ubicacion     string               `bson:"ubicacion,omitempty" json:"ubicacion,omitempty"`
    Estado        string               `bson:"estado" json:"estado" validate:"required,oneof=pendiente realizado cancelado"`
    ResponsableID *primitive.ObjectID  `bson:"responsableId,omitempty" json:"responsableId,omitempty"`
    DocumentoIDs  []primitive.ObjectID `bson:"documentoIds,omitempty" json:"documentoIds,omitempty"`
    Observaciones string               `bson:"observaciones,omitempty" json:"observaciones,omitempty"`
    Metadata      map[string]any       `bson:"metadata,omitempty" json:"metadata,omitempty"`
    CreatedAt     time.Time            `bson:"createdAt" json:"createdAt"`
    UpdatedAt     time.Time            `bson:"updatedAt" json:"updatedAt"`
    CreatedBy     primitive.ObjectID   `bson:"createdBy" json:"createdBy"`
    UpdatedBy     primitive.ObjectID   `bson:"updatedBy" json:"updatedBy"`
}
```

**Validaciones MongoDB:**

```javascript
db.createCollection("movimientos", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["expedienteId", "numero", "tipo", "descripcion", "fecha", "estado"],
      properties: {
        expedienteId: { bsonType: "objectId" },
        numero: { bsonType: "int", minimum: 1 },
        tipo: {
          enum: ["audiencia", "resolucion", "escrito", "notificacion", "diligencia", "otro"]
        },
        estado: {
          enum: ["pendiente", "realizado", "cancelado"]
        },
        fecha: { bsonType: "date" }
      }
    }
  }
});
```

---

### 4. documentos

**Descripción:** Almacena información de documentos adjuntos.

**Esquema TypeScript:**

```typescript
interface Documento {
  _id: ObjectId;
  expedienteId: ObjectId;           // Referencia a expedientes
  movimientoId?: ObjectId;          // Referencia opcional a movimientos
  nombre: string;                   // Nombre del archivo
  nombreOriginal: string;           // Nombre original del archivo
  tipo: DocumentoTipo;              // 'demanda' | 'escrito' | 'resolucion' | 'notificacion' | 'otro'
  mimeType: string;                 // 'application/pdf', 'image/png', etc.
  tamaño: number;                   // Tamaño en bytes
  path: string;                     // Ruta de almacenamiento
  url?: string;                     // URL de acceso (si se usa storage externo)
  descripcion?: string;
  tags?: string[];
  metadata?: {
    width?: number;                 // Para imágenes
    height?: number;
    pages?: number;                 // Para PDFs
    duration?: number;              // Para videos
  };
  createdAt: Date;
  createdBy: ObjectId;
  deletedAt?: Date;
  deletedBy?: ObjectId;
}

type DocumentoTipo = 'demanda' | 'escrito' | 'resolucion' | 'notificacion' | 'prueba' | 'otro';
```

**Esquema Go:**

```go
type Documento struct {
    ID              primitive.ObjectID  `bson:"_id,omitempty" json:"id"`
    ExpedienteID    primitive.ObjectID  `bson:"expedienteId" json:"expedienteId" validate:"required"`
    MovimientoID    *primitive.ObjectID `bson:"movimientoId,omitempty" json:"movimientoId,omitempty"`
    Nombre          string              `bson:"nombre" json:"nombre" validate:"required"`
    NombreOriginal  string              `bson:"nombreOriginal" json:"nombreOriginal" validate:"required"`
    Tipo            string              `bson:"tipo" json:"tipo" validate:"required"`
    MimeType        string              `bson:"mimeType" json:"mimeType" validate:"required"`
    Tamaño          int64               `bson:"tamaño" json:"tamaño" validate:"required"`
    Path            string              `bson:"path" json:"path" validate:"required"`
    URL             string              `bson:"url,omitempty" json:"url,omitempty"`
    Descripcion     string              `bson:"descripcion,omitempty" json:"descripcion,omitempty"`
    Tags            []string            `bson:"tags,omitempty" json:"tags,omitempty"`
    Metadata        *DocumentoMetadata  `bson:"metadata,omitempty" json:"metadata,omitempty"`
    CreatedAt       time.Time           `bson:"createdAt" json:"createdAt"`
    CreatedBy       primitive.ObjectID  `bson:"createdBy" json:"createdBy"`
    DeletedAt       *time.Time          `bson:"deletedAt,omitempty" json:"deletedAt,omitempty"`
    DeletedBy       *primitive.ObjectID `bson:"deletedBy,omitempty" json:"deletedBy,omitempty"`
}

type DocumentoMetadata struct {
    Width    *int `bson:"width,omitempty" json:"width,omitempty"`
    Height   *int `bson:"height,omitempty" json:"height,omitempty"`
    Pages    *int `bson:"pages,omitempty" json:"pages,omitempty"`
    Duration *int `bson:"duration,omitempty" json:"duration,omitempty"`
}
```

---

### 5. juzgados

**Descripción:** Catálogo de juzgados.

**Esquema TypeScript:**

```typescript
interface Juzgado {
  _id: ObjectId;
  nombre: string;                   // Nombre completo del juzgado
  tipo: JuzgadoTipo;                // 'civil' | 'penal' | 'laboral' | 'familia' | 'comercial' | 'mixto'
  codigo: string;                   // Código único, e.g., "JUZ-CIV-001"
  distrito?: string;                // Distrito judicial
  provincia?: string;
  departamento?: string;
  direccion: string;
  telefono?: string;
  email?: string;
  juez?: string;                    // Nombre del juez titular
  secretario?: string;              // Nombre del secretario
  isActivo: boolean;                // Juzgado activo/inactivo
  horarioAtencion?: {
    dias: string[];                 // ['lunes', 'martes', ...]
    horaInicio: string;             // '08:00'
    horaFin: string;                // '17:00'
  };
  observaciones?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: ObjectId;
  updatedBy: ObjectId;
}

type JuzgadoTipo = 'civil' | 'penal' | 'laboral' | 'familia' | 'comercial' | 'mixto';
```

**Esquema Go:**

```go
type Juzgado struct {
    ID                primitive.ObjectID `bson:"_id,omitempty" json:"id"`
    Nombre            string             `bson:"nombre" json:"nombre" validate:"required"`
    Tipo              string             `bson:"tipo" json:"tipo" validate:"required,oneof=civil penal laboral familia comercial mixto"`
    Codigo            string             `bson:"codigo" json:"codigo" validate:"required"`
    Distrito          string             `bson:"distrito,omitempty" json:"distrito,omitempty"`
    Provincia         string             `bson:"provincia,omitempty" json:"provincia,omitempty"`
    Departamento      string             `bson:"departamento,omitempty" json:"departamento,omitempty"`
    Direccion         string             `bson:"direccion" json:"direccion" validate:"required"`
    Telefono          string             `bson:"telefono,omitempty" json:"telefono,omitempty"`
    Email             string             `bson:"email,omitempty" json:"email,omitempty"`
    Juez              string             `bson:"juez,omitempty" json:"juez,omitempty"`
    Secretario        string             `bson:"secretario,omitempty" json:"secretario,omitempty"`
    IsActivo          bool               `bson:"isActivo" json:"isActivo"`
    HorarioAtencion   *HorarioAtencion   `bson:"horarioAtencion,omitempty" json:"horarioAtencion,omitempty"`
    Observaciones     string             `bson:"observaciones,omitempty" json:"observaciones,omitempty"`
    CreatedAt         time.Time          `bson:"createdAt" json:"createdAt"`
    UpdatedAt         time.Time          `bson:"updatedAt" json:"updatedAt"`
    CreatedBy         primitive.ObjectID `bson:"createdBy" json:"createdBy"`
    UpdatedBy         primitive.ObjectID `bson:"updatedBy" json:"updatedBy"`
}

type HorarioAtencion struct {
    Dias       []string `bson:"dias" json:"dias"`
    HoraInicio string   `bson:"horaInicio" json:"horaInicio"`
    HoraFin    string   `bson:"horaFin" json:"horaFin"`
}
```

---

### 6. notificaciones

**Descripción:** Sistema de notificaciones para usuarios.

**Esquema TypeScript:**

```typescript
interface Notificacion {
  _id: ObjectId;
  userId: ObjectId;                 // Usuario destinatario
  tipo: NotificacionTipo;           // 'expediente' | 'movimiento' | 'documento' | 'sistema'
  titulo: string;
  mensaje: string;
  icono?: string;
  link?: string;                    // URL para navegar al hacer clic
  referenciaId?: ObjectId;          // ID del objeto relacionado
  referenciaModelo?: string;        // 'Expediente' | 'Movimiento' | etc.
  prioridad: NotificacionPrioridad; // 'baja' | 'media' | 'alta'
  leido: boolean;
  fechaLeido?: Date;
  createdAt: Date;
}

type NotificacionTipo = 'expediente' | 'movimiento' | 'documento' | 'usuario' | 'sistema';
type NotificacionPrioridad = 'baja' | 'media' | 'alta';
```

**Esquema Go:**

```go
type Notificacion struct {
    ID               primitive.ObjectID  `bson:"_id,omitempty" json:"id"`
    UserID           primitive.ObjectID  `bson:"userId" json:"userId" validate:"required"`
    Tipo             string              `bson:"tipo" json:"tipo" validate:"required"`
    Titulo           string              `bson:"titulo" json:"titulo" validate:"required"`
    Mensaje          string              `bson:"mensaje" json:"mensaje" validate:"required"`
    Icono            string              `bson:"icono,omitempty" json:"icono,omitempty"`
    Link             string              `bson:"link,omitempty" json:"link,omitempty"`
    ReferenciaID     *primitive.ObjectID `bson:"referenciaId,omitempty" json:"referenciaId,omitempty"`
    ReferenciaModelo string              `bson:"referenciaModelo,omitempty" json:"referenciaModelo,omitempty"`
    Prioridad        string              `bson:"prioridad" json:"prioridad" validate:"required,oneof=baja media alta"`
    Leido            bool                `bson:"leido" json:"leido"`
    FechaLeido       *time.Time          `bson:"fechaLeido,omitempty" json:"fechaLeido,omitempty"`
    CreatedAt        time.Time           `bson:"createdAt" json:"createdAt"`
}
```

---

### 7. sessions

**Descripción:** Gestión de sesiones y tokens JWT.

**Esquema TypeScript:**

```typescript
interface Session {
  _id: ObjectId;
  userId: ObjectId;                 // Referencia a users
  refreshToken: string;             // JWT refresh token
  accessToken: string;              // JWT access token (opcional)
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  lastActivity: Date;
  expiresAt: Date;
  createdAt: Date;
}
```

**Esquema Go:**

```go
type Session struct {
    ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
    UserID       primitive.ObjectID `bson:"userId" json:"userId" validate:"required"`
    RefreshToken string             `bson:"refreshToken" json:"refreshToken" validate:"required"`
    AccessToken  string             `bson:"accessToken,omitempty" json:"accessToken,omitempty"`
    IPAddress    string             `bson:"ipAddress" json:"ipAddress"`
    UserAgent    string             `bson:"userAgent" json:"userAgent"`
    IsActive     bool               `bson:"isActive" json:"isActive"`
    LastActivity time.Time          `bson:"lastActivity" json:"lastActivity"`
    ExpiresAt    time.Time          `bson:"expiresAt" json:"expiresAt"`
    CreatedAt    time.Time          `bson:"createdAt" json:"createdAt"`
}
```

---

### 8. audit_logs

**Descripción:** Registro de auditoría de todas las operaciones críticas.

**Esquema TypeScript:**

```typescript
interface AuditLog {
  _id: ObjectId;
  userId?: ObjectId;                // Usuario que realizó la acción (null para sistema)
  action: AuditAction;              // 'create' | 'update' | 'delete' | 'login' | 'logout'
  collection: string;               // Colección afectada
  documentId?: ObjectId;            // ID del documento afectado
  changes?: {
    before?: Record<string, any>;   // Estado anterior
    after?: Record<string, any>;    // Estado nuevo
  };
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
  };
  timestamp: Date;
}

type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'download' | 'view';
```

**Esquema Go:**

```go
type AuditLog struct {
    ID         primitive.ObjectID  `bson:"_id,omitempty" json:"id"`
    UserID     *primitive.ObjectID `bson:"userId,omitempty" json:"userId,omitempty"`
    Action     string              `bson:"action" json:"action" validate:"required"`
    Collection string              `bson:"collection" json:"collection" validate:"required"`
    DocumentID *primitive.ObjectID `bson:"documentId,omitempty" json:"documentId,omitempty"`
    Changes    *AuditChanges       `bson:"changes,omitempty" json:"changes,omitempty"`
    Metadata   *AuditMetadata      `bson:"metadata,omitempty" json:"metadata,omitempty"`
    Timestamp  time.Time           `bson:"timestamp" json:"timestamp"`
}

type AuditChanges struct {
    Before map[string]any `bson:"before,omitempty" json:"before,omitempty"`
    After  map[string]any `bson:"after,omitempty" json:"after,omitempty"`
}

type AuditMetadata struct {
    IPAddress string `bson:"ipAddress,omitempty" json:"ipAddress,omitempty"`
    UserAgent string `bson:"userAgent,omitempty" json:"userAgent,omitempty"`
    RequestID string `bson:"requestId,omitempty" json:"requestId,omitempty"`
}
```

---

## Relaciones entre Entidades

### Diagrama ER (Entidad-Relación)

```
┌─────────────┐
│   users     │
└──────┬──────┘
       │
       │ 1:N (created)
       │
       ├────────────────┐
       │                │
       ▼                ▼
┌─────────────┐   ┌──────────────┐
│ expedientes │   │  juzgados    │
└──────┬──────┘   └──────────────┘
       │                │
       │ 1:N            │ 1:N
       │                │
       ├────────────────┤
       │                │
       ▼                ▼
┌─────────────┐   ┌──────────────┐
│ movimientos │   │ notificaciones│
└──────┬──────┘   └──────────────┘
       │
       │ 1:N
       │
       ▼
┌─────────────┐
│ documentos  │
└─────────────┘
```

### Relaciones Detalladas

#### users → expedientes
- **Tipo:** 1:N (Un usuario puede crear/manejar múltiples expedientes)
- **Campos:** `expedientes.abogadoId` → `users._id`
- **Integridad:** No eliminar usuario si tiene expedientes activos

#### expedientes → movimientos
- **Tipo:** 1:N (Un expediente tiene múltiples movimientos)
- **Campos:** `movimientos.expedienteId` → `expedientes._id`
- **Cascada:** Eliminar movimientos al eliminar expediente

#### expedientes → documentos
- **Tipo:** 1:N (Un expediente tiene múltiples documentos)
- **Campos:** `documentos.expedienteId` → `expedientes._id`
- **Cascada:** Eliminar documentos al eliminar expediente

#### movimientos → documentos
- **Tipo:** 1:N (Un movimiento puede tener múltiples documentos adjuntos)
- **Campos:** `movimientos.documentoIds` → `documentos._id` (array)
- **Opcional:** Un documento puede existir sin movimiento

#### juzgados → expedientes
- **Tipo:** 1:N (Un juzgado tiene múltiples expedientes)
- **Campos:** `expedientes.juzgadoId` → `juzgados._id`
- **Integridad:** No eliminar juzgado si tiene expedientes activos

#### users → notificaciones
- **Tipo:** 1:N (Un usuario tiene múltiples notificaciones)
- **Campos:** `notificaciones.userId` → `users._id`
- **Cascada:** Eliminar notificaciones al eliminar usuario

#### users → sessions
- **Tipo:** 1:N (Un usuario puede tener múltiples sesiones activas)
- **Campos:** `sessions.userId` → `users._id`
- **Cascada:** Eliminar sesiones al eliminar usuario

---

## Índices y Optimizaciones

### users

```javascript
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ isActive: 1 });
db.users.createIndex({ deletedAt: 1 });
db.users.createIndex({ createdAt: -1 });
```

### expedientes

```javascript
// Índice único para número de expediente
db.expedientes.createIndex({ numero: 1 }, { unique: true });

// Índices para búsquedas frecuentes
db.expedientes.createIndex({ juzgadoId: 1 });
db.expedientes.createIndex({ abogadoId: 1 });
db.expedientes.createIndex({ estado: 1 });
db.expedientes.createIndex({ tipo: 1 });
db.expedientes.createIndex({ fechaInicio: -1 });

// Índice compuesto para filtros múltiples
db.expedientes.createIndex({ estado: 1, tipo: 1, juzgadoId: 1 });

// Índice de texto completo para búsqueda
db.expedientes.createIndex({
  numero: "text",
  materia: "text",
  "demandante.nombre": "text",
  "demandante.apellido": "text",
  "demandado.nombre": "text",
  "demandado.apellido": "text",
  observaciones: "text"
}, {
  weights: {
    numero: 10,
    "demandante.nombre": 5,
    "demandado.nombre": 5,
    materia: 3
  },
  name: "expedientes_search"
});

// Índice para soft delete
db.expedientes.createIndex({ deletedAt: 1 });

// Índice TTL para archivado automático (opcional)
db.expedientes.createIndex(
  { fechaConclusión: 1 },
  { expireAfterSeconds: 157680000 } // 5 años
);
```

### movimientos

```javascript
db.movimientos.createIndex({ expedienteId: 1, numero: 1 }, { unique: true });
db.movimientos.createIndex({ expedienteId: 1, fecha: -1 });
db.movimientos.createIndex({ tipo: 1 });
db.movimientos.createIndex({ estado: 1 });
db.movimientos.createIndex({ fecha: -1 });
db.movimientos.createIndex({ responsableId: 1 });
```

### documentos

```javascript
db.documentos.createIndex({ expedienteId: 1 });
db.documentos.createIndex({ movimientoId: 1 });
db.documentos.createIndex({ tipo: 1 });
db.documentos.createIndex({ createdAt: -1 });
db.documentos.createIndex({ deletedAt: 1 });

// Índice de texto para búsqueda de documentos
db.documentos.createIndex({
  nombre: "text",
  nombreOriginal: "text",
  descripcion: "text"
}, { name: "documentos_search" });
```

### juzgados

```javascript
db.juzgados.createIndex({ codigo: 1 }, { unique: true });
db.juzgados.createIndex({ tipo: 1 });
db.juzgados.createIndex({ isActivo: 1 });
db.juzgados.createIndex({ departamento: 1, provincia: 1 });
```

### notificaciones

```javascript
db.notificaciones.createIndex({ userId: 1, leido: 1 });
db.notificaciones.createIndex({ userId: 1, createdAt: -1 });
db.notificaciones.createIndex({ tipo: 1 });

// TTL index - eliminar notificaciones leídas después de 30 días
db.notificaciones.createIndex(
  { fechaLeido: 1 },
  { expireAfterSeconds: 2592000, partialFilterExpression: { leido: true } }
);
```

### sessions

```javascript
db.sessions.createIndex({ userId: 1 });
db.sessions.createIndex({ refreshToken: 1 });
db.sessions.createIndex({ isActive: 1 });

// TTL index - eliminar sesiones expiradas automáticamente
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

### audit_logs

```javascript
db.audit_logs.createIndex({ userId: 1, timestamp: -1 });
db.audit_logs.createIndex({ collection: 1, documentId: 1 });
db.audit_logs.createIndex({ action: 1 });
db.audit_logs.createIndex({ timestamp: -1 });

// TTL index - eliminar logs después de 2 años
db.audit_logs.createIndex(
  { timestamp: 1 },
  { expireAfterSeconds: 63072000 }
);
```

---

## Validaciones

### Validaciones a Nivel de Aplicación

**Backend (Go):**
```go
// Usando validator
import "github.com/go-playground/validator/v10"

var validate = validator.New()

func ValidateUser(user *User) error {
    return validate.Struct(user)
}
```

**Frontend (TypeScript):**
```typescript
// Usando Zod
import { z } from 'zod';

const expedienteSchema = z.object({
  numero: z.string().regex(/^EXP-\d{4}-\d{4}$/),
  tipo: z.enum(['civil', 'penal', 'laboral', 'familia', 'comercial']),
  materia: z.string().min(3).max(200),
  demandante: parteSchema,
  demandado: parteSchema,
  // ... más campos
});

type ExpedienteFormData = z.infer<typeof expedienteSchema>;
```

### Validaciones Personalizadas

**Email único:**
```javascript
// Antes de insertar
const existingUser = await db.users.findOne({ email: newEmail });
if (existingUser) {
  throw new Error('Email ya registrado');
}
```

**Numeración correlativa:**
```javascript
// Para movimientos
const lastMovimiento = await db.movimientos
  .find({ expedienteId })
  .sort({ numero: -1 })
  .limit(1)
  .toArray();

const nextNumero = lastMovimiento[0] ? lastMovimiento[0].numero + 1 : 1;
```

**Validación de roles:**
```javascript
const ROLE_PERMISSIONS = {
  admin: ['*'],
  abogado: ['expedientes:*', 'movimientos:*', 'documentos:*'],
  secretario: ['expedientes:read', 'movimientos:*', 'documentos:*'],
  viewer: ['expedientes:read', 'movimientos:read', 'documentos:read']
};

function hasPermission(userRole: string, action: string): boolean {
  const permissions = ROLE_PERMISSIONS[userRole];
  return permissions.includes('*') || permissions.includes(action);
}
```

---

## Ejemplos de Documentos

### Ejemplo: Usuario Completo

```json
{
  "_id": ObjectId("6543210fedcba9876543210f"),
  "email": "juan.perez@example.com",
  "password": "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
  "firstName": "Juan",
  "lastName": "Pérez",
  "role": "abogado",
  "isActive": true,
  "lastLogin": ISODate("2024-11-02T10:30:00Z"),
  "avatar": "/uploads/avatars/juan-perez.jpg",
  "phone": "+51 987654321",
  "address": "Av. Principal 123, Lima",
  "preferences": {
    "theme": "light",
    "language": "es",
    "notificationsEnabled": true,
    "emailNotifications": true
  },
  "createdAt": ISODate("2024-01-15T08:00:00Z"),
  "updatedAt": ISODate("2024-11-02T10:30:00Z")
}
```

### Ejemplo: Expediente Completo

```json
{
  "_id": ObjectId("6543210fedcba9876543210a"),
  "numero": "EXP-2024-0001",
  "juzgadoId": ObjectId("6543210fedcba9876543210b"),
  "tipo": "civil",
  "materia": "Indemnización por daños y perjuicios",
  "estado": "activo",
  "prioridad": "media",
  "demandante": {
    "tipo": "persona",
    "nombre": "María",
    "apellido": "González",
    "documentoTipo": "DNI",
    "documentoNumero": "12345678",
    "direccion": "Jr. Los Olivos 456, Lima",
    "telefono": "+51 912345678",
    "email": "maria.gonzalez@email.com"
  },
  "demandado": {
    "tipo": "empresa",
    "nombre": "Constructora ABC",
    "razonSocial": "Constructora ABC S.A.C.",
    "documentoTipo": "RUC",
    "documentoNumero": "20123456789",
    "direccion": "Av. Industrial 789, Lima",
    "telefono": "+51 987654321",
    "email": "contacto@constructoraabc.com",
    "representante": "Carlos Ruiz"
  },
  "abogadoId": ObjectId("6543210fedcba9876543210f"),
  "fechaInicio": ISODate("2024-01-20T00:00:00Z"),
  "valorCuantia": 50000.00,
  "observaciones": "Caso de daños estructurales en vivienda",
  "tags": ["construcción", "indemnización", "vivienda"],
  "metadata": {
    "priorizado": true,
    "categoria": "alta_cuantia"
  },
  "createdAt": ISODate("2024-01-20T09:15:00Z"),
  "updatedAt": ISODate("2024-11-02T11:00:00Z"),
  "createdBy": ObjectId("6543210fedcba9876543210f"),
  "updatedBy": ObjectId("6543210fedcba9876543210f")
}
```

### Ejemplo: Movimiento Completo

```json
{
  "_id": ObjectId("6543210fedcba9876543210c"),
  "expedienteId": ObjectId("6543210fedcba9876543210a"),
  "numero": 1,
  "tipo": "audiencia",
  "descripcion": "Audiencia de conciliación",
  "fecha": ISODate("2024-02-15T14:00:00Z"),
  "ubicacion": "Sala 3, Juzgado Civil",
  "estado": "realizado",
  "responsableId": ObjectId("6543210fedcba9876543210f"),
  "documentoIds": [
    ObjectId("6543210fedcba9876543210d"),
    ObjectId("6543210fedcba9876543210e")
  ],
  "observaciones": "Partes no llegaron a acuerdo, se programará audiencia de juzgamiento",
  "metadata": {
    "duracion": 120,
    "asistentes": ["María González", "Carlos Ruiz", "Juez Martínez"]
  },
  "createdAt": ISODate("2024-02-01T10:00:00Z"),
  "updatedAt": ISODate("2024-02-15T16:30:00Z"),
  "createdBy": ObjectId("6543210fedcba9876543210f"),
  "updatedBy": ObjectId("6543210fedcba9876543210f")
}
```

### Ejemplo: Documento Completo

```json
{
  "_id": ObjectId("6543210fedcba9876543210d"),
  "expedienteId": ObjectId("6543210fedcba9876543210a"),
  "movimientoId": ObjectId("6543210fedcba9876543210c"),
  "nombre": "acta-audiencia-conciliacion-20240215.pdf",
  "nombreOriginal": "Acta de Audiencia.pdf",
  "tipo": "notificacion",
  "mimeType": "application/pdf",
  "tamaño": 245760,
  "path": "/storage/documentos/2024/02/acta-audiencia-conciliacion-20240215.pdf",
  "descripcion": "Acta de audiencia de conciliación del 15/02/2024",
  "tags": ["audiencia", "acta", "conciliación"],
  "metadata": {
    "pages": 3
  },
  "createdAt": ISODate("2024-02-15T16:45:00Z"),
  "createdBy": ObjectId("6543210fedcba9876543210f")
}
```

### Ejemplo: Audit Log

```json
{
  "_id": ObjectId("6543210fedcba9876543210g"),
  "userId": ObjectId("6543210fedcba9876543210f"),
  "action": "update",
  "collection": "expedientes",
  "documentId": ObjectId("6543210fedcba9876543210a"),
  "changes": {
    "before": {
      "estado": "activo",
      "prioridad": "baja"
    },
    "after": {
      "estado": "activo",
      "prioridad": "media"
    }
  },
  "metadata": {
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "requestId": "req-abc123xyz"
  },
  "timestamp": ISODate("2024-11-02T11:00:00Z")
}
```

---

## Queries Frecuentes

### Buscar expedientes por demandante

```javascript
db.expedientes.find({
  $or: [
    { "demandante.nombre": { $regex: "María", $options: "i" } },
    { "demandante.documentoNumero": "12345678" }
  ],
  deletedAt: null
});
```

### Expedientes con movimientos pendientes

```javascript
db.expedientes.aggregate([
  {
    $lookup: {
      from: "movimientos",
      localField: "_id",
      foreignField: "expedienteId",
      as: "movimientos"
    }
  },
  {
    $match: {
      "movimientos.estado": "pendiente",
      deletedAt: null
    }
  }
]);
```

### Dashboard de métricas

```javascript
db.expedientes.aggregate([
  {
    $facet: {
      total: [{ $count: "count" }],
      porEstado: [
        { $group: { _id: "$estado", count: { $sum: 1 } } }
      ],
      porTipo: [
        { $group: { _id: "$tipo", count: { $sum: 1 } } }
      ],
      nuevosEsteMes: [
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        },
        { $count: "count" }
      ]
    }
  }
]);
```

---

**Última actualización:** 2024-11-02  
**Próxima revisión:** Con cada cambio de esquema