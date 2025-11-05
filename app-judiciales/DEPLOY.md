# 🚀 Guía de Despliegue - Sistema de Expedientes Militares

## 📋 Entornos Disponibles

| Entorno | Archivo | Variables | Comando |
|---------|---------|-----------|---------|
| **Desarrollo** | `docker-compose.dev.yml` | `.env` | `docker compose -f docker-compose.dev.yml up -d` |
| **Producción** | `docker-compose.yml` | `.env.prod` | `docker compose --env-file .env.prod up -d` |
| **Empresarial** | `docker-compose.prod.yml` | `.env.enterprise` | `docker compose -f docker-compose.prod.yml --env-file .env.enterprise up -d` |

## 🔧 Comandos Básicos

### Iniciar:
```bash
# Desarrollo
docker compose -f docker-compose.dev.yml up -d

# Producción
docker compose --env-file .env.prod up -d

# Empresarial
docker compose -f docker-compose.prod.yml --env-file .env.enterprise up -d
```

### Detener:
```bash
# Desarrollo
docker compose -f docker-compose.dev.yml down

# Producción
docker compose down
```

### Ver estado:
```bash
docker compose ps
```

### Ver logs:
```bash
docker compose logs -f backend
docker compose logs -f frontend
```

## 🌐 Acceso

### Local:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8082
- **API Docs**: http://localhost:8082/api/v1/docs

### Remoto (cambiar IP):
- **Frontend**: http://192.168.18.13:3000
- **Backend**: http://192.168.18.13:8082

## � Credenciales

- **Email**: `admin@sistema.mil`
- **Password**: `admin123`

## ⚠️ Variables Críticas

**IMPORTANTE**: Actualizar en archivos `.env*`:
```bash
MONGODB_URI=mongodb+srv://tu_usuario:tu_password@cluster.mongodb.net/expedientes_db
JWT_SECRET=cambiar_por_clave_segura
```