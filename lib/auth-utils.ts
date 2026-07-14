/**
 * @file lib/auth-utils.ts
 * @description Utilidades de autenticación compartidas para todos los módulos
 * Implementa el patrón del PDF: token en localStorage compartido
 */

/**
 * Interfaz para la sesión de usuario
 */
export interface UserSession {
  email: string;
  role: 'cliente' | 'admin';
  token: string;
  startTime: string;
}

/**
 * Obtiene el token de sesión desde localStorage
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

/**
 * Obtiene la información completa de la sesión
 */
export function getCurrentSession(): UserSession | null {
  const token = localStorage.getItem('token');
  const email = localStorage.getItem('user_email');
  const role = (localStorage.getItem('user_role') || 'cliente') as 'cliente' | 'admin';
  const startTime = localStorage.getItem('session_start');

  if (!token || !email) return null;

  return {
    token,
    email,
    role,
    startTime: startTime || new Date().toISOString()
  };
}

/**
 * Verifica si el usuario está autenticado
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

/**
 * Verifica si el usuario es administrador
 */
export function isAdmin(): boolean {
  return localStorage.getItem('user_role') === 'admin';
}

/**
 * Obtiene los headers necesarios para las peticiones a Supabase
 */
export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

/**
 * Redirige a login si no hay autenticación
 */
export function requireAuth(): boolean {
  if (!isAuthenticated()) {
    window.location.href = '/';
    return false;
  }
  return true;
}

/**
 * Limpia la sesión (logout)
 */
export function clearSession(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user_email');
  localStorage.removeItem('user_role');
  localStorage.removeItem('session_start');
}
