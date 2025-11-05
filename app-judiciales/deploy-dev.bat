@echo off
setlocal EnableDelayedExpansion

REM Script de despliegue para Windows - Sistema de Expedientes Militares
REM Modo: Desarrollo

echo 🚀 Iniciando despliegue en modo desarrollo...

REM Verificar si Docker está ejecutándose
docker info >nul 2>&1
if !errorlevel! neq 0 (
    echo ❌ Error: Docker no está ejecutándose
    pause
    exit /b 1
)

REM Verificar si Docker Compose está disponible
docker-compose version >nul 2>&1
if !errorlevel! neq 0 (
    echo ❌ Error: Docker Compose no está instalado
    pause
    exit /b 1
)

REM Crear archivo .env si no existe
if not exist .env (
    echo 📝 Creando archivo .env desde .env.example...
    copy .env.example .env
    echo ⚠️  IMPORTANTE: Edita el archivo .env con tus configuraciones específicas
)

REM Limpiar contenedores anteriores si existen
echo 🧹 Limpiando contenedores anteriores...
docker-compose down --remove-orphans

REM Crear directorios necesarios
echo 📁 Creando directorios necesarios...
if not exist "frontend\nginx\ssl" mkdir "frontend\nginx\ssl"
if not exist "backend\uploads" mkdir "backend\uploads"
if not exist "backend\logs" mkdir "backend\logs"

REM Construir y ejecutar servicios
echo 🏗️  Construyendo y ejecutando servicios...
docker-compose up --build -d

REM Verificar estado de los servicios
echo 🔍 Verificando estado de los servicios...
timeout /t 30 /nobreak >nul

docker-compose ps | findstr "Up" >nul
if !errorlevel! equ 0 (
    echo ✅ Servicios iniciados correctamente
    echo.
    echo 🌐 URLs disponibles:
    echo    Frontend: http://localhost:3000
    echo    Backend API: http://localhost:8082
    echo    Nginx Proxy: http://localhost:80
    echo    MongoDB: Configurado en la nube (ver MONGODB_URI)
    echo.
    echo 📊 Para ver logs en tiempo real:
    echo    docker-compose logs -f
    echo.
    echo 🛑 Para detener los servicios:
    echo    docker-compose down
) else (
    echo ❌ Error: Algunos servicios no se iniciaron correctamente
    docker-compose logs
    pause
    exit /b 1
)

pause