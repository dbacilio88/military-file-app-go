# 📁 Estructura del Proyecto

Este documento describe la estructura completa del proyecto Sistema de Registro de Expedientes Judiciales.

## 📂 Estructura de Directorios

```
judicial-records-system/
│
├── .github/                          # Configuración de GitHub
│   ├── ISSUE_TEMPLATE/              # Templates para issues
│   │   ├── bug_report.md            # Template para reportar bugs
│   │   ├── feature_request.md       # Template para solicitar features
│   │   ├── task.md                  # Template para tareas
│   │   ├── question.md              # Template para preguntas
│   │   └── config.yml               # Configuración de issues
│   ├── workflows/                   # GitHub Actions
│   │   ├── ci.yml                   # Pipeline de CI
│   │   ├── deploy.yml               # Pipeline de deployment
│   │   └── security.yml             # Escaneo de seguridad
│   └── pull_request_template.md     # Template para PRs
│
├── frontend/                         # Aplicación Next.js
│   ├── src/
│   │   ├── app/                     # App Router (Next.js 14+)
│   │   │   ├── (auth)/              # Grupo de rutas de auth
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── (dashboard)/         # Grupo de rutas dashboard
│   │   │   │   ├── expedientes/
│   │   │   │   ├── usuarios/
│   │   │   │   ├── reportes/
│   │   │   │   └── configuracion/
│   │   │   ├── api/                 # API Routes
│   │   │   ├── layout.tsx           # Layout principal
│   │   │   ├── page.tsx             # Página home
│   │   │   ├── loading.tsx          # Loading UI
│   │   │   ├── error.tsx            # Error UI
│   │   │   └── not-found.tsx        # 404 page
│   │   ├── components/              # Componentes React
│   │   │   ├── ui/                  # Componentes base
│   │   │   ├── forms/               # Formularios
│   │   │   ├── layout/              # Layout components
│   │   │   ├── tables/              # Tablas de datos
│   │   │   └── charts/              # Gráficos
│   │   ├── hooks/                   # Custom hooks
│   │   ├── lib/                     # Utilidades
│   │   │   ├── api.ts               # Cliente API
│   │   │   ├── auth.ts              # Utilidades auth
│   │   │   ├── utils.ts             # Helpers
│   │   │   └── validations.ts       # Schemas Zod
│   │   ├── providers/               # Context providers
│   │   ├── store/                   # Estado global (Zustand)
│   │   ├── types/                   # TypeScript types
│   │   └── styles/                  # Estilos globales
│   ├── public/                      # Archivos estáticos
│   │   ├── images/
│   │   └── icons/
│   ├── .env.example                 # Ejemplo de variables
│   ├── .eslintrc.json              # Config ESLint
│   ├── next.config.js              # Config Next.js
│   ├── tailwind.config.js          # Config Tailwind
│   ├── tsconfig.json               # Config TypeScript
│   └── package.json
│
├── backend/                         # API Go
│   ├── cmd/
│   │   └── main.go                  # Punto de entrada
│   ├── internal/                    # Código interno
│   │   ├── handlers/                # HTTP handlers
│   │   │   ├── auth.go
│   │   │   ├── expedientes.go
│   │   │   ├── users.go
│   │   │   └── juzgados.go
│   │   ├── middleware/              # Middlewares
│   │   │   ├── auth.go
│   │   │   ├── cors.go
│   │   │   ├── logger.go
│   │   │   └── rate_limit.go
│   │   ├── models/                  # Modelos de datos
│   │   │   ├── user.go
│   │   │   ├── expediente.go
│   │   │   ├── movimiento.go
│   │   │   └── juzgado.go
│   │   ├── services/                # Lógica de negocio
│   │   │   ├── auth_service.go
│   │   │   ├── expediente_service.go
│   │   │   └── user_service.go
│   │   ├── repository/              # Acceso a datos
│   │   │   ├── user_repository.go
│   │   │   └── expediente_repository.go
│   │   └── database/                # Configuración DB
│   │       ├── mongodb.go
│   │       └── migrations.go
│   ├── pkg/                         # Paquetes públicos
│   │   ├── auth/                    # JWT utilities
│   │   ├── validator/               # Validadores
│   │   └── utils/                   # Utilidades
│   ├── config/                      # Configuración
│   │   └── config.go
│   ├── .env.example                 # Ejemplo de variables
│   ├── go.mod                       # Dependencias Go
│   ├── Makefile                     # Comandos make
│   └── Dockerfile                   # Dockerfile para build
│
├── docs/                            # Documentación
│   ├── API.md                       # Documentación API
│   ├── FRONTEND.md                  # Arquitectura Frontend
│   ├── DATABASE.md                  # Esquema de BD
│   ├── DEPLOYMENT.md                # Guía de deployment
│   ├── images/                      # Diagramas e imágenes
│   └── postman/                     # Colección Postman
│
├── scripts/                         # Scripts de utilidad
│   ├── init-db.js                   # Inicializar BD
│   ├── seed-data.js                 # Datos de prueba
│   ├── backup.sh                    # Script de backup
│   ├── deploy.sh                    # Script de deploy
│   └── migrations/                  # Migraciones BD
│
├── k8s/                             # Kubernetes configs
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secrets.yaml
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   └── ingress.yaml
│
├── docker/                          # Dockerfiles adicionales
│   ├── backend.Dockerfile
│   ├── frontend.Dockerfile
│   └── nginx.conf
│
├── monitoring/                      # Configuración de monitoreo
│   ├── prometheus.yml
│   ├── grafana/
│   │   └── dashboards/
│   └── alerts.yml
│
├── tests/                           # Tests adicionales
│   ├── e2e/                        # Tests end-to-end
│   ├── integration/                # Tests de integración
│   └── performance/                # Tests de performance
│
├── .gitignore                       # Git ignore
├── .dockerignore                    # Docker ignore
├── docker-compose.yml               # Docker Compose desarrollo
├── docker-compose.prod.yml          # Docker Compose producción
├── README.md                        # Documentación principal
├── CONTRIBUTING.md                  # Guía de contribución
├── CHANGELOG.md                     # Registro de cambios
├── LICENSE                          # Licencia del proyecto
└── SECURITY.md                      # Política de seguridad
```

