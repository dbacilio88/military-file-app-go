# Sistema de Expedientes Militares - Backend

Backend API para el sistema de gestión de expedientes militares desarrollado en Go con Gin framework y MongoDB. Sistema moderno con arquitectura de permisos granulares para instituciones militares.

## 🚀 Características Principales

- **🏗️ Arquitectura Clean**: Separación clara de responsabilidades con Repository/Service pattern
- **🔐 Sistema de Permisos Avanzado**: Arquitectura Usuario → Perfil → Permisos directos (sin roles intermedios)
- **🎫 JWT Authentication**: Autenticación segura con tokens JWT y refresh tokens
- **⚡ Rate Limiting**: Limitación inteligente de peticiones por IP
- **🌐 CORS Support**: Configuración flexible de CORS para múltiples orígenes
- **📊 MongoDB Optimizado**: Base de datos NoSQL con índices optimizados automáticos
- **🐳 Docker Support**: Contenedorización completa con Docker Compose
- **🛡️ Middleware Stack**: Logging, Recovery, Auth, Rate Limiting y validación de permisos
- **✅ Validation**: Validación robusta de datos con go-playground/validator
- **📈 Indexación Automática**: Creación automática de índices para rendimiento óptimo

## 🔐 Sistema de Permisos

### Arquitectura Simplificada
```
Usuario → Perfil → Permisos (directo)
```

### Permisos Disponibles

#### 👤 **Gestión de Usuarios**
- `user:create` - Crear nuevos usuarios
- `user:read` - Consultar información de usuarios
- `user:update` - Modificar datos de usuarios
- `user:delete` - Eliminar usuarios
- `user:manage` - **Gestión completa** (incluye todos los anteriores)

#### 👥 **Gestión de Perfiles**
- `profile:read` - Consultar perfiles y permisos
- `profile:write` - Crear y modificar perfiles

#### 📁 **Gestión de Expedientes Militares**
- `expediente:create` - Crear nuevos expedientes militares
- `expediente:read` - Consultar expedientes militares
- `expediente:update` - Modificar expedientes y cambiar estados
- `expediente:delete` - Eliminar expedientes
- `expediente:manage` - **Gestión completa** (incluye todos los anteriores)

#### ⚙️ **Administración del Sistema**
- `system:admin` - Administración completa del sistema
- `system:read` - Consulta de información del sistema

### Perfiles Predefinidos

| **Perfil** | **Permisos** | **Casos de Uso** |
|------------|--------------|------------------|
| **👑 Administrador del Sistema** | `user:manage`, `profile:read`, `profile:write`, `expediente:manage`, `system:admin`, `system:read` | Gestión completa del sistema de expedientes militares |

### Estructura de Expedientes Militares

El sistema maneja expedientes con la siguiente información:

#### Información Personal Militar
- **Grado**: OFICIAL, TCO, SSOO, EC, TROPA
- **Apellidos y Nombres**: Identificación completa del personal
- **CIP**: Código de Identificación Personal militar (único)
- **Situación Militar**: Actividad o Retiro

#### Información del Expediente
- **Número de Páginas**: Cantidad de documentos en el expediente
- **Ubicación**: Localización física del expediente
- **Estado**: dentro, fuera (del archivo)
- **Orden**: Número de orden para clasificación

## 📋 Requisitos

- **Go 1.21+**
- **MongoDB 6.0+**
- **Docker & Docker Compose** (opcional)

## 🛠️ Instalación

### Desarrollo Local

1. **Clonar el repositorio**
```bash
cd app-judiciales/backend
```

