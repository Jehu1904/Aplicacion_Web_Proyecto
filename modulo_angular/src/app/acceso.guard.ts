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

    // Verificar que sea admin
    if (token && role === 'admin') {
      return true;
    }

    // Si no es admin o no hay token, ir a login o contenedora
    window.location.href = '/';
    return false;
  }
}

