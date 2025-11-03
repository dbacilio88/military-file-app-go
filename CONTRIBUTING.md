# Guía de Contribución

¡Gracias por tu interés en contribuir al Sistema de Registro de Expedientes Judiciales! Esta guía te ayudará a participar efectivamente en el desarrollo del proyecto.

## 📋 Tabla de Contenidos

1. [Código de Conducta](#código-de-conducta)
2. [Cómo Contribuir](#cómo-contribuir)
3. [Configuración del Entorno](#configuración-del-entorno)
4. [Estándares de Código](#estándares-de-código)
5. [Process de Pull Request](#proceso-de-pull-request)
6. [Estructura de Commits](#estructura-de-commits)
7. [Testing](#testing)
8. [Documentación](#documentación)

## 📜 Código de Conducta

Este proyecto adhiere al código de conducta del Contributor Covenant. Al participar, esperas mantener este código. Por favor reporta comportamientos inaceptables a [email@proyecto.com].

## 🤝 Cómo Contribuir

### Tipos de Contribuciones

- 🐛 **Bug Reports**: Reportar errores encontrados
- ✨ **Feature Requests**: Sugerir nuevas funcionalidades
- 📝 **Documentación**: Mejorar o agregar documentación
- 💻 **Código**: Implementar features o corregir bugs
- 🧪 **Testing**: Agregar o mejorar tests
- 🎨 **UI/UX**: Mejoras en la interfaz de usuario

### Antes de Contribuir

1. Revisa los [issues abiertos](https://github.com/tu-usuario/judicial-records-system/issues)
2. Busca si ya existe una issue similar
3. Para features grandes, abre primero una issue para discusión
4. Lee esta guía completa

## 🛠️ Configuración del Entorno

### Prerrequisitos

```bash
# Versiones requeridas
Node.js >= 18.0.0
Go >= 1.25.1
MongoDB >= 6.0
Git >= 2.30
```

### Setup Inicial

```bash
# 1. Fork del repositorio en GitHub

# 2. Clonar tu fork
git clone https://github.com/TU-USERNAME/judicial-records-system.git
cd judicial-records-system

# 3. Agregar upstream remote
git remote add upstream https://github.com/ORIGINAL-OWNER/judicial-records-system.git

# 4. Instalar dependencias backend
cd backend
go mod download
go install github.com/cosmtrek/air@latest  # Hot reload
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

# 5. Instalar dependencias frontend
cd ../frontend
npm install

# 6. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus configuraciones

# 7. Configurar pre-commit hooks
npm install -g @commitlint/cli @commitlint/config-conventional
npm install -g husky
husky install
```

### Base de Datos Local

```bash
# Opción 1: Docker (Recomendado)
docker run -d \
  --name mongodb-judicial \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:6.0

# Opción 2: Instalación local de MongoDB
# Seguir las instrucciones oficiales de MongoDB
```

## 📝 Estándares de Código

### Go (Backend)

#### Convenciones de Naming

```go
// ✅ Correcto
type UserService struct {
    repository UserRepository
}

func (s *UserService) CreateUser(ctx context.Context, user *models.User) error {
    // implementación
}

// ❌ Incorrecto
type userservice struct {
    repo UserRepository
}

func (s *userservice) create_user(user *models.User) error {
    // implementación
}
```

#### Estructura de Archivos

```go
// handlers/user.go
package handlers

import (
    "context"
    "net/http"
    
    "github.com/gin-gonic/gin"
    "tu-proyecto/internal/models"
    "tu-proyecto/internal/services"
)

type UserHandler struct {
    userService services.UserService
}

func NewUserHandler(userService services.UserService) *UserHandler {
    return &UserHandler{
        userService: userService,
    }
}

func (h *UserHandler) CreateUser(c *gin.Context) {
    // implementación
}
```

#### Manejo de Errores

```go
// ✅ Correcto
func (s *Service) ProcessData(data string) (*Result, error) {
    if data == "" {
        return nil, fmt.Errorf("data cannot be empty")
    }
    
    result, err := s.repository.Save(data)
    if err != nil {
        return nil, fmt.Errorf("failed to save data: %w", err)
    }
    
    return result, nil
}

// ❌ Incorrecto
func (s *Service) ProcessData(data string) *Result {
    result, _ := s.repository.Save(data) // Ignorando error
    return result
}
```

### TypeScript/Next.js (Frontend)

#### Componentes

```tsx
// ✅ Correcto - components/UserCard.tsx
import { FC } from 'react'

interface UserCardProps {
  user: User
  onEdit?: (user: User) => void
  className?: string
}

export const UserCard: FC<UserCardProps> = ({ user, onEdit, className }) => {
  return (
    <div className={cn('border rounded-lg p-4', className)}>
      <h3 className="font-semibold">{user.name}</h3>
      {onEdit && (
        <button onClick={() => onEdit(user)}>
          Editar
        </button>
      )}
    </div>
  )
}

// ❌ Incorrecto
export default function usercard({ user, onEdit }: any) {
  return <div>{user.name}</div>
}
```

#### Hooks Personalizados

```tsx
// hooks/useExpedientes.ts
import { useState, useEffect } from 'react'
import { Expediente } from '@/types'

export const useExpedientes = (filters?: ExpedienteFilters) => {
  const [expedientes, setExpedientes] = useState<Expediente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchExpedientes = async () => {
      try {
        setLoading(true)
        const data = await expedienteService.getAll(filters)
        setExpedientes(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchExpedientes()
  }, [filters])

  return { expedientes, loading, error }
}
```

### Linting y Formateo

#### Backend (Go)

```bash
# Ejecutar linter
golangci-lint run

# Formatear código
go fmt ./...
goimports -w .
```

#### Frontend (TypeScript)

```bash
# Linting
npm run lint
npm run lint:fix

# Formateo
npm run format

# Type checking
npm run type-check
```

## 🔄 Proceso de Pull Request

### 1. Preparación

```bash
# Actualizar tu fork
git checkout main
git fetch upstream
git merge upstream/main
git push origin main

# Crear rama feature
git checkout -b feature/nombre-descriptivo
```

### 2. Desarrollo

```bash
# Hacer cambios
# ...

# Commit siguiendo conventional commits
git add .
git commit -m "feat: agregar validación de expedientes"

# Push a tu fork
git push origin feature/nombre-descriptivo
```

### 3. Pull Request

1. Ve a GitHub y crea el PR
2. Completa la plantilla de PR
3. Asigna reviewers apropiados
4. Enlaza issues relacionadas

### 4. Code Review

- Responde a comentarios constructivamente
- Realiza cambios solicitados
- Mantén la conversación profesional
- Agradece el feedback

### 5. Merge

- Los maintainers harán merge después de aprobación
- La rama será eliminada automáticamente

## 📝 Estructura de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Formato
<tipo>[ámbito opcional]: <descripción>

[cuerpo opcional]

[footer opcional]
```

### Tipos de Commit

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formateo, punto y coma faltante, etc.
- `refactor`: Refactoring de código
- `test`: Agregar o corregir tests
- `chore`: Tareas de mantenimiento

### Ejemplos

```bash
# Feature
git commit -m "feat(expedientes): agregar filtro por fecha"

# Bug fix
git commit -m "fix(auth): corregir validación de JWT"

# Documentation
git commit -m "docs: actualizar guía de instalación"

# Breaking change
git commit -m "feat!: cambiar estructura de API de usuarios

BREAKING CHANGE: el endpoint /users ahora devuelve un objeto con metadata"
```

## 🧪 Testing

### Backend Tests

```bash
# Ejecutar todos los tests
go test ./...

# Tests con coverage
go test -cover ./...

# Tests de integración
go test -tags=integration ./...
```

#### Estructura de Test

```go
// users_test.go
func TestUserService_CreateUser(t *testing.T) {
    tests := []struct {
        name    string
        user    *models.User
        want    *models.User
        wantErr bool
    }{
        {
            name: "create valid user",
            user: &models.User{
                Name:  "Juan Pérez",
                Email: "juan@example.com",
            },
            want: &models.User{
                ID:    "generated-id",
                Name:  "Juan Pérez",
                Email: "juan@example.com",
            },
            wantErr: false,
        },
        {
            name: "create user with empty name",
            user: &models.User{
                Email: "juan@example.com",
            },
            want:    nil,
            wantErr: true,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            // Test implementation
        })
    }
}
```

### Frontend Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

#### Componente Test

```tsx
// UserCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { UserCard } from './UserCard'

describe('UserCard', () => {
  const mockUser = {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan@example.com'
  }

  it('renders user information', () => {
    render(<UserCard user={mockUser} />)
    
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
    expect(screen.getByText('juan@example.com')).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = jest.fn()
    render(<UserCard user={mockUser} onEdit={onEdit} />)
    
    fireEvent.click(screen.getByText('Editar'))
    expect(onEdit).toHaveBeenCalledWith(mockUser)
  })
})
```

## 📚 Documentación

### Comentarios en Código

#### Go

```go
// UserService provides user management functionality.
// It handles user creation, authentication, and profile management.
type UserService struct {
    repository UserRepository
    logger     Logger
}

// CreateUser creates a new user account with the provided information.
// It validates the input, checks for duplicates, and stores the user.
//
// Returns the created user with generated ID or an error if validation fails.
func (s *UserService) CreateUser(ctx context.Context, user *models.User) (*models.User, error) {
    // Implementation
}
```

#### TypeScript

```tsx
/**
 * UserCard component displays user information in a card format.
 * 
 * @param user - The user object to display
 * @param onEdit - Optional callback when edit button is clicked
 * @param className - Additional CSS classes
 */
export const UserCard: FC<UserCardProps> = ({ user, onEdit, className }) => {
  // Implementation
}
```

### API Documentation

Documentar endpoints con comentarios OpenAPI:

```go
// @Summary Create a new user
// @Description Create a new user account with the provided information
// @Tags users
// @Accept json
// @Produce json
// @Param user body models.CreateUserRequest true "User information"
// @Success 201 {object} models.User
// @Failure 400 {object} models.ErrorResponse
// @Failure 409 {object} models.ErrorResponse
// @Router /api/users [post]
func (h *UserHandler) CreateUser(c *gin.Context) {
    // Implementation
}
```

## ❓ Preguntas Frecuentes

### ¿Cómo reporto un bug?

1. Busca si ya existe una issue similar
2. Usa la plantilla de bug report
3. Incluye pasos para reproducir
4. Agrega capturas de pantalla si es relevante

### ¿Cómo propongo una nueva feature?

1. Abre una issue con la plantilla de feature request
2. Describe el problema que resuelve
3. Propón una solución
4. Espera feedback antes de implementar

### ¿Necesito tests para mi contribución?

Sí, toda nueva funcionalidad debe incluir tests. Para bug fixes, agrega tests que cubran el caso que falló.

### ¿Qué hago si mi PR tiene conflictos?

```bash
# Actualizar tu rama con main
git checkout main
git pull upstream main
git checkout tu-rama-feature
git rebase main

# Resolver conflictos si existen
# Después de resolver:
git push --force-with-lease origin tu-rama-feature
```

## 📞 Obtener Ayuda

- 💬 **Discord**: [Enlace al servidor]
- 📧 **Email**: dev@judicial-system.com
- 📋 **Issues**: Para bugs y features
- 💡 **Discussions**: Para preguntas generales

---

¡Gracias por contribuir al Sistema de Registro de Expedientes Judiciales! 🚀