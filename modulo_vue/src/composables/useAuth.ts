/**
 * @file modulo_vue/src/composables/useAuth.ts
 * @description Composable de Vue para autenticación compartida
 */

import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

export interface AuthUser {
  email: string;
  role: 'cliente' | 'admin';
  token: string;
}

export function useAuth() {
  const router = useRouter();
  const user = ref<AuthUser | null>(null);
  const loading = ref(true);

  // Inicializar sesión
  const initSession = () => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('user_email');
    const role = (localStorage.getItem('user_role') || 'cliente') as 'cliente' | 'admin';

    if (token && email) {
      user.value = { token, email, role };
      return true;
    } else {
      // Redirigir a login
      window.location.href = '/';
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_role');
    user.value = null;
    window.location.href = '/';
  };

  // Computed
  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(() => user.value?.role === 'admin');

  return {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    initSession,
    logout
  };
}
