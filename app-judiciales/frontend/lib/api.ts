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
  ListProfilesResponse,
  ApiResponse,
  SearchParams,
} from './types';

// Use relative URL to leverage Next.js API rewrites and avoid CORS issues
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

// Helper function to handle API errors
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: 'Request failed',
      message: response.statusText,
    }));
    throw new Error(error.message || error.error || 'An error occurred');
  }
  return response.json();
}

// Get all persons with pagination and search
export async function getPersons(params?: SearchParams): Promise<ApiResponse<ListPersonsResponse>> {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.dni) queryParams.append('dni', params.dni);

  const url = `${API_BASE_URL}/persons${queryParams.toString() ? `?${queryParams}` : ''}`;
  const response = await fetch(url);
  return handleResponse<ApiResponse<ListPersonsResponse>>(response);
}

// Get a single person by ID
export async function getPerson(id: string): Promise<ApiResponse<Person>> {
  const response = await fetch(`${API_BASE_URL}/persons/${id}`);
  return handleResponse<ApiResponse<Person>>(response);
}

// Create a new person
export async function createPerson(data: CreatePersonInput): Promise<ApiResponse<Person>> {
  const response = await fetch(`${API_BASE_URL}/persons`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse<ApiResponse<Person>>(response);
}

// Update a person
export async function updatePerson(
  id: string,
  data: UpdatePersonInput
): Promise<ApiResponse<Person>> {
  const response = await fetch(`${API_BASE_URL}/persons/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse<ApiResponse<Person>>(response);
}

// Delete a person
export async function deletePerson(id: string): Promise<ApiResponse<void>> {
  const response = await fetch(`${API_BASE_URL}/persons/${id}`, {
    method: 'DELETE',
  });
  return handleResponse<ApiResponse<void>>(response);
}

// Delete all persons
export async function deleteAllPersons(): Promise<ApiResponse<{ deletedCount: number }>> {
  const response = await fetch(`${API_BASE_URL}/persons`, {
    method: 'DELETE',
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
  const response = await fetch(url);
  return handleResponse<ApiResponse<ListUsersResponse>>(response);
}

// Get a single user by ID
export async function getUser(id: string): Promise<ApiResponse<User>> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`);
  return handleResponse<ApiResponse<User>>(response);
}

// Create a new user
export async function createUser(data: CreateUserInput): Promise<ApiResponse<User>> {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse<ApiResponse<User>>(response);
}

// Update a user
export async function updateUser(
  id: string,
  data: UpdateUserInput
): Promise<ApiResponse<User>> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse<ApiResponse<User>>(response);
}

// Delete a user
export async function deleteUser(id: string): Promise<ApiResponse<void>> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'DELETE',
  });
  return handleResponse<ApiResponse<void>>(response);
}

// ========== PROFILE API FUNCTIONS ==========

// Get all profiles
export async function getProfiles(): Promise<ApiResponse<Profile[]>> {
  const response = await fetch(`${API_BASE_URL}/profiles`);
  const result = await handleResponse<ApiResponse<Profile[]>>(response);
  return result;
}
