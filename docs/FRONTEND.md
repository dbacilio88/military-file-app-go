# Frontend Architecture - Next.js

## 📋 Índice

1. [Arquitectura General](#arquitectura-general)
2. [Estructura de Carpetas](#estructura-de-carpetas)
3. [Tecnologías y Librerías](#tecnologías-y-librerías)
4. [Sistema de Rutas](#sistema-de-rutas)
5. [Componentes](#componentes)
6. [Estado Global](#estado-global)
7. [Autenticación](#autenticación)
8. [Estilos y Temas](#estilos-y-temas)
9. [Optimizaciones](#optimizaciones)
10. [Testing](#testing)

## 🏗️ Arquitectura General

La aplicación frontend está construida con **Next.js 14+** usando el **App Router** y sigue los principios de **Clean Architecture** adaptados para React.

### Capas de la Arquitectura

```
┌─────────────────────────────────────────┐
│              Presentation               │
│         (Pages & Components)            │
├─────────────────────────────────────────┤
│               Application               │
│            (Hooks & Services)           │
├─────────────────────────────────────────┤
│                Domain                   │
│           (Types & Entities)            │
├─────────────────────────────────────────┤
│             Infrastructure              │
│          (API & External Services)      │
└─────────────────────────────────────────┘
```

## 📁 Estructura de Carpetas

```
frontend/
├── src/
│   ├── app/                        # App Router (Next.js 14+)
│   │   ├── (auth)/                # Rutas de autenticación
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/           # Rutas del dashboard
│   │   │   ├── expedientes/
│   │   │   ├── usuarios/
│   │   │   ├── reportes/
│   │   │   └── configuracion/
│   │   ├── api/                   # API Routes (si necesarias)
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   └── page.tsx
│   ├── components/                # Componentes reutilizables
│   │   ├── ui/                   # Componentes base (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── modal.tsx
│   │   │   └── ...
│   │   ├── forms/                # Componentes de formularios
│   │   │   ├── expediente-form.tsx
│   │   │   ├── user-form.tsx
│   │   │   └── ...
│   │   ├── layout/               # Componentes de layout
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── footer.tsx
│   │   │   └── navigation.tsx
│   │   ├── tables/               # Componentes de tablas
│   │   │   ├── expedientes-table.tsx
│   │   │   ├── users-table.tsx
│   │   │   └── data-table.tsx
│   │   └── charts/               # Componentes de gráficos
│   │       ├── dashboard-charts.tsx
│   │       └── report-charts.tsx
│   ├── hooks/                    # Custom hooks
│   │   ├── use-auth.ts
│   │   ├── use-expedientes.ts
│   │   ├── use-local-storage.ts
│   │   └── ...
│   ├── lib/                      # Utilidades y configuraciones
│   │   ├── api.ts               # Cliente API
│   │   ├── auth.ts              # Configuración de auth
│   │   ├── utils.ts             # Utilidades generales
│   │   ├── validations.ts       # Esquemas de validación
│   │   └── constants.ts         # Constantes
│   ├── providers/               # Context providers
│   │   ├── auth-provider.tsx
│   │   ├── theme-provider.tsx
│   │   └── query-provider.tsx
│   ├── store/                   # Estado global (Zustand)
│   │   ├── auth-store.ts
│   │   ├── expedientes-store.ts
│   │   └── ui-store.ts
│   ├── types/                   # Definiciones de tipos
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── expediente.ts
│   │   └── user.ts
│   └── styles/                  # Estilos globales
│       ├── globals.css
│       └── components.css
├── public/                      # Archivos estáticos
│   ├── images/
│   ├── icons/
│   └── favicon.ico
├── .env.local                   # Variables de entorno
├── .env.example                 # Ejemplo de variables
├── next.config.js              # Configuración de Next.js
├── tailwind.config.js          # Configuración de Tailwind
├── tsconfig.json               # Configuración de TypeScript
└── package.json
```

## 🛠️ Tecnologías y Librerías

### Core

- **Next.js 14+**: Framework React con App Router
- **React 18**: Biblioteca UI con Server Components
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Framework de estilos

### UI Components

- **shadcn/ui**: Componentes de UI modernos
- **Radix UI**: Componentes primitivos accesibles
- **Lucide React**: Íconos SVG
- **React Hook Form**: Manejo de formularios
- **Zod**: Validación de esquemas

### Estado y Datos

- **Zustand**: Estado global ligero
- **TanStack Query**: Cache y sincronización de datos
- **SWR**: Alternative para fetching de datos

### Utilidades

- **clsx**: Utilidad para clases CSS
- **date-fns**: Manipulación de fechas
- **react-hot-toast**: Notificaciones toast

## 🛣️ Sistema de Rutas

### App Router Structure

```typescript
// app/layout.tsx - Layout raíz
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

// app/(auth)/layout.tsx - Layout de autenticación
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full">
        {children}
      </div>
    </div>
  )
}

// app/(dashboard)/layout.tsx - Layout del dashboard
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### Rutas Protegidas

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAuth } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  const isValid = await verifyAuth(token)
  if (!isValid) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/expedientes/:path*',
    '/usuarios/:path*',
    '/reportes/:path*'
  ]
}
```

## 🧩 Componentes

### Arquitectura de Componentes

```typescript
// components/ui/button.tsx - Componente base
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
```

### Componente de Formulario

```typescript
// components/forms/expediente-form.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { expedienteSchema } from '@/lib/validations'
import type { ExpedienteFormData } from '@/types/expediente'

interface ExpedienteFormProps {
  expediente?: Expediente
  onSubmit: (data: ExpedienteFormData) => Promise<void>
  onCancel: () => void
}

export function ExpedienteForm({ expediente, onSubmit, onCancel }: ExpedienteFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue
  } = useForm<ExpedienteFormData>({
    resolver: zodResolver(expedienteSchema),
    defaultValues: expediente ? {
      descripcion: expediente.descripcion,
      tipo: expediente.tipo,
      // ... otros campos
    } : {}
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Descripción"
          error={errors.descripcion?.message}
          required
        >
          <Input
            {...register('descripcion')}
            placeholder="Ingrese la descripción del expediente"
          />
        </FormField>

        <FormField
          label="Tipo"
          error={errors.tipo?.message}
          required
        >
          <Select {...register('tipo')}>
            <SelectItem value="civil">Civil</SelectItem>
            <SelectItem value="penal">Penal</SelectItem>
            <SelectItem value="laboral">Laboral</SelectItem>
            <SelectItem value="familia">Familia</SelectItem>
          </Select>
        </FormField>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}
```

### Componente de Tabla de Datos

```typescript
// components/tables/data-table.tsx
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel
} from '@tanstack/react-table'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  onRowClick?: (row: TData) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  onRowClick
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [filtering, setFiltering] = useState('')

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setFiltering,
    state: {
      sorting,
      globalFilter: filtering
    }
  })

  return (
    <div className="space-y-4">
      {searchKey && (
        <div className="flex items-center">
          <Input
            placeholder={`Buscar ${searchKey}...`}
            value={filtering}
            onChange={(e) => setFiltering(e.target.value)}
            className="max-w-sm"
          />
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  )
}
```

## 🗄️ Estado Global

### Zustand Store

```typescript
// store/auth-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/user'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true
        })
      },
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false
        })
      },
      updateUser: (userData) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData }
          })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
```

### TanStack Query

```typescript
// hooks/use-expedientes.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { expedienteService } from '@/lib/api'
import type { Expediente, ExpedienteFilters } from '@/types/expediente'

export function useExpedientes(filters?: ExpedienteFilters) {
  return useQuery({
    queryKey: ['expedientes', filters],
    queryFn: () => expedienteService.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
  })
}

export function useExpediente(id: string) {
  return useQuery({
    queryKey: ['expediente', id],
    queryFn: () => expedienteService.getById(id),
    enabled: !!id,
  })
}

export function useCreateExpediente() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: expedienteService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expedientes'] })
      toast.success('Expediente creado exitosamente')
    },
    onError: (error) => {
      toast.error('Error al crear expediente')
    },
  })
}
```

## 🔐 Autenticación

### Auth Provider

```typescript
// providers/auth-provider.tsx
'use client'

import { createContext, useContext, useEffect } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { authService } from '@/lib/api'

interface AuthContextType {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (userData: RegisterData) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { login: setAuth, logout: clearAuth, token } = useAuthStore()

  useEffect(() => {
    // Verificar token al cargar la aplicación
    if (token) {
      authService.verifyToken(token).catch(() => {
        clearAuth()
      })
    }
  }, [token, clearAuth])

  const login = async (email: string, password: string) => {
    const { user, token } = await authService.login(email, password)
    setAuth(user, token)
  }

  const logout = () => {
    authService.logout()
    clearAuth()
  }

  const register = async (userData: RegisterData) => {
    const { user, token } = await authService.register(userData)
    setAuth(user, token)
  }

  return (
    <AuthContext.Provider value={{ login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

## 🎨 Estilos y Temas

### Tailwind Configuration

```javascript
// tailwind.config.js
const { fontFamily } = require('tailwindcss/defaultTheme')

module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        judicial: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          900: '#0c4a6e',
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
```

### Theme Provider

```typescript
// providers/theme-provider.tsx
'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

## ⚡ Optimizaciones

### Performance

```typescript
// lib/performance.ts

// Lazy loading de componentes
const ExpedienteModal = lazy(() => import('@/components/modals/expediente-modal'))
const ReportChart = lazy(() => import('@/components/charts/report-chart'))

// Memoización de componentes pesados
const ExpedienteTable = memo(({ expedientes, onEdit, onDelete }) => {
  // Implementación de tabla
})

// Virtual scrolling para listas grandes
import { FixedSizeList as List } from 'react-window'

function VirtualizedExpedienteList({ expedientes }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <ExpedienteCard expediente={expedientes[index]} />
    </div>
  )

  return (
    <List
      height={600}
      itemCount={expedientes.length}
      itemSize={100}
    >
      {Row}
    </List>
  )
}
```

### Next.js Optimizations

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['api.judicial-system.com'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  httpAgentOptions: {
    keepAlive: true,
  },
}

module.exports = nextConfig
```

## 🧪 Testing

### Testing Setup

```typescript
// __tests__/components/expediente-form.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExpedienteForm } from '@/components/forms/expediente-form'

const mockOnSubmit = jest.fn()
const mockOnCancel = jest.fn()

describe('ExpedienteForm', () => {
  beforeEach(() => {
    mockOnSubmit.mockClear()
    mockOnCancel.mockClear()
  })

  it('renders form fields correctly', () => {
    render(<ExpedienteForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/tipo/i)).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(<ExpedienteForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    
    const submitButton = screen.getByRole('button', { name: /guardar/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/descripción es requerida/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    render(<ExpedienteForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    await user.type(screen.getByLabelText(/descripción/i), 'Test Expediente')
    await user.selectOptions(screen.getByLabelText(/tipo/i), 'civil')
    
    const submitButton = screen.getByRole('button', { name: /guardar/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        descripcion: 'Test Expediente',
        tipo: 'civil'
      })
    })
  })
})
```

### E2E Testing

```typescript
// e2e/expedientes.spec.ts
import { test, expect } from '@playwright/test'

test('should create new expediente', async ({ page }) => {
  await page.goto('/login')
  
  // Login
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')

  // Navigate to expedientes
  await page.goto('/expedientes')
  await page.click('text=Nuevo Expediente')

  // Fill form
  await page.fill('[name="descripcion"]', 'Test E2E Expediente')
  await page.selectOption('[name="tipo"]', 'civil')
  
  // Submit
  await page.click('button[type="submit"]')

  // Verify creation
  await expect(page.locator('text=Test E2E Expediente')).toBeVisible()
})
```

---

**Arquitectura diseñada para escalabilidad y mantenibilidad**  
**Actualizado**: 2024-11-02