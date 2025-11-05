#!/bin/bash

# Script de despliegue para Sistema de Expedientes Militares
# Autor: GitHub Copilot
# Fecha: $(date)

echo "🚀 Iniciando despliegue del Sistema de Expedientes Militares..."

# Verificar que Docker y Docker Compose están instalados
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [OPCIÓN]"
    echo ""
    echo "Opciones:"
    echo "  start     Iniciar todos los servicios"
    echo "  stop      Detener todos los servicios"
    echo "  restart   Reiniciar todos los servicios"
    echo "  build     Construir las imágenes"
    echo "  logs      Mostrar logs de todos los servicios"
    echo "  status    Mostrar estado de los servicios"
    echo "  clean     Limpiar contenedores e imágenes no utilizadas"
    echo "  help      Mostrar esta ayuda"
    echo ""
}

# Función para iniciar servicios
start_services() {
    echo "🔧 Construyendo e iniciando servicios..."
    docker-compose up -d --build
    
    echo "⏳ Esperando que los servicios estén listos..."
    sleep 10
    
    echo "📊 Estado de los servicios:"
    docker-compose ps
    
    echo ""
    echo "✅ ¡Despliegue completado!"
    echo "🌐 Frontend disponible en: http://localhost:3000"
    echo "🔗 Backend API disponible en: http://localhost:8082"
    echo "🗄️  Base de datos disponible en: localhost:5432"
    echo "🔴 Redis disponible en: localhost:6379"
    echo ""
    echo "Para ver logs en tiempo real: ./deploy.sh logs"
}

# Función para detener servicios
stop_services() {
    echo "🛑 Deteniendo servicios..."
    docker-compose down
    echo "✅ Servicios detenidos"
}

# Función para reiniciar servicios
restart_services() {
    echo "🔄 Reiniciando servicios..."
    docker-compose restart
    echo "✅ Servicios reiniciados"
}

# Función para construir imágenes
build_images() {
    echo "🔨 Construyendo imágenes..."
    docker-compose build --no-cache
    echo "✅ Imágenes construidas"
}

# Función para mostrar logs
show_logs() {
    echo "📝 Mostrando logs (Ctrl+C para salir)..."
    docker-compose logs -f
}

# Función para mostrar estado
show_status() {
    echo "📊 Estado de los servicios:"
    docker-compose ps
    echo ""
    echo "📈 Uso de recursos:"
    docker stats --no-stream
}

# Función para limpiar
clean_docker() {
    echo "🧹 Limpiando contenedores e imágenes no utilizadas..."
    docker-compose down --rmi all --volumes --remove-orphans
    docker system prune -af
    echo "✅ Limpieza completada"
}

# Procesar argumentos
case "${1:-start}" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    build)
        build_images
        ;;
    logs)
        show_logs
        ;;
    status)
        show_status
        ;;
    clean)
        clean_docker
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "❌ Opción no válida: $1"
        show_help
        exit 1
        ;;
esac