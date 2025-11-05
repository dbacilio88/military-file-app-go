#!/bin/bash

# Script de despliegue para el Sistema de Expedientes Militares
# Modo: Desarrollo

set -e

echo "🚀 Iniciando despliegue en modo desarrollo..."

# Verificar si Docker está ejecutándose
if ! docker info >/dev/null 2>&1; then
    echo "❌ Error: Docker no está ejecutándose"
    exit 1
fi

# Verificar si Docker Compose está disponible
if ! command -v "docker compose" >/dev/null 2>&1; then
    echo "❌ Error: Docker Compose no está instalado"
    exit 1
fi

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env desde .env.example..."
    cp .env.example .env
    echo "⚠️  IMPORTANTE: Edita el archivo .env con tus configuraciones específicas"
fi

# Limpiar contenedores anteriores si existen
echo "🧹 Limpiando contenedores anteriores..."
docker compose -f docker-compose.dev.yml down --remove-orphans

# Crear directorios necesarios
echo "📁 Creando directorios necesarios..."
mkdir -p frontend/nginx/ssl
mkdir -p backend/uploads
mkdir -p backend/logs

# Construir y ejecutar servicios
echo "🏗️  Construyendo y ejecutando servicios..."
docker compose -f docker-compose.dev.yml up --build -d

# Verificar estado de los servicios
echo "🔍 Verificando estado de los servicios..."
sleep 30

if docker compose -f docker-compose.dev.yml ps | grep -q "Up"; then
    echo "✅ Servicios iniciados correctamente"
    echo ""
    echo "🌐 URLs disponibles:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:8082"
    echo "   Nginx Proxy: http://localhost:80"
    echo "   MongoDB: Configurado en la nube (ver MONGODB_URI)"
    echo ""
    echo "📊 Para ver logs en tiempo real:"
    echo "   docker compose -f docker-compose.dev.yml logs -f"
    echo ""
    echo "🛑 Para detener los servicios:"
    echo "   docker compose -f docker-compose.dev.yml down"
else
    echo "❌ Error: Algunos servicios no se iniciaron correctamente"
    docker compose -f docker-compose.dev.yml logs
    exit 1
fi