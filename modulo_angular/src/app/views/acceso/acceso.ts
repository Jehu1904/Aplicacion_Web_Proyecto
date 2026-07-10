import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AccesoService } from '../../services/acceso.service';

@Component({
  selector: 'app-acceso',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './acceso.html',
  styleUrls: ['./acceso.css']
})
export class AccesoComponent {
  private acceso = inject(AccesoService);
  private router = inject(Router);

  username = 'admin';
  password = 'admin123';
  error = '';

  acceder() {
    if (this.acceso.acceder(this.username, this.password)) {
      this.router.navigate(['/']);
      this.error = '';
    } else {
      this.error = 'Credenciales incorrectas o sin permisos de administrador';
    }
  }
}
