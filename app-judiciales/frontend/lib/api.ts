/**
 * Centralized API Module
 * 
 * This module contains ALL API calls to the backend.
 * All components should import functions from this file instead of making direct fetch calls.
 * 
 * Architecture:
 * - Uses environment variable NEXT_PUBLIC_API_URL (defaults to /api/v1)
 * - All requests go through Next.js proxy to avoid CORS issues
 * - Automatic token management from localStorage
 * - Centralized error handling with automatic redirect on 401
 * 
 * Available API sections:
 * - AUTH: login
 * - PERSONS: CRUD operations
 * - USERS: CRUD operations with pagination
 * - PROFILES: CRUD operations with permissions
 * - EXPEDIENTES: CRUD operations with filters
 */

import {
  Person,
  CreatePersonInput,
  UpdatePersonInput,
  ListPersonsResponse,
  User,
  CreateUserInput,
  UpdateUserInput,
  ListUsersResponse,
  UserSearchParams,
  Profile,
  Permission,
  CreateProfileInput,
  UpdateProfileInput,
  Expediente,
  CreateExpedienteInput,
  UpdateExpedienteInput,
  ExpedienteSearchParams,
  ApiResponse,
  SearchParams,
  DashboardStats,
  LoginCredentials,
  LoginResponse,
} from './types';

// Use environment variable for API URL - Usar proxy de Next.js para evitar CORS
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

// DEMO DATA - Para cuando no hay backend
const DEMO_MODE = false; // Cambiar a false cuando tengas backend real