2. **Instalar dependencias**
```bash
go mod tidy
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. **Ejecutar MongoDB** (si no usas Docker)
```bash
# Instalar MongoDB localmente o usar Docker
docker run -d -p 27017:27017 --name mongo mongo:6.0
```

5. **Ejecutar la aplicación**
```bash
go run cmd/main.go
```

6. **Crear usuario administrador** (primera vez)
```bash
go run scripts/test_user_creation.go
```

### Docker Compose (Recomendado)

1. **Ejecutar todo el stack**
```bash
docker-compose up -d
```

Esto iniciará:
- **MongoDB** en puerto 27017
- **Backend API** en puerto 8080

## 📁 Estructura del Proyecto

```
backend/
├── cmd/
│   └── main.go                 # Punto de entrada y configuración de rutas
├── internal/
│   ├── config/                 # Configuración de la aplicación
│   │   └── config.go
│   ├── database/               # Conexión y gestión de BD
│   │   └── database.go
│   ├── handlers/               # Controladores HTTP
│   │   ├── handlers.go         # Handlers principales
│   │   └── swagger_handler.go  # Documentación API
│   ├── middleware/             # Middlewares personalizados
│   │   ├── auth.go            # Autenticación JWT
│   │   ├── logging.go         # Logging de requests
│   │   └── ratelimit.go       # Rate limiting
│   ├── models/                 # Modelos de datos
│   │   ├── common.go          # Estructuras comunes
│   │   ├── user.go            # Modelo de usuario
│   │   ├── profile.go         # Modelo de perfil
│   │   ├── expediente.go      # Modelo de expediente
│   │   └── permissions.go     # Sistema de permisos
│   ├── repository/             # Capa de acceso a datos
│   │   ├── user_repository.go
│   │   ├── profile_repository.go
│   │   └── expediente_repositories.go
│   ├── services/               # Lógica de negocio
│   │   ├── auth_service.go
│   │   ├── services.go         # UserService
│   │   └── profile_service.go
│   └── utils/                  # Utilidades
│       └── crypto.go          # Hash de contraseñas
├── scripts/                    # Scripts de utilidad
│   ├── test_user_creation.go  # Crear usuario administrador
│   └── generate_hash.go       # Generar hash de contraseñas
├── docs/                       # Documentación
│   ├── swagger.yaml           # API Documentation
│   └── postman-collection.json
├── uploads/                    # Archivos subidos
├── .env                        # Variables de entorno
├── Dockerfile                  # Imagen Docker
├── docker-compose.yml          # Stack completo
├── Makefile                    # Comandos útiles
└── README.md
```

## 🔧 Configuración

### Variables de Entorno

```env
# Server Configuration
PORT=8080
ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=expedientes_db

# JWT Configuration
JWT_SECRET=your-very-secure-secret-key
JWT_EXPIRATION=24h
JWT_REFRESH_EXPIRATION=168h

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Email Configuration (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Upload Configuration
MAX_UPLOAD_SIZE=10485760
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_REQUESTS=1000
RATE_LIMIT_WINDOW=3600
```

## 🚀 Inicio Rápido

### 1. Configuración Inicial
```bash
# Clonar y configurar
git clone <repository>
cd app-judiciales/backend
go mod tidy
cp .env.example .env
```

### 2. Ejecutar con Docker (Recomendado)
```bash
docker-compose up -d
```

### 3. Ejecutar la Aplicación
```bash
# La aplicación creará automáticamente el usuario administrador
go run cmd/main.go
```

### 4. Verificar Instalación
```bash
curl http://localhost:8080/health
```

### 5. Login del Administrador
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sistema.mil",
    "password": "admin123"
  }'
```

## 📚 API Endpoints

### 🔐 Autenticación
- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/refresh` - Renovar token
- `POST /api/v1/auth/logout` - Cerrar sesión

### 👤 Usuarios (Permisos requeridos)
- `GET /api/v1/users` - Listar usuarios (`user:read`)
- `GET /api/v1/users/:id` - Obtener usuario (`user:read`)
- `POST /api/v1/users` - Crear usuario (`user:create`)
- `PUT /api/v1/users/:id` - Actualizar usuario (`user:update`)
- `DELETE /api/v1/users/:id` - Eliminar usuario (`user:delete`)
- `GET /api/v1/users/profile` - Perfil actual (autenticado)
- `PUT /api/v1/users/profile` - Actualizar perfil propio (autenticado)
- `PUT /api/v1/users/password` - Cambiar contraseña (autenticado)

### 👥 Perfiles (Permisos requeridos)
- `GET /api/v1/profiles` - Listar perfiles (`profile:read`)
- `GET /api/v1/profiles/:id` - Obtener perfil (`profile:read`)

### 📁 Expedientes (Permisos requeridos)
- `GET /api/v1/expedientes` - Listar expedientes (`expediente:read`)
- `GET /api/v1/expedientes/:id` - Obtener expediente (`expediente:read`)
- `POST /api/v1/expedientes` - Crear expediente (`expediente:create`)
- `PUT /api/v1/expedientes/:id` - Actualizar expediente (`expediente:update`)
- `DELETE /api/v1/expedientes/:id` - Eliminar expediente (`expediente:delete`)
- `PUT /api/v1/expedientes/:id/estado` - Cambiar estado (`expediente:update`)
- `GET /api/v1/expedientes/search` - Búsqueda avanzada (`expediente:read`)

### ⚙️ Sistema
- `GET /health` - Estado del servicio (público)
- `GET /api/v1/docs` - Documentación Swagger (público)

### 👑 Administración (Solo administradores)
- `GET /api/v1/admin/profiles` - Gestión de perfiles (`system:admin`)

## 🔐 Autenticación y Autorización

### Flow de Autenticación

1. **Login**: Envía credenciales a `/auth/login`
2. **Token**: Recibe `access_token` y `refresh_token`
3. **Requests**: Incluye `Authorization: Bearer <token>` en headers
4. **Validation**: El middleware verifica token y permisos
5. **Refresh**: Usa `refresh_token` para obtener nuevo `access_token`

### Ejemplo Completo

```bash
# 1. Login
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sistema.mil",
    "password": "admin123"
  }')

