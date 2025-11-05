#!/bin/bash

# Script de despliegue para Producción - Sistema de Expedientes Militares

set -e

echo "🚀 Iniciando despliegue en modo PRODUCCIÓN..."

# Verificaciones de seguridad
if [ ! -f .env ]; then
    echo "❌ Error: Archivo .env no encontrado. Crea uno basado en .env.example"
    exit 1
fi

# Verificar variables críticas para MongoDB
if ! grep -q "MONGODB_URI=" .env || grep -q "mongodb://localhost" .env; then
    echo "❌ Error: MONGODB_URI no está configurado para MongoDB en la nube"
    echo "   Ejemplo: mongodb+srv://user:pass@cluster.mongodb.net/database"
    exit 1
fi

if ! grep -q "JWT_SECRET=" .env || grep -q "your_super_secret_jwt_key_here" .env; then
    echo "❌ Error: JWT_SECRET no está configurado correctamente en .env"
    exit 1
fi

# Verificar conexión a MongoDB (opcional)
echo "🔍 Verificando conectividad a MongoDB..."
if command -v mongosh >/dev/null 2>&1; then
    MONGODB_URI_FROM_ENV=$(grep "MONGODB_URI=" .env | cut -d'=' -f2-)
    if ! mongosh "$MONGODB_URI_FROM_ENV" --eval "db.runCommand({ ping: 1 })" >/dev/null 2>&1; then
        echo "⚠️  Advertencia: No se pudo conectar a MongoDB. Verifica MONGODB_URI"
    else
        echo "✅ Conexión a MongoDB exitosa"
    fi
else
    echo "⚠️  mongosh no instalado, saltando verificación de MongoDB"
fi

# Verificar Docker
if ! docker info >/dev/null 2>&1; then
    echo "❌ Error: Docker no está ejecutándose"
    exit 1
fi

# No hay backup de base de datos local (MongoDB está en la nube)

# Detener servicios existentes
echo "🛑 Deteniendo servicios existentes..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml down

# Construir imágenes para producción
echo "🏗️  Construyendo imágenes para producción..."
docker compose build --no-cache

# Etiquetar imágenes para producción
echo "🏷️  Etiquetando imágenes..."
docker tag app-judiciales-frontend:latest military-frontend:latest
docker tag app-judiciales-backend:latest military-backend:latest

# Ejecutar en modo producción
echo "🚀 Ejecutando en modo producción..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Verificar estado
echo "🔍 Verificando estado de los servicios..."
sleep 45

if docker compose -f docker-compose.yml -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo "✅ Despliegue de producción completado exitosamente"
    echo ""
    echo "🌐 URLs disponibles:"
    echo "   Aplicación: http://localhost:80"
    echo "   HTTPS: https://localhost:443 (si SSL está configurado)"
    echo ""
    echo "📊 Monitoreo:"
    echo "   docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f"
    echo "   docker stats"
    echo ""
    echo "🔧 Administración:"
    echo "   docker compose -f docker-compose.yml -f docker-compose.prod.yml exec backend ./main --help"
    echo "   Conexión a MongoDB: Usar herramientas de tu proveedor cloud"
else
    echo "❌ Error en el despliegue de producción"
    docker compose -f docker-compose.yml -f docker-compose.prod.yml logs
    exit 1
fi