const DEMO_USERS: User[] = [
  {
    id: '1',
    email: 'admin@military.gov',
    nombre: 'Usuario',
    apellido: 'Administrador',
    documento: '12345678',
    profile_id: 'admin-profile',
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profile: {
      id: 'admin-profile',
      name: 'Administrador',
      slug: 'admin',
      description: 'Usuario administrador del sistema',
      permissions: ['system:admin'],
      is_system: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  {
    id: '2',
    email: 'juan.perez@military.gov',
    nombre: 'Juan',
    apellido: 'Pérez',
    documento: '87654321',
    profile_id: 'user-profile',
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profile: {
      id: 'user-profile',
      name: 'Usuario',
      slug: 'user',
      description: 'Usuario estándar del sistema',
      permissions: ['expediente:read', 'user:read'],
      is_system: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  {
    id: '3',
    email: 'maria.rodriguez@military.gov',
    nombre: 'María',
    apellido: 'Rodríguez',
    documento: '11223344',
    profile_id: 'editor-profile',
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profile: {
      id: 'editor-profile',
      name: 'Editor',
      slug: 'editor',
      description: 'Usuario con permisos de edición',
      permissions: ['expediente:read', 'expediente:create', 'expediente:update', 'user:read'],
      is_system: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }
];

const DEMO_PROFILES: Profile[] = [
  {
    id: 'admin-profile',
    name: 'Administrador',
    slug: 'admin',
    description: 'Usuario administrador del sistema',
    permissions: ['system:admin', 'user:read', 'user:create', 'user:update', 'user:delete', 'expediente:read', 'expediente:create', 'expediente:update', 'expediente:delete', 'profile:read', 'profile:create', 'profile:update', 'profile:delete'],
    active: true,
    is_system: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'user-profile',
    name: 'Usuario',
    slug: 'user',
    description: 'Usuario estándar del sistema',
    permissions: ['expediente:read', 'user:read'],
    active: true,
    is_system: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'editor-profile',
    name: 'Editor',
    slug: 'editor',
    description: 'Usuario con permisos de edición',
    permissions: ['expediente:read', 'expediente:create', 'expediente:update', 'user:read'],
    active: true,
    is_system: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const DEMO_EXPEDIENTES: Expediente[] = [
  {
    id: '1',
    grado: 'CAP',
    apellidos_nombres: 'PÉREZ GONZÁLEZ, JUAN CARLOS',
    cip: '00123456',
    numero_paginas: 45,
    situacion_militar: 'Actividad',
    ubicacion: 'Archivo Central - Estante A1',
    orden: 1,
    ano: 2024,
    estado: 'dentro',
    fecha_registro: '2024-01-15',
    fecha_actualizacion: '2024-01-15',
    created_at: new Date('2024-01-15').toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'admin',
    updated_by: 'admin'
  },
  {
    id: '2',
    grado: 'SSOO',
    apellidos_nombres: 'RODRÍGUEZ MARTÍNEZ, MARÍA ELENA',
    cip: '00234567',
    numero_paginas: 67,
    situacion_militar: 'Retiro',
    ubicacion: 'Archivo Central - Estante B2',
    orden: 2,
    ano: 2023,
    estado: 'fuera',
    fecha_registro: '2024-02-10',
    fecha_actualizacion: '2024-02-10',
    created_at: new Date('2024-02-10').toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'admin',
    updated_by: 'admin'
  },
  {
    id: '3',
    grado: 'TTE',
    apellidos_nombres: 'GARCÍA LOPEZ, CARLOS ALBERTO',
    cip: '00345678',
    numero_paginas: 89,
    situacion_militar: 'Actividad',
    ubicacion: 'Archivo Central - Estante C3',
    orden: 3,
    ano: 2024,
    estado: 'dentro',
    fecha_registro: '2024-03-05',
    fecha_actualizacion: '2024-03-05',
    created_at: new Date('2024-03-05').toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'admin',
    updated_by: 'admin'
  },
  {
    id: '4',
    grado: 'MY',
    apellidos_nombres: 'SÁNCHEZ TORRES, ANA PATRICIA',
    cip: '00456789',
    numero_paginas: 123,
    situacion_militar: 'Actividad',
    ubicacion: 'Archivo Central - Estante D4',
    orden: 4,
    ano: 2022,
    estado: 'dentro',
    fecha_registro: '2024-04-12',
    fecha_actualizacion: '2024-04-12',
    created_at: new Date('2024-04-12').toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'admin',
    updated_by: 'admin'
  },
  {
    id: '5',
    grado: 'CRL',
    apellidos_nombres: 'MENDOZA VARGAS, LUIS FERNANDO',
    cip: '00567890',
    numero_paginas: 156,
    situacion_militar: 'Retiro',
    ubicacion: 'Archivo Central - Estante E5',
    orden: 5,
    ano: 2021,
    estado: 'fuera',
    fecha_registro: '2024-05-20',
    fecha_actualizacion: '2024-05-20',
    created_at: new Date('2024-05-20').toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'admin',
    updated_by: 'admin'
  }
];

// ========== AUTH API FUNCTIONS ==========

// Login function for authentication context
export async function loginUser(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error al iniciar sesión' }));
    throw new Error(error.error || 'Error al iniciar sesión');
  }

  const data = await response.json();
  
  console.log('🔍 API Raw Response:', JSON.stringify(data, null, 2));
  console.log('🔍 API Data structure:', {
    hasData: !!data.data,
    hasUser: !!(data.data?.user || data.user),
    hasPermissions: !!(data.data?.permissions || data.permissions),
    hasProfile: !!(data.data?.profile || data.profile),
    hasToken: !!(data.data?.access_token || data.access_token),
    dataKeys: Object.keys(data),
    dataDataKeys: data.data ? Object.keys(data.data) : null
  });

  // Extract permissions more carefully
  const extractedPermissions = data.data?.permissions || data.permissions || [];
  console.log('🔍 Extracted permissions details:', {
    rawPermissions: extractedPermissions,
    type: typeof extractedPermissions,
    isArray: Array.isArray(extractedPermissions),
    length: extractedPermissions?.length,
    firstItem: extractedPermissions?.[0]
  });
  
  // Transform the response to match our LoginResponse interface
  const loginResponse = {
    user: data.data?.user || data.user,
    token: data.data?.access_token || data.access_token,
    permissions: extractedPermissions,
    profile: data.data?.profile || data.profile
  };

  console.log('🔍 Final login response:', {
    user: loginResponse.user?.email,
    hasToken: !!loginResponse.token,
    permissions: loginResponse.permissions,
    permissionsCount: loginResponse.permissions?.length || 0,
    profile: loginResponse.profile?.name
  });

  return loginResponse;
}

// Original login function (keeping for backward compatibility)
export async function login(email: string, password: string): Promise<ApiResponse<{
  access_token: string;
  refresh_token: string;
  user: User;
}>> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error al iniciar sesión' }));
    throw new Error(error.error || 'Error al iniciar sesión');
  }

  return response.json();
}

// ========== HELPER FUNCTIONS ==========

// Helper function to get auth headers
function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// Helper function to handle API errors
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    // Handle authentication errors
    if (response.status === 401) {
      // Clear token and redirect to login if not already there
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');

        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      throw new Error('Session expired. Please login again.');
    }

    const error = await response.json().catch(() => ({
      error: 'Request failed',
      message: response.statusText,
    }));
    throw new Error(error.message || error.error || 'An error occurred');
  }
  return response.json();
}

// Helper function to handle fetch errors (network issues)
async function safeFetch(url: string, options?: RequestInit): Promise<Response> {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    console.error('Network error:', error);
    console.error('Failed URL:', url);
    console.error('Request options:', options);

    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Cannot connect to server. Please check if the backend server is running.');
    }
    throw error;
  }
}