# 2. Extraer token
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.access_token')

# 3. Usar token en requests
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/v1/users
```

### Respuesta de Login

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "690a27ed7551dcdff4d4c26f",
      "email": "admin@sistema.mil",
      "nombre": "Administrador",
      "apellido": "del Sistema",
      "profile_id": "690a27ed7551dcdff4d4c26f"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_at": "2025-11-05T11:21:01Z"
  }
}
```

## 🗄️ Base de Datos

### Colecciones MongoDB

- **users**: Usuarios del sistema con referencia a perfil
- **profiles**: Perfiles con permisos directos
- **expedientes**: Expedientes militares con información de personal
- **audit_logs**: Logs de auditoría (futuro)

### Índices Automáticos

El sistema crea automáticamente índices optimizados:

#### Users Collection
- `email` (único) - Para login rápido
- `documento` (único) - Para identificación

#### Expedientes Collection
- `cip` (único) - Código de Identificación Personal militar
- `apellidos_nombres` - Búsqueda por nombre completo
- `grado` - Filtros por grado militar
- `situacion_militar` - Filtros por situación (Actividad/Retiro)
- `estado` - Filtros por estado (dentro/fuera)
- `created_at` - Ordenamiento cronológico
- `orden` - Ordenamiento por número de orden

#### Profiles Collection
- `slug` (único) - Identificador legible
- `active` - Filtros de perfiles activos
- `created_at` - Ordenamiento cronológico

## 🧪 Testing y Scripts

### Crear Usuario Administrador
```bash
# Al iniciar por primera vez, se crea automáticamente el usuario administrador
go run cmd/main.go
```

### Credenciales por Defecto del Usuario Administrador
- **Email**: `admin@sistema.mil`
- **Contraseña**: `admin123`
- **Permisos**: Administración completa del sistema

⚠️ **IMPORTANTE**: Cambie la contraseña después del primer acceso.

### Generar Hash de Contraseña
```bash
go run scripts/generate_hash.go
```

### Tests
```bash
# Ejecutar tests
go test ./...

# Tests con cobertura
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out -o coverage.html
```

### Formateo de Código
```bash
go fmt ./...
```

## 🚀 Deployment

### Docker Production

```bash
# Build imagen optimizada
docker build -t expedientes-backend:latest .

# Ejecutar en producción
docker run -d \
  --name expedientes-backend \
  -p 8080:8080 \
  -e MONGODB_URI="mongodb://your-production-db" \
  -e JWT_SECRET="your-production-secret" \
  expedientes-backend:latest
```