## 📦 Archivos Principales

### Documentación de Proyecto
- **README.md**: Documentación principal con guía de inicio rápido
- **CONTRIBUTING.md**: Guía para contribuidores
- **CHANGELOG.md**: Historia de versiones y cambios
- **LICENSE**: Licencia MIT
- **SECURITY.md**: Política de seguridad y reportes

### Configuración de GitHub
- **Issue Templates**: Templates para bugs, features, tareas y preguntas
- **PR Template**: Template para pull requests
- **Workflows**: GitHub Actions para CI/CD

### Frontend (Next.js)
- **src/app/**: Páginas y rutas usando App Router
- **src/components/**: Componentes reutilizables
- **src/hooks/**: Custom React hooks
- **src/lib/**: Utilidades y helpers
- **src/store/**: Estado global con Zustand
- **src/types/**: Definiciones TypeScript

### Backend (Go)
- **cmd/**: Punto de entrada de la aplicación
- **internal/**: Código interno de la aplicación
- **pkg/**: Paquetes reutilizables
- **config/**: Configuración de la aplicación

### Base de Datos
- **scripts/init-db.js**: Script de inicialización
- **scripts/seed-data.js**: Datos semilla
- **scripts/migrations/**: Migraciones de esquema

### Deployment
- **docker-compose.yml**: Desarrollo local
- **docker-compose.prod.yml**: Producción
- **k8s/**: Configuraciones Kubernetes
- **scripts/deploy.sh**: Script de deployment

### Monitoreo
- **monitoring/prometheus.yml**: Config Prometheus
- **monitoring/grafana/**: Dashboards Grafana

## 🚀 Comandos Principales

### Frontend
```bash
npm install          # Instalar dependencias
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run test         # Ejecutar tests
npm run lint         # Linter
```

### Backend
```bash
go mod download      # Descargar dependencias
go run cmd/main.go   # Ejecutar aplicación
go test ./...        # Ejecutar tests
make build           # Compilar
make run             # Ejecutar
```

### Docker
```bash
docker-compose up                              # Levantar servicios dev
docker-compose -f docker-compose.prod.yml up   # Levantar producción
docker-compose down                            # Bajar servicios
docker-compose logs -f                         # Ver logs
```

### Base de Datos
```bash
mongo < scripts/init-db.js                     # Inicializar BD
mongo < scripts/seed-data.js                   # Cargar datos
docker exec mongodb mongodump --archive=backup.archive  # Backup
```

## 📋 Convenciones

### Naming
- **Archivos**: kebab-case (ej. `user-service.go`)
- **Componentes React**: PascalCase (ej. `UserCard.tsx`)
- **Funciones Go**: camelCase/PascalCase según visibilidad
- **Variables**: camelCase
- **Constantes**: UPPER_SNAKE_CASE

### Commits
Seguimos Conventional Commits:
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Formateo de código
- `refactor:` Refactoring
- `test:` Tests
- `chore:` Tareas de mantenimiento

### Branches
- `main`: Rama principal (producción)
- `develop`: Rama de desarrollo
- `feature/nombre`: Nuevas funcionalidades
- `fix/nombre`: Correcciones
- `hotfix/nombre`: Correcciones urgentes

## 🎯 Próximos Pasos

1. Configurar el entorno de desarrollo
2. Crear estructura de carpetas
3. Implementar backend básico
4. Implementar frontend básico
5. Configurar base de datos
6. Implementar autenticación
7. Desarrollar módulos principales
8. Agregar tests
9. Configurar CI/CD
10. Deployment

---

**Última actualización:** 2024-11-02