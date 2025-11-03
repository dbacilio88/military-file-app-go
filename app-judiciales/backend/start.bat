@echo off
REM Script de inicio rápido del sistema de expedientes judiciales para Windows
echo 🏛️  Iniciando Sistema de Expedientes Judiciales...
echo =================================================

REM Verificar si Docker está instalado
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker no está instalado. Por favor instala Docker Desktop primero.
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose no está instalado. Por favor instala Docker Desktop con Compose.
    pause
    exit /b 1
)

echo ✅ Docker y Docker Compose detectados

REM Crear directorios necesarios
echo 📁 Creando directorios necesarios...
if not exist "uploads" mkdir uploads
if not exist "logs" mkdir logs

REM Iniciar servicios
echo 🚀 Iniciando servicios con Docker Compose...
docker-compose up -d

REM Esperar a que los servicios estén listos
echo ⏳ Esperando a que los servicios estén listos...
timeout /t 10 /nobreak >nul

REM Verificar estado de los servicios
echo 🔍 Verificando estado de los servicios...
docker-compose ps

REM Mostrar información útil
echo.
echo 🎉 ¡Sistema iniciado correctamente!
echo =================================================
echo 📊 Backend API: http://localhost:8080
echo 📊 Health Check: http://localhost:8080/health
echo 📊 Frontend: http://localhost:3000
echo 🗄️  MongoDB: localhost:27017
echo.
echo 📚 Documentación API disponible en el README.md
echo.
echo Para detener el sistema: docker-compose down
echo Para ver logs: docker-compose logs -f
echo.
pause