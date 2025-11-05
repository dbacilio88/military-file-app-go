@echo off
REM Script de despliegue para Sistema de Expedientes Militares (Windows)
REM Autor: GitHub Copilot

echo 🚀 Iniciando despliegue del Sistema de Expedientes Militares...

REM Verificar que Docker está instalado
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker no está instalado. Por favor instala Docker Desktop primero.
    pause
    exit /b 1
)

REM Verificar que Docker Compose está instalado
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose no está instalado. Por favor instala Docker Compose primero.
    pause
    exit /b 1
)

REM Procesar argumentos
set action=%1
if "%action%"=="" set action=start

if "%action%"=="start" goto start
if "%action%"=="stop" goto stop
if "%action%"=="restart" goto restart
if "%action%"=="build" goto build
if "%action%"=="logs" goto logs
if "%action%"=="status" goto status
if "%action%"=="clean" goto clean
if "%action%"=="help" goto help
goto invalid

:start
echo 🔧 Construyendo e iniciando servicios...
docker-compose up -d --build
if %errorlevel% neq 0 (
    echo ❌ Error al iniciar servicios
    pause
    exit /b 1
)

echo ⏳ Esperando que los servicios estén listos...
timeout /t 10 /nobreak >nul

echo 📊 Estado de los servicios:
docker-compose ps

echo.
echo ✅ ¡Despliegue completado!
echo 🌐 Frontend disponible en: http://localhost:3000
echo 🔗 Backend API disponible en: http://localhost:8082
echo 🗄️  Base de datos disponible en: localhost:5432
echo 🔴 Redis disponible en: localhost:6379
echo.
echo Para ver logs en tiempo real: deploy.bat logs
goto end

:stop
echo 🛑 Deteniendo servicios...
docker-compose down
echo ✅ Servicios detenidos
goto end

:restart
echo 🔄 Reiniciando servicios...
docker-compose restart
echo ✅ Servicios reiniciados
goto end

:build
echo 🔨 Construyendo imágenes...
docker-compose build --no-cache
echo ✅ Imágenes construidas
goto end

:logs
echo 📝 Mostrando logs (Ctrl+C para salir)...
docker-compose logs -f
goto end

:status
echo 📊 Estado de los servicios:
docker-compose ps
echo.
echo 📈 Uso de recursos:
docker stats --no-stream
goto end

:clean
echo 🧹 Limpiando contenedores e imágenes no utilizadas...
docker-compose down --rmi all --volumes --remove-orphans
docker system prune -af
echo ✅ Limpieza completada
goto end

:help
echo Uso: deploy.bat [OPCIÓN]
echo.
echo Opciones:
echo   start     Iniciar todos los servicios
echo   stop      Detener todos los servicios
echo   restart   Reiniciar todos los servicios
echo   build     Construir las imágenes
echo   logs      Mostrar logs de todos los servicios
echo   status    Mostrar estado de los servicios
echo   clean     Limpiar contenedores e imágenes no utilizadas
echo   help      Mostrar esta ayuda
echo.
goto end

:invalid
echo ❌ Opción no válida: %action%
echo.
goto help

:end
if "%action%"=="logs" exit /b 0
pause