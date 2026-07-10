import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AccesoService } from './services/acceso.service';

@Injectable({
  providedIn: 'root'
})
export class AccesoGuard implements CanActivate {
  constructor(private acceso: AccesoService, private router: Router) {}

  canActivate(): boolean {
    this.acceso.refreshFromStorage();
    if (this.acceso.isAdmin()) {
      return true;
    }
    this.router.navigate(['/acceso']);
    return false;
  }
}
