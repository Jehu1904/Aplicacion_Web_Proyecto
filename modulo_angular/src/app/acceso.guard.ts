import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

/**
 * Guard para verificar autenticación desde localStorage (compartida con contenedora)
 * Implementa el patrón del PDF: verificación de token en localStorage
 */
@Injectable({
  providedIn: 'root'
})
export class AccesoGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('user_role');
    const localAuth = localStorage.getItem('moduloAngularAuth') === 'true';
    const localRole = localStorage.getItem('moduloAngularRole');
    const sharedRaw = localStorage.getItem('mtc_session');

    let sharedSessionIsAdmin = false;
    if (sharedRaw) {
      try {
        const parsed = JSON.parse(sharedRaw) as {
          role?: string;
          authenticated?: boolean;
        };
        sharedSessionIsAdmin =
          parsed.authenticated === true && (parsed.role ?? '').toLowerCase() === 'admin';
      } catch {
        sharedSessionIsAdmin = false;
      }
    }

    // Aceptar sesión admin desde contenedora o desde el propio login del módulo.
    const integratedAdmin = !!token && role === 'admin';
    const standaloneAdmin = localAuth && localRole === 'admin';

    if (integratedAdmin || standaloneAdmin || sharedSessionIsAdmin) {
      return true;
    }

    // En modo integrado (contenedora), volver al launcher principal.
    if (window.location.pathname.startsWith('/angular')) {
      window.location.href = '/';
      return false;
    }

    // En modo standalone de Angular, mostrar pantalla de acceso del módulo.
    this.router.navigateByUrl('/acceso');
    return false;
  }
}