// ========== HEALTH CHECK ==========
/**
 * Perform a lightweight health check against the API.
 * Tries `/health` first and falls back to `/ping` if available.
 * Returns an ApiResponse where data.healthy === true means the backend responded OK.
 */
export async function healthCheck(): Promise<ApiResponse<{ healthy: boolean; status?: string }>> {
  const endpoints = [`${API_BASE_URL}/health`, `${API_BASE_URL}/ping`]

  for (const endpoint of endpoints) {
    try {
      const response = await safeFetch(endpoint, { method: 'GET' })
      if (response.ok) {
        // try to read body if any
        const json = await response.json().catch(() => ({}))
        return { success: true, data: { healthy: true, status: json?.status || 'ok' } }
      }
    } catch (err) {
      // network error for this endpoint, try next
      continue
    }
  }

  // If none responded OK
  return { success: false, data: { healthy: false } }
}

// Get all persons with pagination and search
export async function getPersons(params?: SearchParams): Promise<ApiResponse<ListPersonsResponse>> {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.dni) queryParams.append('dni', params.dni);

  const url = `${API_BASE_URL}/persons${queryParams.toString() ? `?${queryParams}` : ''}`;
  const response = await safeFetch(url, {
    headers: getAuthHeaders(),
  });
  return handleResponse<ApiResponse<ListPersonsResponse>>(response);
}

