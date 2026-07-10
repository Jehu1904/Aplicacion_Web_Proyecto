import { Routes } from '@angular/router';
import { AdminComponent } from './views/admin/admin';
import { AccesoComponent } from './views/acceso/acceso';
import { AccesoGuard } from './acceso.guard';

export const routes: Routes = [
  { path: 'acceso', component: AccesoComponent },
  { path: '', component: AdminComponent, canActivate: [AccesoGuard] },
  { path: '**', redirectTo: '' }
];