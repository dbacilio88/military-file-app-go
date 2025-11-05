# 🏛️ Sistema de Gestión de Expedientes Militares

> Desarrollado por **Bacystem Solutions EIRL**

Sistema integral para la gestión y registro de expedientes militares, desarrollado con tecnologías modernas para garantizar eficiencia, seguridad y escalabilidad.

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Versión |
|------|------------|---------|
| **Frontend** | Next.js + TypeScript | 14+ |
| **Backend** | Go + Gin | 1.21+ |
| **Base de Datos** | MongoDB Atlas | Cloud |
| **Autenticación** | JWT | - |
| **Containerización** | Docker Compose | v2.40.0 |
| **Proxy** | Nginx | Latest |

## 📁 Estructura del Proyecto

```
military-file-app-go/
├── app-judiciales/                    # Aplicación principal
│   ├── backend/                       # API Go
│   │   ├── cmd/main.go               # Punto de entrada
│   │   ├── internal/
│   │   │   ├── config/               # Configuración
│   │   │   ├── database/             # MongoDB connection
│   │   │   ├── handlers/             # HTTP handlers
│   │   │   ├── middleware/           # Auth, logging, rate limit
│   │   │   ├── models/               # Data models
│   │   │   ├── repository/           # Data access layer
│   │   │   ├── services/             # Business logic
│   │   │   └── utils/                # Utilities
│   │   ├── docs/                     # API documentation
│   │   └── scripts/                  # Database scripts
│   ├── frontend/                     # Next.js App
│   │   ├── app/                      # App Router
│   │   │   ├── dashboard/            # Dashboard page
│   │   │   ├── expedientes/          # Files management
│   │   │   ├── login/                # Authentication
│   │   │   ├── profiles/             # User profiles
│   │   │   └── users/                # User management
│   │   ├── components/               # Reusable components
│   │   ├── contexts/                 # React contexts
│   │   ├── hooks/                    # Custom hooks
│   │   ├── lib/                      # Utils & API client
│   │   └── nginx/                    # Nginx configuration
│   ├── specs/                        # Project specifications
│   ├── docker-compose.dev.yml        # Development environment
│   ├── docker-compose.yml            # Production environment
│   ├── docker-compose.prod.yml       # Enterprise environment
│   ├── .env                          # Development variables
│   ├── .env.prod                     # Production variables
│   ├── .env.enterprise               # Enterprise variables
│   └── DEPLOY.md                     # Deployment guide
├── CHANGELOG.md                       # Change history
├── CONTRIBUTING.md                    # Contribution guide
├── LICENSE                           # Bacystem Solutions license
└── README.md                         # This file
```

## ✨ Características Principales

- 📁 **Gestión de Expedientes**: CRUD completo con numeración automática
- 👥 **Gestión de Usuarios**: Roles y permisos granulares
- � **Búsqueda Avanzada**: Filtros múltiples y búsqueda inteligente
- 📊 **Dashboard**: Estadísticas y métricas en tiempo real
- 🔒 **Seguridad**: JWT, encriptación, auditoría completa
- 🌐 **Acceso Remoto**: Configuración para acceso desde red externa

## 🚀 Inicio Rápido

### Prerrequisitos
- Docker & Docker Compose v2.40.0+
- MongoDB Atlas account (cloud database)

### Comandos de Despliegue

```bash
# Desarrollo
docker compose -f docker-compose.dev.yml up -d

# Producción  
docker compose --env-file .env.prod up -d

# Empresarial
docker compose -f docker-compose.prod.yml --env-file .env.enterprise up -d
```

### Acceso al Sistema

| Entorno | URL | Credenciales |
|---------|-----|--------------|
| **Local** | http://localhost:3000 | admin@sistema.mil / admin123 |
| **Remoto** | http://192.168.18.13:3000 | admin@sistema.mil / admin123 |

## 🔧 Configuración

### Variables de Entorno Críticas
```bash
# MongoDB Cloud
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/expedientes_db

# Seguridad
JWT_SECRET=clave_secreta_segura

# CORS
CORS_ORIGIN=*
```

## 📚 Documentación

- [🚀 Guía de Despliegue](app-judiciales/DEPLOY.md)
- [📋 Especificaciones](app-judiciales/specs/)
- [🔄 Changelog](CHANGELOG.md)
- [🤝 Contribución](CONTRIBUTING.md)

## 🏢 Empresa

**Bacystem Solutions EIRL**
- 🌐 www.bacystem.com
- 📧 contacto@bacystem.com
- 📍 Perú

## 📄 Licencia

Propiedad de **Bacystem Solutions EIRL** - Ver [LICENSE](LICENSE) para más detalles.

---

⚖️ **Sistema de Gestión de Expedientes Militares** - Desarrollado por Bacystem Solutions EIRL