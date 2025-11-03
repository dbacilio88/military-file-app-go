#!/bin/bash

# Script de inicio rápido del sistema de expedientes judiciales
echo "🏛️  Iniciando Sistema de Expedientes Judiciales..."
echo "================================================="

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

echo "✅ Docker y Docker Compose detectados"

# Crear directorios necesarios
echo "📁 Creando directorios necesarios..."
mkdir -p uploads
mkdir -p logs

# Iniciar servicios
echo "🚀 Iniciando servicios con Docker Compose..."
docker-compose up -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 10

# Verificar estado de los servicios
echo "🔍 Verificando estado de los servicios..."
docker-compose ps

# Mostrar información útil
echo ""
echo "🎉 ¡Sistema iniciado correctamente!"
echo "================================================="
echo "📊 Backend API: http://localhost:8080"
echo "📊 Health Check: http://localhost:8080/health" 
echo "📊 Frontend: http://localhost:3000"
echo "🗄️  MongoDB: localhost:27017"
echo ""
echo "📚 Documentación API disponible en el README.md"
echo ""
echo "Para detener el sistema: docker-compose down"
echo "Para ver logs: docker-compose logs -f"