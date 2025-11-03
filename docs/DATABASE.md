# Database Schema - MongoDB

## 📋 Índice

1. [Información General](#información-general)
2. [Colecciones](#colecciones)
3. [Esquemas de Datos](#esquemas-de-datos)
4. [Índices](#índices)
5. [Relaciones](#relaciones)
6. [Validaciones](#validaciones)
7. [Scripts de Inicialización](#scripts-de-inicialización)
8. [Migraciones](#migraciones)

## 🗄️ Información General

- **Base de Datos**: `judicial_records`
- **Motor**: MongoDB 6.0+
- **Encoding**: UTF-8
- **Timezone**: UTC

### Convenciones de Naming

- **Colecciones**: snake_case (plural)
- **Campos**: snake_case
- **IDs**: ObjectId de MongoDB
- **Timestamps**: ISO 8601 (UTC)

## 📊 Colecciones

### Resumen de Colecciones

| Colección | Descripción | Documentos Est. |
|-----------|-------------|-----------------|
| `users` | Usuarios del sistema | 100-500 |
| `expedientes` | Expedientes judiciales | 10,000-100,000 |
| `movimientos` | Movimientos de expedientes | 50,000-500,000 |
| `juzgados` | Juzgados y cortes | 20-100 |
| `documentos` | Metadatos de documentos | 100,000-1,000,000 |
| `audit_logs` | Registros de auditoría | 1,000,000+ |
| `sessions` | Sesiones de usuario | Variable |
| `notifications` | Notificaciones | Variable |

## 📝 Esquemas de Datos

### 👥 Users Collection

```javascript
// Collection: users
{
  "_id": ObjectId("64f8a123b2c3d4e5f6789012"),
  "email": "juan.perez@judicial.gob.pe",
  "password_hash": "$2b$12$...", // bcrypt hash
  "name": "Juan Carlos Pérez",
  "role": "judge", // admin, judge, secretary, lawyer
  "status": "active", // active, inactive, suspended
  "profile": {
    "phone": "+51987654321",
    "address": "Av. Judicial 123, Lima",
    "identification": {
      "type": "dni", // dni, ce, passport
      "number": "12345678"
    },
    "avatar_url": "https://storage.com/avatars/user123.jpg"
  },
  "permissions": [
    "expedientes.read",
    "expedientes.write",
    "usuarios.read"
  ],
  "court_assignments": [
    {
      "court_id": ObjectId("64f8a123b2c3d4e5f6789999"),
      "role": "titular", // titular, suplente, secretario
      "assigned_at": ISODate("2024-01-01T00:00:00Z")
    }
  ],
  "settings": {
    "theme": "light",
    "language": "es",
    "notifications": {
      "email": true,
      "push": true,
      "sms": false
    }
  },
  "last_login": ISODate("2024-01-15T10:30:00Z"),
  "login_attempts": 0,
  "password_reset": {
    "token": null,
    "expires_at": null,
    "requested_at": null
  },
  "created_at": ISODate("2024-01-01T00:00:00Z"),
  "updated_at": ISODate("2024-01-15T10:30:00Z"),
  "deleted_at": null
}
```

### 📁 Expedientes Collection

```javascript
// Collection: expedientes
{
  "_id": ObjectId("64f8a123b2c3d4e5f6789013"),
  "numero": "EXP-2024-001234",
  "numero_interno": "2024-001234", // Sin prefijo
  "year": 2024,
  "correlativo": 1234,
  "descripcion": "Demanda por daños y perjuicios contra Empresa XYZ",
  "tipo": "civil", // civil, penal, laboral, familia, comercial, administrativo
  "subtipo": "daños_perjuicios",
  "estado": "activo", // activo, en_proceso, suspendido, resuelto, archivado
  "prioridad": "media", // baja, media, alta, urgente
  "court_id": ObjectId("64f8a123b2c3d4e5f6789999"),
  "judge_id": ObjectId("64f8a123b2c3d4e5f6789012"),
  "secretary_id": ObjectId("64f8a123b2c3d4e5f6789014"),
  
  // Partes del proceso
  "parties": {
    "demandante": {
      "type": "persona_natural", // persona_natural, persona_juridica
      "name": "José Antonio Martínez López",
      "identification": {
        "type": "dni",
        "number": "12345678901"
      },
      "contact": {
        "phone": "+51987654321",
        "email": "jose.martinez@email.com",
        "address": "Jr. Los Olivos 456, Lima"
      },
      "legal_representative": {
        "name": "Dr. Carlos Abogado",
        "bar_number": "CAL-12345",
        "contact": {
          "phone": "+51123456789",
          "email": "cabogado@bufete.com"
        }
      }
    },
    "demandado": {
      "type": "persona_juridica",
      "name": "Empresa XYZ S.A.C.",
      "identification": {
        "type": "ruc",
        "number": "20123456789"
      },
      "contact": {
        "phone": "+51456789123",
        "email": "legal@empresaxyz.com",
        "address": "Av. Corporativa 789, Lima"
      },
      "legal_representative": {
        "name": "Dra. María Defensora",
        "bar_number": "CAL-67890",
        "contact": {
          "phone": "+51789123456",
          "email": "mdefensora@legal.com"
        }
      }
    }
  },
  
  // Información económica
  "financial": {
    "monto_pretension": 150000.00,
    "moneda": "PEN",
    "tasa_interes": 0.00,
    "costas_costos": 5000.00
  },
  
  // Fechas importantes
  "dates": {
    "fecha_inicio": ISODate("2024-01-15T00:00:00Z"),
    "fecha_notificacion": ISODate("2024-01-20T00:00:00Z"),
    "fecha_contestacion": ISODate("2024-02-20T00:00:00Z"),
    "fecha_audiencia": ISODate("2024-03-15T09:00:00Z"),
    "fecha_vencimiento": ISODate("2024-12-31T23:59:59Z"),
    "fecha_resolucion": null
  },
  
  // Metadata y seguimiento
  "metadata": {
    "materia": "Responsabilidad Civil",
    "via_procedimental": "Proceso de Conocimiento",
    "cuantia": "mayor",
    "jurisdiccion": "Lima",
    "instancia": "primera",
    "sala": null,
    "ponente": null
  },
  
  // Etiquetas y categorización
  "tags": ["daños", "responsabilidad_civil", "empresa", "urgente"],
  "keywords": ["daños y perjuicios", "responsabilidad", "empresa"],
  
  // Estado de documentos
  "documents_status": {
    "demanda": "presentado",
    "contestacion": "pendiente",
    "sentencia": "no_aplica"
  },
  
  // Estadísticas de tiempo
  "time_stats": {
    "dias_transcurridos": 45,
    "dias_habiles": 32,
    "promedio_tipo": 180,
    "tiempo_estimado": 240
  },
  
  // Observaciones y notas
  "observaciones": "Caso complejo que requiere peritaje técnico",
  "notas_internas": "Verificar documentación de la empresa demandada",
  
  // Control de versiones
  "version": 1,
  "history": [
    {
      "version": 1,
      "action": "created",
      "user_id": ObjectId("64f8a123b2c3d4e5f6789014"),
      "timestamp": ISODate("2024-01-15T10:30:00Z"),
      "changes": {}
    }
  ],
  
  // Timestamps
  "created_at": ISODate("2024-01-15T10:30:00Z"),
  "updated_at": ISODate("2024-01-20T15:30:00Z"),
  "deleted_at": null
}
```

### 🔄 Movimientos Collection

```javascript
// Collection: movimientos
{
  "_id": ObjectId("64f8a123b2c3d4e5f6789014"),
  "expediente_id": ObjectId("64f8a123b2c3d4e5f6789013"),
  "numero_movimiento": 1,
  "tipo": "actuacion", // ingreso, actuacion, resolucion, notificacion, archivo
  "subtipo": "audiencia_programada",
  "titulo": "Audiencia de Conciliación Programada",
  "descripcion": "Se programa audiencia de conciliación para el día 15 de marzo de 2024 a las 09:00 horas",
  
  // Información de la actuación
  "details": {
    "resumen": "Programación de audiencia",
    "fundamentos": "En cumplimiento del artículo 468 del CPC",
    "disposiciones": [
      "Cítese a las partes para audiencia de conciliación",
      "La audiencia se realizará en la Sala 3 del juzgado"
    ]
  },
  
  // Fechas
  "fecha_movimiento": ISODate("2024-01-18T14:30:00Z"),
  "fecha_notificacion": ISODate("2024-01-19T10:00:00Z"),
  "fecha_vencimiento": ISODate("2024-03-15T09:00:00Z"),
  
  // Usuario responsable
  "user_id": ObjectId("64f8a123b2c3d4e5f6789012"),
  "user_name": "Juan Carlos Pérez",
  "user_role": "judge",
  
  // Documentos asociados
  "documents": [
    {
      "document_id": ObjectId("64f8a123b2c3d4e5f6789015"),
      "name": "auto_audiencia_001.pdf",
      "type": "auto",
      "size": 1024576,
      "mime_type": "application/pdf"
    }
  ],
  
  // Notificaciones
  "notifications": [
    {
      "party": "demandante",
      "method": "cedula", // cedula, edictos, email, sms
      "status": "entregado", // pendiente, entregado, devuelto
      "fecha_envio": ISODate("2024-01-19T10:00:00Z"),
      "fecha_entrega": ISODate("2024-01-19T15:30:00Z"),
      "receptor": "José Antonio Martínez López",
      "observaciones": "Entregado en domicilio procesal"
    }
  ],
  
  // Visibilidad y acceso
  "visibility": {
    "public": true,
    "internal_notes": "Verificar disponibilidad de sala",
    "restricted_fields": []
  },
  
  // Estado
  "status": "active", // active, cancelled, completed
  "requires_response": true,
  "response_deadline": ISODate("2024-03-10T23:59:59Z"),
  
  // Metadata
  "metadata": {
    "urgente": false,
    "categoria": "audiencia",
    "origen": "juzgado"
  },
  
  "created_at": ISODate("2024-01-18T14:30:00Z"),
  "updated_at": ISODate("2024-01-18T14:30:00Z")
}
```

### 🏛️ Juzgados Collection

```javascript
// Collection: juzgados
{
  "_id": ObjectId("64f8a123b2c3d4e5f6789999"),
  "codigo": "JUZ-CIV-001",
  "nombre": "Primer Juzgado Civil de Lima",
  "tipo": "civil", // civil, penal, laboral, familia, comercial, paz_letrado
  "distrito_judicial": "Lima",
  "sede": "Palacio de Justicia de Lima",
  
  // Información de contacto
  "contact": {
    "direccion": "Av. Paseo de la República 1055, Lima",
    "telefono": "+51-1-4281515",
    "email": "civil1@pj.gob.pe",
    "fax": "+51-1-4281516",
    "horario_atencion": {
      "lunes_viernes": "08:00-16:00",
      "sabado": "08:00-12:00",
      "domingo": "cerrado"
    }
  },
  
  // Personal asignado
  "staff": {
    "juez_titular": {
      "user_id": ObjectId("64f8a123b2c3d4e5f6789012"),
      "name": "Dr. Juan Carlos Pérez",
      "desde": ISODate("2023-01-01T00:00:00Z")
    },
    "juez_suplente": {
      "user_id": ObjectId("64f8a123b2c3d4e5f6789016"),
      "name": "Dra. María Rodríguez",
      "desde": ISODate("2023-06-01T00:00:00Z")
    },
    "secretarios": [
      {
        "user_id": ObjectId("64f8a123b2c3d4e5f6789014"),
        "name": "Ana García",
        "tipo": "titular",
        "desde": ISODate("2023-01-01T00:00:00Z")
      }
    ]
  },
  
  // Configuración operativa
  "config": {
    "competencia": [
      "Procesos de conocimiento",
      "Procesos abreviados",
      "Procesos sumarísimos"
    ],
    "materias": [
      "Responsabilidad civil",
      "Contratos",
      "Derechos reales"
    ],
    "turno": "A", // A, B, C (para distribución)
    "salas": [
      {
        "numero": "101",
        "tipo": "audiencias",
        "capacidad": 20
      },
      {
        "numero": "102",
        "tipo": "conciliacion",
        "capacidad": 10
      }
    ]
  },
  
  // Estadísticas
  "statistics": {
    "expedientes_activos": 245,
    "expedientes_resueltos_mes": 23,
    "carga_procesal": "alta", // baja, media, alta
    "tiempo_promedio_resolucion": 180, // días
    "ultima_actualizacion": ISODate("2024-01-31T23:59:59Z")
  },
  
  "active": true,
  "created_at": ISODate("2023-01-01T00:00:00Z"),
  "updated_at": ISODate("2024-01-15T10:30:00Z")
}
```

### 📄 Documentos Collection

```javascript
// Collection: documentos
{
  "_id": ObjectId("64f8a123b2c3d4e5f6789015"),
  "expediente_id": ObjectId("64f8a123b2c3d4e5f6789013"),
  "movimiento_id": ObjectId("64f8a123b2c3d4e5f6789014"),
  
  // Información del documento
  "name": "auto_audiencia_001.pdf",
  "original_name": "Auto de audiencia.pdf",
  "type": "auto", // demanda, contestacion, auto, sentencia, resolucion, escrito
  "category": "judicial", // judicial, administrativo, anexo
  
  // Metadata del archivo
  "file": {
    "size": 1024576, // bytes
    "mime_type": "application/pdf",
    "extension": "pdf",
    "hash_md5": "d41d8cd98f00b204e9800998ecf8427e",
    "hash_sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "encoding": "base64"
  },
  
  // Almacenamiento
  "storage": {
    "provider": "s3", // local, s3, azure, gcp
    "bucket": "judicial-documents",
    "path": "2024/01/expedientes/64f8a123b2c3d4e5f6789013/auto_audiencia_001.pdf",
    "url": "https://storage.judicial.com/documents/...",
    "cdn_url": "https://cdn.judicial.com/documents/..."
  },
  
  // Versioning
  "version": 1,
  "versions": [
    {
      "version": 1,
      "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "created_at": ISODate("2024-01-18T14:30:00Z"),
      "created_by": ObjectId("64f8a123b2c3d4e5f6789012")
    }
  ],
  
  // Seguridad y acceso
  "access": {
    "level": "public", // public, internal, restricted, classified
    "allowed_roles": ["judge", "secretary", "lawyer"],
    "restricted_fields": [],
    "expiration_date": null
  },
  
  // Metadatos legales
  "legal": {
    "firmado_digitalmente": true,
    "certificado": "RENIEC-2024-001",
    "timestamp_firmado": ISODate("2024-01-18T14:30:00Z"),
    "valido_hasta": ISODate("2027-01-18T14:30:00Z")
  },
  
  // Estado del documento
  "status": "active", // active, archived, deleted
  "tags": ["audiencia", "conciliacion", "auto"],
  "description": "Auto que programa audiencia de conciliación",
  
  // Auditoría
  "audit": {
    "uploaded_by": ObjectId("64f8a123b2c3d4e5f6789012"),
    "uploaded_from_ip": "192.168.1.100",
    "downloads": 0,
    "views": 5,
    "last_accessed": ISODate("2024-01-20T10:00:00Z")
  },
  
  "created_at": ISODate("2024-01-18T14:30:00Z"),
  "updated_at": ISODate("2024-01-18T14:30:00Z")
}
```

### 📊 Audit Logs Collection

```javascript
// Collection: audit_logs
{
  "_id": ObjectId("64f8a123b2c3d4e5f6789016"),
  "user_id": ObjectId("64f8a123b2c3d4e5f6789012"),
  "session_id": "sess_abc123def456",
  "action": "expediente.update",
  "resource": "expedientes",
  "resource_id": ObjectId("64f8a123b2c3d4e5f6789013"),
  
  // Detalles de la acción
  "details": {
    "method": "PUT",
    "endpoint": "/api/v1/expedientes/64f8a123b2c3d4e5f6789013",
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "ip_address": "192.168.1.100",
    "changes": {
      "estado": {
        "from": "activo",
        "to": "en_proceso"
      },
      "observaciones": {
        "from": "",
        "to": "Expediente en proceso de revisión"
      }
    }
  },
  
  // Contexto
  "context": {
    "expediente_numero": "EXP-2024-001234",
    "juzgado": "Primer Juzgado Civil de Lima",
    "affected_parties": ["demandante", "demandado"]
  },
  
  // Metadata
  "severity": "info", // debug, info, warning, error, critical
  "category": "data_modification",
  "success": true,
  "error_message": null,
  
  "timestamp": ISODate("2024-01-20T15:30:00Z"),
  "indexed_at": ISODate("2024-01-20T15:30:01Z")
}
```

## 🔍 Índices

### Índices Primarios

```javascript
// Users Collection
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "role": 1 })
db.users.createIndex({ "status": 1 })
db.users.createIndex({ "court_assignments.court_id": 1 })
db.users.createIndex({ "created_at": -1 })

// Expedientes Collection
db.expedientes.createIndex({ "numero": 1 }, { unique: true })
db.expedientes.createIndex({ "numero_interno": 1, "year": 1 }, { unique: true })
db.expedientes.createIndex({ "estado": 1, "created_at": -1 })
db.expedientes.createIndex({ "court_id": 1, "estado": 1 })
db.expedientes.createIndex({ "judge_id": 1 })
db.expedientes.createIndex({ "tipo": 1, "estado": 1 })
db.expedientes.createIndex({ "dates.fecha_inicio": -1 })
db.expedientes.createIndex({ "parties.demandante.identification.number": 1 })
db.expedientes.createIndex({ "parties.demandado.identification.number": 1 })

// Índices de texto para búsqueda
db.expedientes.createIndex({
  "descripcion": "text",
  "parties.demandante.name": "text",
  "parties.demandado.name": "text",
  "keywords": "text"
}, {
  name: "expedientes_text_search",
  default_language: "spanish"
})

// Movimientos Collection
db.movimientos.createIndex({ "expediente_id": 1, "numero_movimiento": 1 })
db.movimientos.createIndex({ "expediente_id": 1, "fecha_movimiento": -1 })
db.movimientos.createIndex({ "tipo": 1, "fecha_movimiento": -1 })
db.movimientos.createIndex({ "user_id": 1, "fecha_movimiento": -1 })
db.movimientos.createIndex({ "status": 1, "requires_response": 1 })

// Documentos Collection
db.documentos.createIndex({ "expediente_id": 1, "type": 1 })
db.documentos.createIndex({ "file.hash_sha256": 1 }, { unique: true })
db.documentos.createIndex({ "status": 1, "created_at": -1 })

// Audit Logs Collection
db.audit_logs.createIndex({ "user_id": 1, "timestamp": -1 })
db.audit_logs.createIndex({ "action": 1, "timestamp": -1 })
db.audit_logs.createIndex({ "resource_id": 1, "timestamp": -1 })
db.audit_logs.createIndex({ "timestamp": -1 }, { expireAfterSeconds: 7776000 }) // 90 días
```

### Índices Compuestos

```javascript
// Para reportes y estadísticas
db.expedientes.createIndex({
  "court_id": 1,
  "tipo": 1,
  "estado": 1,
  "dates.fecha_inicio": -1
})

// Para búsquedas avanzadas
db.expedientes.createIndex({
  "estado": 1,
  "prioridad": 1,
  "dates.fecha_vencimiento": 1
})

// Para dashboard de usuarios
db.movimientos.createIndex({
  "user_id": 1,
  "tipo": 1,
  "fecha_movimiento": -1
})
```

## 🔗 Relaciones

### Diagrama de Relaciones

```
Users
├── expedientes (judge_id, secretary_id)
├── movimientos (user_id)
├── audit_logs (user_id)
└── juzgados.staff (user_id)

Expedientes
├── movimientos (expediente_id)
├── documentos (expediente_id)
└── juzgados (court_id)

Movimientos
└── documentos (movimiento_id)
```

### Consultas de Relación

```javascript
// Obtener expedientes con información del juez
db.expedientes.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "judge_id",
      foreignField: "_id",
      as: "judge"
    }
  },
  {
    $lookup: {
      from: "juzgados",
      localField: "court_id",
      foreignField: "_id",
      as: "court"
    }
  }
])

// Obtener movimientos con documentos asociados
db.movimientos.aggregate([
  {
    $lookup: {
      from: "documentos",
      localField: "_id",
      foreignField: "movimiento_id",
      as: "documents"
    }
  }
])
```

## ✅ Validaciones

### Validación de Esquemas

```javascript
// Validación para Users
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "password_hash", "name", "role"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
        },
        role: {
          enum: ["admin", "judge", "secretary", "lawyer"]
        },
        status: {
          enum: ["active", "inactive", "suspended"]
        }
      }
    }
  }
})

// Validación para Expedientes
db.createCollection("expedientes", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["numero", "descripcion", "tipo", "estado", "court_id"],
      properties: {
        numero: {
          bsonType: "string",
          pattern: "^EXP-\\d{4}-\\d{6}$"
        },
        tipo: {
          enum: ["civil", "penal", "laboral", "familia", "comercial", "administrativo"]
        },
        estado: {
          enum: ["activo", "en_proceso", "suspendido", "resuelto", "archivado"]
        },
        prioridad: {
          enum: ["baja", "media", "alta", "urgente"]
        }
      }
    }
  }
})
```

## 🚀 Scripts de Inicialización

### Crear Base de Datos

```javascript
// scripts/init-db.js
use judicial_records

// Crear colecciones con validaciones
db.createCollection("users", {
  validator: { /* validaciones */ }
})

db.createCollection("expedientes", {
  validator: { /* validaciones */ }
})

// Crear índices
load("scripts/create-indexes.js")

// Insertar datos iniciales
load("scripts/seed-data.js")
```

### Datos Semilla

```javascript
// scripts/seed-data.js

// Crear usuario administrador
db.users.insertOne({
  email: "admin@judicial.gob.pe",
  password_hash: "$2b$12$...",
  name: "Administrador del Sistema",
  role: "admin",
  status: "active",
  permissions: ["*"],
  created_at: new Date(),
  updated_at: new Date()
})

// Crear juzgados iniciales
db.juzgados.insertMany([
  {
    codigo: "JUZ-CIV-001",
    nombre: "Primer Juzgado Civil de Lima",
    tipo: "civil",
    distrito_judicial: "Lima",
    active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    codigo: "JUZ-PEN-001",
    nombre: "Primer Juzgado Penal de Lima",
    tipo: "penal",
    distrito_judicial: "Lima",
    active: true,
    created_at: new Date(),
    updated_at: new Date()
  }
])
```

## 🔄 Migraciones

### Sistema de Versioning

```javascript
// Collection: schema_migrations
{
  "_id": ObjectId("..."),
  "version": "1.0.0",
  "description": "Initial schema setup",
  "script": "migrations/001_initial_setup.js",
  "applied_at": ISODate("2024-01-01T00:00:00Z"),
  "rollback_script": "migrations/001_rollback.js"
}
```

### Script de Migración

```javascript
// migrations/002_add_expediente_metadata.js
db.expedientes.updateMany(
  { metadata: { $exists: false } },
  {
    $set: {
      metadata: {
        materia: "",
        via_procedimental: "",
        cuantia: "menor",
        jurisdiccion: "Lima",
        instancia: "primera"
      },
      version: 2,
      updated_at: new Date()
    }
  }
)

// Registrar migración
db.schema_migrations.insertOne({
  version: "1.1.0",
  description: "Add metadata fields to expedientes",
  script: "migrations/002_add_expediente_metadata.js",
  applied_at: new Date()
})
```

## 📊 Performance y Optimización

### Particionado por Fecha

```javascript
// Crear colecciones particionadas por año
db.createCollection("audit_logs_2024")
db.createCollection("audit_logs_2025")

// Configurar TTL para logs antiguos
db.audit_logs.createIndex(
  { "timestamp": 1 },
  { expireAfterSeconds: 7776000 } // 90 días
)
```

### Agregaciones Optimizadas

```javascript
// Pipeline optimizado para dashboard
db.expedientes.aggregate([
  {
    $match: {
      "created_at": {
        $gte: new Date(new Date().getFullYear(), 0, 1)
      }
    }
  },
  {
    $group: {
      _id: {
        tipo: "$tipo",
        estado: "$estado"
      },
      count: { $sum: 1 },
      avg_days: {
        $avg: {
          $divide: [
            { $subtract: [new Date(), "$dates.fecha_inicio"] },
            86400000
          ]
        }
      }
    }
  }
])
```

---

**Base de datos diseñada para escalabilidad y eficiencia**  
**Última actualización**: 2024-11-02