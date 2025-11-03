# Sistema de Registro de Expedientes Judiciales

## 📋 Descripción

Sistema integral para la gestión y registro de expedientes judiciales, desarrollado con tecnologías modernas para garantizar eficiencia, seguridad y escalabilidad en el manejo de información judicial.

## 🏗️ Arquitectura

### Stack Tecnológico

- **Frontend**: Next.js 14+ con TypeScript
- **Backend**: Go 1.25.1
- **Base de Datos**: MongoDB
- **Autenticación**: JWT
- **Deployment**: Docker & Docker Compose

### Estructura del Proyecto

```
judicial-records-system/
├── frontend/                 # Aplicación Next.js
│   ├── src/
│   │   ├── app/             # App Router de Next.js
│   │   ├── components/      # Componentes reutilizables
│   │   ├── lib/            # Utilidades y configuraciones
│   │   └── types/          # Definiciones de TypeScript
│   ├── public/             # Archivos estáticos
│   └── package.json
├── backend/                 # API en Go
│   ├── cmd/                # Punto de entrada
│   ├── internal/           # Código interno
│   │   ├── handlers/       # Controladores HTTP
│   │   ├── models/         # Modelos de datos
│   │   ├── services/       # Lógica de negocio
│   │   └── database/       # Conexión y queries
│   ├── pkg/               # Paquetes reutilizables
│   └── go.mod
├── docs/                  # Documentación técnica
├── scripts/              # Scripts de utilidad
└── docker-compose.yml    # Configuración de contenedores
```

## ✨ Características Principales

### 📁 Gestión de Expedientes
- ✅ Registro y seguimiento de expedientes judiciales
- ✅ Sistema de numeración automática
- ✅ Búsqueda avanzada por múltiples criterios
- ✅ Historial de movimientos y actualizaciones
- ✅ Asignación a juzgados y funcionarios

### 👥 Gestión de Usuarios
- ✅ Autenticación y autorización por roles
- ✅ Perfiles diferenciados (Jueces, Secretarios, Abogados)
- ✅ Registro de actividades por usuario
- ✅ Control de acceso granular

### 📊 Reportes y Estadísticas
- ✅ Dashboard con métricas en tiempo real
- ✅ Reportes personalizables
- ✅ Exportación a PDF y Excel
- ✅ Análisis de tiempos de procesamiento

### 🔒 Seguridad
- ✅ Encriptación de datos sensibles
- ✅ Auditoría completa de operaciones
- ✅ Backup automático
- ✅ Cumplimiento de normativas de protección de datos

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ y npm/yarn
- Go 1.25.1+
- MongoDB 6.0+
- Docker y Docker Compose (opcional)

### Instalación con Docker

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/judicial-records-system.git
cd judicial-records-system

# Levantar servicios con Docker Compose
docker-compose up -d

# El sistema estará disponible en:
# Frontend: http://localhost:3000
# API: http://localhost:8080
```

### Instalación Manual

#### Backend (Go)

```bash
cd backend
go mod download
go run cmd/main.go
```

#### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

#### Base de Datos (MongoDB)

```bash
# Crear base de datos y colecciones iniciales
mongo < scripts/init-db.js
```

## 📖 Documentación

- [📋 Guía de Contribución](CONTRIBUTING.md)
- [🔧 API Documentation](docs/API.md)
- [🎨 Frontend Architecture](docs/FRONTEND.md)
- [🗄️ Database Schema](docs/DATABASE.md)
- [🚀 Deployment Guide](docs/DEPLOYMENT.md)

## 🛠️ Desarrollo

### Comandos Útiles

```bash
# Backend
make run          # Ejecutar servidor de desarrollo
make test         # Ejecutar tests
make build        # Compilar aplicación
make lint         # Linter de código

# Frontend
npm run dev       # Servidor de desarrollo
npm run build     # Build de producción
npm run test      # Ejecutar tests
npm run lint      # ESLint
```

### Variables de Entorno

#### Backend (.env)
```env
PORT=8080
MONGODB_URI=mongodb://localhost:27017/judicial_records
JWT_SECRET=tu_jwt_secret_aqui
CORS_ORIGINS=http://localhost:3000
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_APP_NAME=Sistema Judicial
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
go test ./...
```

### Frontend Tests
```bash
cd frontend
npm run test
npm run test:e2e
```

## 📋 Roadmap

### Versión 1.0 (MVP)
- [ ] Autenticación básica
- [ ] CRUD de expedientes
- [ ] Búsqueda simple
- [ ] Dashboard básico

### Versión 1.1
- [ ] Notificaciones en tiempo real
- [ ] Reportes avanzados
- [ ] API móvil
- [ ] Integración con sistemas externos

### Versión 1.2
- [ ] Machine Learning para clasificación automática
- [ ] Workflow configurable
- [ ] Multi-tenancy
- [ ] APIs públicas

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor lee nuestras [guías de contribución](CONTRIBUTING.md) antes de enviar un PR.

1. Fork del proyecto
2. Crear una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit de cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Equipo

- **Desarrollo Backend**: [Tu Nombre]
- **Desarrollo Frontend**: [Tu Nombre]
- **DevOps**: [Tu Nombre]
- **QA**: [Tu Nombre]

## 📞 Soporte

- 📧 Email: support@judicial-system.com
- 💬 Discord: [Enlace al servidor]
- 📋 Issues: [GitHub Issues](https://github.com/tu-usuario/judicial-records-system/issues)

## 🏷️ Badges

![Build Status](https://github.com/tu-usuario/judicial-records-system/workflows/CI/badge.svg)
![Coverage](https://codecov.io/gh/tu-usuario/judicial-records-system/branch/main/graph/badge.svg)
![Go Version](https://img.shields.io/badge/Go-1.25.1-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green.svg)

---

**⚖️ Desarrollado para la modernización del sistema judicial**