# Documentación API - Sistema de Expedientes Judiciales

Esta carpeta contiene la documentación completa de la API del sistema de expedientes judiciales.

## 📄 Archivos

- `swagger.yaml` - Especificación OpenAPI 3.0 en formato YAML
- `README.md` - Este archivo

## 🚀 Visualizar la Documentación

### Opción 1: Swagger UI Local

1. **Instalar Swagger UI:**
   ```bash
   npm install -g swagger-ui-express
   ```

2. **Servir la documentación:**
   ```bash
   npx swagger-ui-serve swagger.yaml
   ```

3. Abrir en el navegador: `http://localhost:3000`

### Opción 2: Swagger Editor Online

1. Ir a [Swagger Editor](https://editor.swagger.io/)
2. Copiar el contenido de `swagger.yaml`
3. Pegar en el editor

### Opción 3: VS Code Extension

1. Instalar extensión "Swagger Viewer"
2. Abrir `swagger.yaml`
3. Presionar `Shift + Alt + P` y seleccionar "Preview Swagger"

### Opción 4: Integrado en el Backend (Recomendado)

El backend puede servir la documentación automáticamente en `/swagger/`:

```bash
# Acceder a la documentación
http://localhost:8080/swagger/index.html
```

## 🔧 Integración con Go

Para habilitar Swagger en el backend, ya se instalaron las dependencias necesarias:

```bash
go get -u github.com/swaggo/swag/cmd/swag
go get -u github.com/swaggo/gin-swagger
go get -u github.com/swaggo/files
```

## 📚 Endpoints Principales

### Autenticación
- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/refresh` - Renovar token
- `POST /api/v1/auth/logout` - Cerrar sesión

### Usuarios
- `GET /api/v1/users` - Listar usuarios
- `POST /api/v1/users` - Crear usuario
- `GET /api/v1/users/{id}` - Obtener usuario
- `PUT /api/v1/users/{id}` - Actualizar usuario
- `DELETE /api/v1/users/{id}` - Eliminar usuario
- `POST /api/v1/users/{id}/roles` - Añadir rol
- `DELETE /api/v1/users/{id}/roles` - Quitar rol

### Perfiles
- `GET /api/v1/profiles` - Listar perfiles
- `POST /api/v1/profiles` - Crear perfil

### Expedientes
- `GET /api/v1/expedientes` - Listar expedientes
- `POST /api/v1/expedientes` - Crear expediente
- `GET /api/v1/expedientes/{id}` - Obtener expediente
- `PUT /api/v1/expedientes/{id}` - Actualizar expediente
- `DELETE /api/v1/expedientes/{id}` - Eliminar expediente

### Movimientos
- `GET /api/v1/movimientos/expediente/{id}` - Movimientos de expediente
- `POST /api/v1/movimientos` - Crear movimiento
- `PUT /api/v1/movimientos/{id}` - Actualizar movimiento

### Juzgados
- `GET /api/v1/juzgados` - Listar juzgados
- `POST /api/v1/juzgados` - Crear juzgado

### Dashboard
- `GET /api/v1/dashboard/stats` - Estadísticas del sistema

## 🔐 Autenticación

Todos los endpoints (excepto login) requieren un token JWT en el header:

```
Authorization: Bearer {token}
```

### Ejemplo de Login

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@judiciales.com",
    "password": "admin123"
  }'
```

### Respuesta

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "admin@judiciales.com",
      "nombre": "Administrador Sistema",
      "roles": ["crear", "eliminar", "actualizar", "leer", "imprimir", "exportar", "importar", "ver"]
    },
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_at": "2025-11-04T07:00:00Z"
  }
}
```

## 🎯 Roles y Permisos

El sistema usa roles granulares:

| Rol | Descripción |
|-----|-------------|
| `crear` | Crear nuevos registros |
| `eliminar` | Eliminar registros existentes |
| `actualizar` | Modificar registros |
| `leer` | Consultar/listar registros |
| `imprimir` | Generar documentos imprimibles |
| `exportar` | Exportar datos (Excel, PDF) |
| `importar` | Importar datos desde archivos |
| `ver` | Visualizar detalles de registros |

## 📊 Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado |
| 400 | Bad Request - Error de validación |
| 401 | Unauthorized - Token inválido o faltante |
| 403 | Forbidden - Sin permisos suficientes |
| 404 | Not Found - Recurso no encontrado |
| 500 | Internal Server Error - Error del servidor |

## 🧪 Testing con Postman

1. Importar `swagger.yaml` en Postman
2. Postman generará automáticamente una colección
3. Configurar variables de entorno:
   - `baseUrl`: `http://localhost:8080/api/v1`
   - `token`: `{obtenido del login}`

## 📝 Ejemplos de Uso

### Crear Usuario con Perfil

```bash
curl -X POST http://localhost:8080/api/v1/users \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "password123",
    "nombre": "Juan",
    "apellido": "Pérez",
    "documento": "12345678",
    "profile_id": "507f1f77bcf86cd799439012",
    "roles": ["leer", "crear", "actualizar"]
  }'
```

### Añadir Rol a Usuario

```bash
curl -X POST http://localhost:8080/api/v1/users/{id}/roles \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "exportar"
  }'
```

### Listar Expedientes con Filtros

```bash
curl -X GET "http://localhost:8080/api/v1/expedientes?page=1&limit=10&estado=activo" \
  -H "Authorization: Bearer {token}"
```

## 🔄 Versionado de API

La API usa versionado en la URL (`/api/v1/`). Cambios breaking se reflejarán en una nueva versión (`/api/v2/`).

## 📧 Soporte

- Email: soporte@expedientes.com
- Documentación: Esta carpeta
- Issues: GitHub Issues

---

**Última actualización:** 2025-11-03  
**Versión API:** 1.0.0