/**
 * Centralized API Module
 * 
 * This module contains ALL API calls to the backend.
 * All components should import functions from this file instead of making direct fetch calls.
 * 
 * Architecture:
 * - Uses environment variable NEXT_PUBLIC_API_URL (defaults to /api/v1)
 * - All requests go through Next.js proxy to avoid CORS issues
 * - Automatic token management from sessionStorage
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
} from './types';

// Use environment variable for API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

// ========== AUTH API FUNCTIONS ==========

// Login
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
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('access_token') : null;
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
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('profile_name');

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

  if (params.grado) queryParams.append('grado', params.grado);
  if (params.situacion_militar) queryParams.append('situacion_militar', params.situacion_militar);
  if (params.estado) queryParams.append('estado', params.estado);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const response = await safeFetch(`${API_BASE_URL}/expedientes?${queryParams}`, {
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
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('access_token') : null;
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

