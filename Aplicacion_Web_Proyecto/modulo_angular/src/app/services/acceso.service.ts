import { Injectable, signal } from '@angular/core';

const AUTH_KEY = 'moduloAngularAuth';
const ROLE_KEY = 'moduloAngularRole';
export const SHARED_SESSION_KEY = 'mtc_session';

interface SharedSession {
  user?: string;
  role?: string;
  authenticated?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AccesoService {
  isAuthenticated = signal(this.loadAuth());
  role = signal(this.loadRole());

  private readSharedSession(): SharedSession | null {
    const raw = localStorage.getItem(SHARED_SESSION_KEY);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as SharedSession;
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
      return null;
    }
  }

  private loadAuth(): boolean {
    const sharedSession = this.readSharedSession();
    if (sharedSession) {
      const hasAdminRole = (sharedSession.role ?? '').toLowerCase() === 'admin';
      const isAuthenticated = sharedSession.authenticated === true || hasAdminRole;
      return isAuthenticated && hasAdminRole;
    }

    const raw = localStorage.getItem(AUTH_KEY);
    return raw === 'true';
  }

  private loadRole(): string {
    const sharedSession = this.readSharedSession();
    if (sharedSession?.role) {
      return sharedSession.role.toLowerCase();
    }

    const raw = localStorage.getItem(ROLE_KEY);
    if (raw) {
      return raw;
    }
    return '';
  }

  private saveSession(value: boolean, role = '', user = '') {
    localStorage.setItem(AUTH_KEY, String(value));
    localStorage.setItem(ROLE_KEY, role);
    localStorage.setItem(
      SHARED_SESSION_KEY,
      JSON.stringify({
        user,
        role,
        authenticated: value
      })
    );

    this.isAuthenticated.set(value);
    this.role.set(role);
  }

  acceder(username: string, password: string) {
    const validUser = username === 'admin' && password === 'admin123';
    if (validUser) {
      this.saveSession(true, 'admin', username);
      return true;
    }
    return false;
  }

  refreshFromStorage() {
    this.isAuthenticated.set(this.loadAuth());
    this.role.set(this.loadRole());
  }

  isAdmin(): boolean {
    this.refreshFromStorage();
    return this.isAuthenticated() && this.role() === 'admin';
  }

  cerrarSesion() {
    this.saveSession(false, '', '');
  }
}
