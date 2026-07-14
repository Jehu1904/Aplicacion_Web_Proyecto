/**
 * @file modulo-react/src/hooks/useAuth.ts
 * @description Hook personalizado de React para autenticación compartida
 */

import { useEffect, useState } from 'react';

export interface AuthUser {
  email: string;
  role: 'cliente' | 'admin';
  token: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Leer sesión del localStorage (compartida con contenedora)
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('user_email');
    const role = (localStorage.getItem('user_role') || 'cliente') as 'cliente' | 'admin';

    if (token && email) {
      setUser({ token, email, role });
    } else {
      // Si no hay sesión, redirigir a login
      window.location.href = '/';
    }

    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_role');
    window.location.href = '/';
  };

  return { user, loading, isAuthenticated: !!user, logout };
}
