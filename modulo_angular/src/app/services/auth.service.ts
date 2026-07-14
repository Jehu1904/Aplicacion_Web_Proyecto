/**
 * @file modulo_angular/src/app/services/auth.service.ts
 * @description Servicio de autenticación para Angular (localStorage compartido)
 */

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AuthUser {
  email: string;
  role: 'cliente' | 'admin';
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<AuthUser | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(private router: Router) {
    this.initSession();
  }

  private initSession(): void {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('user_email');
    const role = (localStorage.getItem('user_role') || 'cliente') as 'cliente' | 'admin';

    if (token && email) {
      this.userSubject.next({ token, email, role });
    } else {
      // Redirigir a login
      window.location.href = '/';
    }
  }

  getCurrentUser(): AuthUser | null {
    return this.userSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.userSubject.value;
  }

  isAdmin(): boolean {
    return this.userSubject.value?.role === 'admin';
  }

  getAuthHeaders(): { [key: string]: string } {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_role');
    this.userSubject.next(null);
    window.location.href = '/';
  }
}