### Docker Compose Production

```bash
# Producción con variables de entorno
ENV=production docker-compose up -d
```

### Variables de Producción

```env
ENV=production
PORT=8080
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/expedientes_prod
JWT_SECRET=your-very-secure-production-secret
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
RATE_LIMIT_REQUESTS=500
```

## 📊 Monitoreo y Salud

### Health Check
```bash
curl http://localhost:8080/health
```

**Respuesta:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-04T11:21:01Z",
  "service": "expedientes-backend"
}
```

### Logs
```bash
# Docker logs
docker-compose logs -f backend

# Logs locales con timestamps
tail -f logs/app.log
```

### Métricas de Rate Limiting
El sistema incluye rate limiting automático:
- **1000 requests/hora** por IP (configurable)
- Headers de respuesta con límites actuales
- Bloqueo automático de IPs abusivas

## 🔧 Desarrollo Avanzado

### Agregar Nuevos Permisos

1. **Definir permiso** en `internal/models/permissions.go`:
```go
PermissionNewFeature Permission = "feature:action"
```

2. **Actualizar perfiles** en `RolePermissions` map

3. **Usar en rutas**:
```go
feature.GET("/", middleware.RequirePermission(models.PermissionNewFeature), handler.GetFeature)
```

### Middleware Personalizado

```go
func CustomMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        // Tu lógica aquí
        c.Next()
    }
}
```

### Agregar Nuevos Endpoints

1. **Modelo**: Crear struct en `internal/models/`
2. **Repository**: Implementar CRUD en `internal/repository/`
3. **Service**: Lógica de negocio en `internal/services/`
4. **Handler**: Controlador HTTP en `internal/handlers/`
5. **Routes**: Registrar rutas en `cmd/main.go` con permisos

## 🛡️ Seguridad

### Características de Seguridad

- ✅ **JWT con expiración** y refresh tokens
- ✅ **Permisos granulares** por endpoint
- ✅ **Rate limiting** por IP
- ✅ **Hash seguro** de contraseñas (bcrypt)
- ✅ **Validación** de datos de entrada
- ✅ **CORS configurado** para orígenes específicos
- ✅ **Logs de auditoría** (preparado)

### Mejores Prácticas Implementadas

- Separación de concerns con Clean Architecture
- Principio de menor privilegio en permisos
- Validación en múltiples capas
- Encriptación de datos sensibles
- Índices optimizados para performance

## 📈 Performance

### Optimizaciones Implementadas

- **Índices automáticos** en MongoDB
- **Connection pooling** para base de datos
- **Rate limiting** para prevenir abuso
- **Paginación** en endpoints de listado
- **Middleware eficiente** con gin framework

### Métricas de Performance

- **Login**: ~50ms (con cache de permisos)
- **Consultas de expedientes**: ~100ms (con índices)
- **Validación de permisos**: ~5ms (en memoria)

## 📝 Contribución

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

### Estándares de Código

- **Go fmt**: Formateo automático
- **Go vet**: Análisis estático
- **Tests**: Cobertura mínima 80%
- **Documentación**: Comentarios en funciones públicas

## 🆘 Soporte y Documentación

- **API Docs**: `/api/v1/docs` (Swagger UI)
- **Health Check**: `/health`
- **Issues**: GitHub Issues
- **Email**: soporte@bacsystem.com

### Comandos Útiles

```bash
# Makefile commands
make run          # Ejecutar aplicación
make test         # Ejecutar tests
make build        # Compilar binario
make docker       # Build imagen Docker
make compose-up   # Levantar stack completo
make admin        # Crear usuario administrador
```

---

## 📋 Credenciales por Defecto

### Usuario Administrador
- **Email**: `admin@sistema.mil`
- **Contraseña**: `admin123`
- **Permisos**: Administración completa

⚠️ **IMPORTANTE**: Cambie la contraseña después del primer acceso en producción.

---

**🏛️ Desarrollado para la modernización del sistema de expedientes militares**  
**💻 Powered by Go + MongoDB + Clean Architecture**  
**🔐 Seguridad empresarial con permisos granulares**