// Get a single person by ID
export async function getPerson(id: string): Promise<ApiResponse<Person>> {
  const response = await fetch(`${API_BASE_URL}/persons/${id}/`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<ApiResponse<Person>>(response);
}

// Create a new person
export async function createPerson(data: CreatePersonInput): Promise<ApiResponse<Person>> {
  const response = await fetch(`${API_BASE_URL}/persons`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ApiResponse<Person>>(response);
}

// Update a person
export async function updatePerson(
  id: string,
  data: UpdatePersonInput
): Promise<ApiResponse<Person>> {
  const response = await fetch(`${API_BASE_URL}/persons/${id}/`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ApiResponse<Person>>(response);
}

// Delete a person
export async function deletePerson(id: string): Promise<ApiResponse<void>> {
  const response = await fetch(`${API_BASE_URL}/persons/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse<ApiResponse<void>>(response);
}

// Delete all persons
export async function deleteAllPersons(): Promise<ApiResponse<{ deletedCount: number }>> {
  const response = await fetch(`${API_BASE_URL}/persons/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse<ApiResponse<{ deletedCount: number }>>(response);
}

// ========== USER API FUNCTIONS ==========

// Get all users with pagination and search
export async function getUsers(params?: UserSearchParams): Promise<ApiResponse<ListUsersResponse>> {
  // DEMO MODE: Devolver datos simulados
  if (DEMO_MODE) {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredUsers = [...DEMO_USERS];
    
    // Aplicar filtros si existen
    if (params?.email) {
      filteredUsers = filteredUsers.filter(user => 
        user.email.toLowerCase().includes(params.email!.toLowerCase())
      );
    }
    if (params?.nombre) {
      filteredUsers = filteredUsers.filter(user => 
        user.nombre.toLowerCase().includes(params.nombre!.toLowerCase()) ||
        user.apellido.toLowerCase().includes(params.nombre!.toLowerCase())
      );
    }
    if (params?.documento) {
      filteredUsers = filteredUsers.filter(user => 
        user.documento.includes(params.documento!)
      );
    }
    
    // Paginación
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    return {
      success: true,
      data: {
        data: paginatedUsers,
        pagination: {
          page,
          limit,
          total: filteredUsers.length,
          totalPages: Math.ceil(filteredUsers.length / limit)
        }
      }
    };
  }

  // BACKEND MODE: Llamada real a la API
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.email) queryParams.append('email', params.email);
  if (params?.nombre) queryParams.append('nombre', params.nombre);
  if (params?.documento) queryParams.append('documento', params.documento);

  const url = `${API_BASE_URL}/users${queryParams.toString() ? `?${queryParams}` : ''}`;

  const response = await safeFetch(url, {
    headers: getAuthHeaders(),
  });
  return handleResponse<ApiResponse<ListUsersResponse>>(response);
}

// Get a single user by ID
export async function getUser(id: string): Promise<ApiResponse<User>> {
  const response = await fetch(`${API_BASE_URL}/users/${id}/`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<ApiResponse<User>>(response);
}

// Create a new user
export async function createUser(data: CreateUserInput): Promise<ApiResponse<User>> {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ApiResponse<User>>(response);
}

// Update a user
export async function updateUser(
  id: string,
  data: UpdateUserInput
): Promise<ApiResponse<User>> {
  const response = await fetch(`${API_BASE_URL}/users/${id}/`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ApiResponse<User>>(response);
}

// Delete a user
export async function deleteUser(id: string): Promise<ApiResponse<void>> {
  const response = await fetch(`${API_BASE_URL}/users/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse<ApiResponse<void>>(response);
}

// ========== PROFILE API FUNCTIONS ==========

// Get all profiles
export async function getProfiles(): Promise<ApiResponse<Profile[]>> {
  // DEMO MODE: Devolver datos simulados
  if (DEMO_MODE) {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      data: DEMO_PROFILES
    };
  }

  // BACKEND MODE: Llamada real a la API
  const response = await safeFetch(`${API_BASE_URL}/profiles`, {
    headers: getAuthHeaders(),
  });
  const result = await handleResponse<ApiResponse<Profile[]>>(response);
  return result;
}

// Get available permissions
export async function getAvailablePermissions(): Promise<ApiResponse<Permission[]>> {
  const response = await safeFetch(`${API_BASE_URL}/permissions`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<ApiResponse<Permission[]>>(response);
}

// Get a single profile by ID
export async function getProfile(id: string): Promise<ApiResponse<Profile>> {
  const response = await safeFetch(`${API_BASE_URL}/profiles/${id}/`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<ApiResponse<Profile>>(response);
}

// Create a new profile
export async function createProfile(data: any): Promise<ApiResponse<Profile>> {
  const response = await safeFetch(`${API_BASE_URL}/profiles`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ApiResponse<Profile>>(response);
}

// Update a profile
export async function updateProfile(id: string, data: any): Promise<ApiResponse<Profile>> {
  const response = await safeFetch(`${API_BASE_URL}/profiles/${id}/`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ApiResponse<Profile>>(response);
}

// Delete a profile
export async function deleteProfile(id: string): Promise<ApiResponse<void>> {
  const response = await safeFetch(`${API_BASE_URL}/profiles/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse<ApiResponse<void>>(response);
}

// ========== EXPEDIENTE API FUNCTIONS ==========

// Get all expedientes with pagination
export async function getExpedientes(
  page = 1,
  limit = 10,
  sortBy = 'orden',
  sortOrder: 'asc' | 'desc' = 'asc'
): Promise<ApiResponse<{ data: Expediente[], pagination?: { total: number, totalPages: number } }>> {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const response = await safeFetch(`${API_BASE_URL}/expedientes?${queryParams}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<ApiResponse<{ data: Expediente[], pagination?: { total: number, totalPages: number } }>>(response);
}

// Search expedientes with filters
export async function searchExpedientes(
  params: ExpedienteSearchParams
): Promise<ApiResponse<{ data: Expediente[], pagination?: { total: number, totalPages: number } }>> {
  const queryParams = new URLSearchParams();

  if (params.search) queryParams.append('search', params.search);
  if (params.grado) queryParams.append('grado', params.grado);
  if (params.situacion_militar) queryParams.append('situacion_militar', params.situacion_militar);
  if (params.estado) queryParams.append('estado', params.estado);
  if (params.apellidos_nombres) queryParams.append('apellidos_nombres', params.apellidos_nombres);
  if (params.cip) queryParams.append('cip', params.cip);
  if (params.ubicacion) queryParams.append('ubicacion', params.ubicacion);
  if (params.orden) queryParams.append('orden', params.orden.toString());
  if (params.fecha_inicio) queryParams.append('fecha_inicio', params.fecha_inicio);
  if (params.fecha_fin) queryParams.append('fecha_fin', params.fecha_fin);
  if (params.sort_by) queryParams.append('sort_by', params.sort_by);
  if (params.sort_order) queryParams.append('sort_order', params.sort_order);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const response = await safeFetch(`${API_BASE_URL}/expedientes/search?${queryParams}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<ApiResponse<{ data: Expediente[], pagination?: { total: number, totalPages: number } }>>(response);
}

// Get a single expediente by ID
export async function getExpediente(id: string): Promise<ApiResponse<Expediente>> {
  const response = await safeFetch(`${API_BASE_URL}/expedientes/${id}/`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<ApiResponse<Expediente>>(response);
}

// Create a new expediente
export async function createExpediente(
  data: CreateExpedienteInput
): Promise<ApiResponse<Expediente>> {
  const response = await safeFetch(`${API_BASE_URL}/expedientes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ApiResponse<Expediente>>(response);
}

// Bulk import expedientes from Excel file
export async function bulkImportExpedientes(file: File): Promise<ApiResponse<{
  total_processed: number;
  successful_imports: number;
  failed_imports: number;
  errors: Array<{
    row: number;
    errors: string[];
  }>;
}>> {
  const formData = new FormData();
  formData.append('file', file);

  // Get only the Authorization header for FormData (don't set Content-Type)
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const headers: HeadersInit = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await safeFetch(`${API_BASE_URL}/expedientes/bulk-import`, {
    method: 'POST',
    headers,
    body: formData,
  });
  return handleResponse<ApiResponse<{
    total_processed: number;
    successful_imports: number;
    failed_imports: number;
    errors: Array<{
      row: number;
      errors: string[];
    }>;
  }>>(response);
}

// Update an expediente
export async function updateExpediente(
  id: string,
  data: UpdateExpedienteInput
): Promise<ApiResponse<Expediente>> {
  const response = await safeFetch(`${API_BASE_URL}/expedientes/${id}/`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ApiResponse<Expediente>>(response);
}

// Update expediente estado only
export async function updateExpedienteEstado(
  id: string,
  estado: 'dentro' | 'fuera'
): Promise<ApiResponse<{ message: string }>> {
  const response = await safeFetch(`${API_BASE_URL}/expedientes/${id}/estado/`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ estado }),
  });
  return handleResponse<ApiResponse<{ message: string }>>(response);
}

// Delete an expediente (soft delete)
export async function deleteExpediente(id: string): Promise<ApiResponse<{ message: string }>> {
  const response = await safeFetch(`${API_BASE_URL}/expedientes/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse<ApiResponse<{ message: string }>>(response);
}

/**
 * Health Check API
 * Checks if the backend application is healthy and responding
 */
export async function checkHealth(): Promise<ApiResponse<{ healthy: boolean; status?: string }>> {
  try {
    // Try /health endpoint first
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // No authentication needed for health check
      // Shorter timeout for health checks
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        data: { 
          healthy: true, 
          status: data.status || 'OK'
        }
      };
    } else {
      return {
        success: true,
        data: { 
          healthy: false, 
          status: `HTTP ${response.status}` 
        }
      };
    }
  } catch (error) {
    // If health endpoint fails, try a simple ping
    try {
      const pingResponse = await fetch(`${API_BASE_URL}/ping`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });
      
      if (pingResponse.ok) {
        return {
          success: true,
          data: { 
            healthy: true, 
            status: 'OK (ping)' 
          }
        };
      }
    } catch (pingError) {
      // Both endpoints failed
    }

    return {
      success: true,
      data: { 
        healthy: false, 
        status: error instanceof Error ? error.message : 'Connection failed'
      }
    };
  }
}

/**
 * Get dashboard statistics
 * Endpoint expected: GET /dashboard/stats
 */
export async function getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  const response = await safeFetch(`${API_BASE_URL}/dashboard/stats`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse<ApiResponse<DashboardStats>>(response);
}

// Export expedientes as CSV - triggers a file download in the client
export async function exportExpedientes(): Promise<void> {
  const url = `${API_BASE_URL}/expedientes/export`;

  // Use auth header but expect a binary response
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const headers: HeadersInit = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await safeFetch(url, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    // try to read error body
    const err = await response.json().catch(() => ({ error: 'Export failed' }));
    throw new Error(err.error || 'Export failed');
  }

  const blob = await response.blob();
  const filename = 'expedientes_export.csv';
  const link = document.createElement('a');
  const urlBlob = window.URL.createObjectURL(blob);
  link.href = urlBlob;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(urlBlob);
}

