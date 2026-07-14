/**
 * @file modulo_vue/src/services/api.ts
 * @description Servicio API con token compartido para Supabase (Vue)
 */

export async function apiCall(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  endpoint: string,
  body?: any
) {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('No autorizado. Token no disponible.');
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const options: RequestInit = {
    method,
    headers
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(endpoint, options);

  if (response.status === 401) {
    // Token expirado o inválido
    localStorage.removeItem('token');
    window.location.href = '/';
    throw new Error('Sesión expirada');
  }

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export const fetchData = (endpoint: string) =>
  apiCall('GET', endpoint);

export const createData = (endpoint: string, body: any) =>
  apiCall('POST', endpoint, body);

export const updateData = (endpoint: string, body: any) =>
  apiCall('PUT', endpoint, body);

export const deleteData = (endpoint: string) =>
  apiCall('DELETE', endpoint);
