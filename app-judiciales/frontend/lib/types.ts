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

// User types
export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  documento: string;
  telefono?: string;
  profile_id?: string;
  roles?: string[];
  activo?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  documento: string;
  telefono?: string;
  profile_id?: string;
  roles?: string[];
}

export interface UpdateUserInput {
  email?: string;
  password?: string;
  nombre?: string;
  apellido?: string;
  documento?: string;
  telefono?: string;
  profile_id?: string;
  roles?: string[];
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
export interface Expediente {
  id: string
  numero_expediente: string
  titulo: string
  descripcion?: string
  estado: 'Activo' | 'Archivado' | 'En proceso' | 'Cerrado'
  fecha_inicio: string
  fecha_fin?: string
  juzgado?: string
  tipo_proceso?: string
  partes?: string
  created_at: string
  updated_at: string
}

export interface CreateExpedienteInput {
  numero_expediente: string
  titulo: string
  descripcion?: string
  estado: 'Activo' | 'Archivado' | 'En proceso' | 'Cerrado'
  fecha_inicio: string
  fecha_fin?: string
  juzgado?: string
  tipo_proceso?: string
  partes?: string
}

export interface UpdateExpedienteInput {
  numero_expediente?: string
  titulo?: string
  descripcion?: string
  estado?: 'Activo' | 'Archivado' | 'En proceso' | 'Cerrado'
  fecha_inicio?: string
  fecha_fin?: string
  juzgado?: string
  tipo_proceso?: string
  partes?: string
}

export interface ListExpedientesResponse {
  data: Expediente[]
  pagination: PaginationData
}

export interface ExpedienteSearchParams {
  page?: number
  limit?: number
  numero_expediente?: string
  titulo?: string
  estado?: string
  juzgado?: string
}

// Profile types
export interface Profile {
  id: string;
  name: string;
  slug: string;
  roles: string[];
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ListProfilesResponse {
  data: Profile[];
}
