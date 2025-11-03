# Sistema de Expedientes Judiciales - Backend

Backend API para el sistema de gestión de expedientes judiciales desarrollado en Go con Gin framework y MongoDB.

## 🚀 Características

- **Arquitectura Clean**: Separación clara de responsabilidades
- **JWT Authentication**: Autenticación segura con tokens JWT
- **Rate Limiting**: Limitación de peticiones por IP
- **CORS Support**: Configuración flexible de CORS
- **MongoDB**: Base de datos NoSQL escalable
- **Docker Support**: Contenedorización completa
- **Middleware Stack**: Logging, Recovery, Auth y Rate Limiting
- **Validation**: Validación de datos con go-playground/validator

## 📋 Requisitos

- Go 1.21+
- MongoDB 6.0+
- Docker & Docker Compose (opcional)

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

### Docker Compose

1. **Ejecutar todo el stack**
```bash
docker-compose up -d
```

Esto iniciará:
- MongoDB en puerto 27017
- Redis en puerto 6379
- Backend API en puerto 8080

## 📁 Estructura del Proyecto

```
backend/
├── cmd/
│   └── main.go                 # Punto de entrada
├── internal/
│   ├── config/                 # Configuración
│   ├── database/               # Conexión a BD
│   ├── handlers/               # Controladores HTTP
│   ├── middleware/             # Middlewares
│   ├── models/                 # Modelos de datos
│   ├── repository/             # Capa de datos
│   ├── services/               # Lógica de negocio
│   └── utils/                  # Utilidades
├── uploads/                    # Archivos subidos
├── .env                        # Variables de entorno
├── Dockerfile                  # Imagen Docker
├── docker-compose.yml          # Stack completo
└── README.md
```

## 🔧 Configuración

### Variables de Entorno

```env
# Server
PORT=8080
ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=expedientes_db

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=24h
JWT_REFRESH_EXPIRATION=168h

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000

# Rate Limiting
RATE_LIMIT_REQUESTS=1000
RATE_LIMIT_WINDOW=3600
```

## 📚 API Endpoints

### Autenticación
- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/refresh` - Renovar token
- `POST /api/v1/auth/logout` - Cerrar sesión

### Usuarios
- `GET /api/v1/users` - Listar usuarios
- `GET /api/v1/users/:id` - Obtener usuario
- `POST /api/v1/users` - Crear usuario
- `PUT /api/v1/users/:id` - Actualizar usuario
- `DELETE /api/v1/users/:id` - Eliminar usuario
- `GET /api/v1/users/profile` - Perfil actual
- `PUT /api/v1/users/profile` - Actualizar perfil
- `PUT /api/v1/users/password` - Cambiar contraseña

### Expedientes
- `GET /api/v1/expedientes` - Listar expedientes
- `GET /api/v1/expedientes/:id` - Obtener expediente
- `POST /api/v1/expedientes` - Crear expediente
- `PUT /api/v1/expedientes/:id` - Actualizar expediente
- `DELETE /api/v1/expedientes/:id` - Eliminar expediente
- `PUT /api/v1/expedientes/:id/estado` - Cambiar estado
- `GET /api/v1/expedientes/search` - Búsqueda avanzada

### Movimientos
- `GET /api/v1/movimientos/expediente/:id` - Movimientos por expediente
- `GET /api/v1/movimientos/:id` - Obtener movimiento
- `POST /api/v1/movimientos` - Crear movimiento
- `PUT /api/v1/movimientos/:id` - Actualizar movimiento
- `DELETE /api/v1/movimientos/:id` - Eliminar movimiento

### Juzgados
- `GET /api/v1/juzgados` - Listar juzgados
- `GET /api/v1/juzgados/:id` - Obtener juzgado
- `POST /api/v1/juzgados` - Crear juzgado
- `PUT /api/v1/juzgados/:id` - Actualizar juzgado
- `DELETE /api/v1/juzgados/:id` - Eliminar juzgado

### Dashboard
- `GET /api/v1/dashboard/stats` - Estadísticas del dashboard

### Health Check
- `GET /health` - Estado del servicio

## 🔐 Autenticación

El sistema usa JWT para autenticación:

1. **Login**: Envía credenciales a `/auth/login`
2. **Token**: Recibe `access_token` y `refresh_token`
3. **Requests**: Incluye `Authorization: Bearer <token>` en headers
4. **Refresh**: Usa `refresh_token` para obtener nuevo `access_token`

### Ejemplo de Login

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@expedientes.com",
    "password": "admin123"
  }'
```

### Respuesta

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "admin@expedientes.com",
      "nombre": "Administrador",
      "rol": "administrador"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_at": "2024-11-04T10:00:00Z"
  }
}
```

## 👥 Roles de Usuario

- **Administrador**: Control total del sistema
- **Juez**: Acceso completo a expedientes asignados
- **Secretario**: Gestión de expedientes y movimientos
- **Abogado**: Consulta de expedientes donde participa

## 🗄️ Base de Datos

### Colecciones MongoDB

- **users**: Usuarios del sistema
- **expedientes**: Expedientes judiciales
- **movimientos**: Movimientos/actuaciones
- **juzgados**: Juzgados y tribunales
- **audit_logs**: Logs de auditoría

### Índices

El sistema crea automáticamente índices optimizados para:
- Búsquedas por email y documento (usuarios)
- Búsquedas textuales (expedientes)
- Filtros por estado y tipo (expedientes)
- Consultas por expediente (movimientos)

## 🧪 Testing

```bash
# Ejecutar tests
go test ./...

# Tests con cobertura
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out -o coverage.html
```

## 🚀 Deployment

### Docker

```bash
# Build imagen
docker build -t expedientes-backend .

# Ejecutar contenedor
docker run -p 8080:8080 expedientes-backend
```

### Docker Compose

```bash
# Desarrollo
docker-compose up -d

# Producción
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Monitoreo

### Health Check

```bash
curl http://localhost:8080/health
```

### Logs

```bash
# Docker logs
docker-compose logs -f backend

# Logs locales
tail -f logs/app.log
```

## 🔧 Desarrollo

### Agregar nuevos endpoints

1. **Modelo**: Crear struct en `internal/models/`
2. **Repository**: Implementar CRUD en `internal/repository/`
3. **Service**: Lógica de negocio en `internal/services/`
4. **Handler**: Controlador HTTP en `internal/handlers/`
5. **Routes**: Registrar rutas en `cmd/main.go`

### Middleware personalizado

```go
func CustomMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        // Tu lógica aquí
        c.Next()
    }
}
```

## 📝 Contribución

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## 🆘 Soporte

- **Email**: soporte@expedientes.com
- **Issues**: GitHub Issues
- **Documentación**: `/docs` endpoint (en desarrollo)

---

**Desarrollado con ❤️ para la modernización del sistema judicial**