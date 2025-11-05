// Person types
export interface Person {
    id: string;
    dni: string;
    nombre: string;
    edad: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePersonInput {
    dni: string;
    nombre: string;
    edad: number;
}

export interface UpdatePersonInput {
    dni?: string;
    nombre?: string;
    edad?: number;
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
}

export interface ApiError {
    error: string;
    message?: string;
}

// Pagination types
export interface PaginationData {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ListPersonsResponse {
    data: Person[];
    pagination: PaginationData;
}

// Search parameters
export interface SearchParams {
    page?: number;
    limit?: number;
    dni?: string;
}

// User types - Según Swagger
export interface User {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    documento: string;
    profile_id?: string;
    activo: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateUserInput {
    email: string;
    password: string;
    nombre: string;
    apellido: string;
    documento: string;
    profile_id: string;
}

export interface UpdateUserInput {
    email?: string;
    password?: string;
    nombre?: string;
    apellido?: string;
    documento?: string;
    activo?: boolean;
}

export interface ListUsersResponse {
    data: User[];
    pagination: PaginationData;
}

export interface UserSearchParams {
    page?: number;
    limit?: number;
    email?: string;
    nombre?: string;
    documento?: string;
}

// Expedientes
// Profile types - Según Swagger
export interface Permission {
    name: string;
    description: string;
    category: 'users' | 'profiles' | 'expedientes' | 'system';
}

export interface Profile {
    id: string;
    name: string;
    slug: string;
    description?: string;
    permissions: string[]; // Array de nombres de permisos como strings
    active?: boolean; // Opcional porque el backend puede no enviarlo
    is_system: boolean;
    created_at: string;
    updated_at: string;
}

export interface ListProfilesResponse {
    data: Profile[];
}

export interface CreateProfileInput {
    name: string;
    slug: string;
    description?: string;
    active?: boolean;
    permissions: string[]; // Array de nombres de permisos como strings
}

export interface UpdateProfileInput {
    name?: string;
    slug?: string;
    description?: string;
    active?: boolean;
    permissions?: string[]; // Array de nombres de permisos como strings
}

export interface AvailablePermissions {
    [resource: string]: string[];
}

// Permisos disponibles según documentación
export const AVAILABLE_PERMISSIONS: Permission[] = [
    // Users
    { name: 'user:read', description: 'Ver usuarios', category: 'users' },
    { name: 'user:create', description: 'Crear usuarios', category: 'users' },
    { name: 'user:update', description: 'Actualizar usuarios', category: 'users' },
    { name: 'user:delete', description: 'Eliminar usuarios', category: 'users' },
    
    // Profiles
    { name: 'profile:read', description: 'Ver perfiles', category: 'profiles' },
    { name: 'profile:create', description: 'Crear perfiles', category: 'profiles' },
    { name: 'profile:update', description: 'Actualizar perfiles', category: 'profiles' },
    { name: 'profile:delete', description: 'Eliminar perfiles', category: 'profiles' },
    
    // Expedientes
    { name: 'expediente:read', description: 'Ver expedientes', category: 'expedientes' },
    { name: 'expediente:create', description: 'Crear expedientes', category: 'expedientes' },
    { name: 'expediente:update', description: 'Actualizar expedientes', category: 'expedientes' },
    { name: 'expediente:delete', description: 'Eliminar expedientes', category: 'expedientes' },
    
    // System
    { name: 'system:admin', description: 'Administrador del sistema', category: 'system' },
];

// Permisos agrupados por categoría
export const PERMISSIONS_BY_CATEGORY = {
    users: AVAILABLE_PERMISSIONS.filter(p => p.category === 'users'),
    profiles: AVAILABLE_PERMISSIONS.filter(p => p.category === 'profiles'),
    expedientes: AVAILABLE_PERMISSIONS.filter(p => p.category === 'expedientes'),
    system: AVAILABLE_PERMISSIONS.filter(p => p.category === 'system'),
};

// Expedientes types - Según Swagger
export type Grado = 'GRAL' | 'CRL' | 'TTE CRL' | 'MY' | 'CAP' | 'TTE' | 'STTE' | 'TCO' | 'SSOO' | 'EC' | 'TROPA';
export type SituacionMilitar = 'Actividad' | 'Retiro';
export type ExpedienteEstado = 'dentro' | 'fuera';

// Enum values for dropdowns
export const GradoValues: Grado[] = ['GRAL', 'CRL', 'TTE CRL', 'MY', 'CAP', 'TTE', 'STTE', 'TCO', 'SSOO', 'EC', 'TROPA'];
export const SituacionMilitarValues: SituacionMilitar[] = ['Actividad', 'Retiro'];
export const EstadoExpedienteValues: ExpedienteEstado[] = ['dentro', 'fuera'];

// Labels for display
export const GradoLabels: Record<Grado, string> = {
    'GRAL': 'General',
    'CRL': 'Coronel',
    'TTE CRL': 'Teniente Coronel',
    'MY': 'Mayor',
    'CAP': 'Capitán',
    'TTE': 'Teniente',
    'STTE': 'Subteniente',
    'TCO': 'Técnico (TCO)',
    'SSOO': 'Suboficial (SSOO)',
    'EC': 'Empleado Civil (EC)',
    'TROPA': 'Tropa'
};

export const SituacionMilitarLabels: Record<SituacionMilitar, string> = {
    'Actividad': 'En Actividad',
    'Retiro': 'En Retiro'
};

export const EstadoExpedienteLabels: Record<ExpedienteEstado, string> = {
    'dentro': 'Dentro',
    'fuera': 'Fuera'
};

export interface Expediente {
    id: string;
    grado: Grado;
    apellidos_nombres: string;
    cip: string;
    numero_paginas: number;
    situacion_militar: SituacionMilitar;
    ubicacion: string;
    orden: number;
    estado: ExpedienteEstado;
    fecha_registro: string;
    fecha_actualizacion: string;
    created_at: string;
    updated_at: string;
    created_by: string;
    updated_by: string;
}

export interface CreateExpedienteInput {
    grado: Grado;
    apellidos_nombres: string;
    cip: string;
    numero_paginas: number;
    situacion_militar: SituacionMilitar;
    ubicacion: string;
    orden: number;
}

export interface UpdateExpedienteInput {
    grado?: Grado;
    apellidos_nombres?: string;
    cip?: string;
    numero_paginas?: number;
    situacion_militar?: SituacionMilitar;
    ubicacion?: string;
    orden?: number;
    estado?: ExpedienteEstado;
}

export interface ExpedienteSearchParams {
    page?: number;
    limit?: number;
    grado?: Grado;
    situacion_militar?: SituacionMilitar;
    estado?: ExpedienteEstado;
}

export interface ListExpedientesResponse {
    data: Expediente[];
    pagination?: PaginationData;
}

// Bulk import types
export interface BulkImportResult {
    total_processed: number;
    successful_imports: number;
    failed_imports: number;
    errors: Array<{
        row: number;
        errors: string[];
    }>;
}

// Dashboard statistics types
export interface EstadoStats {
    estado: string;
    total: number;
    porcentaje: number;
    total_paginas: number;
}

export interface GradoStats {
    grado: Grado;
    total: number;
    dentro: number;
    fuera: number;
    actividad: number;
    retiro: number;
    porcentaje: number;
    total_paginas: number;
}

export interface SituacionStats {
    situacion: string;
    total: number;
    porcentaje: number;
    total_paginas: number;
}

export interface UbicacionStats {
    ubicacion: string;
    total: number;
    porcentaje: number;
    total_paginas: number;
}

export interface EstadisticaTemporalPoint {
    ano: number;
    mes?: number;
    mes_nombre?: string;
    total: number;
    porcentaje: number;
}

export interface EstadisticasTemporales {
    registros_por_mes?: EstadisticaTemporalPoint[] | null;
    registros_por_ano?: EstadisticaTemporalPoint[] | null;
    ultimos_30_dias: number;
    tendencia_mensual: string;
}

export interface ResumenGeneral {
    total_expedientes: number;
    expedientes_dentro: number;
    expedientes_fuera: number;
    porcentaje_dentro: number;
    porcentaje_fuera: number;
    personal_actividad: number;
    personal_retiro: number;
    porcentaje_actividad: number;
    porcentaje_retiro: number;
    promedio_paginas_por_expediente: number;
    total_paginas: number;
    ubicaciones_unicas: number;
}

export interface DashboardStats {
    estadisticas_por_estado: EstadoStats[] | null;
    estadisticas_por_grado: GradoStats[] | null;
    estadisticas_por_situacion: SituacionStats[] | null;
    estadisticas_por_ubicacion: UbicacionStats[] | null;
    estadisticas_temporales: EstadisticasTemporales;
    generado_en: string; // date-time
    resumen_general: ResumenGeneral;
}