import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AccesoService } from '../../services/acceso.service';
import { CitasService } from '../../services/citas';
import { CitaTatuaje } from '../../models/cita.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class AdminComponent {
  private accesoService = inject(AccesoService);
  private router = inject(Router);
  private citasService = inject(CitasService);
  citas = this.citasService.citas;

  searchText = signal('');
  estadoFiltro = signal('Todos');
  page = signal(1);
  pageSize = 4;

  nuevaCita = signal<CitaTatuaje>({
    id: '',
    cliente: '',
    fecha: '',
    tatuador: '',
    estilo: '',
    zonaCuerpo: '',
    estado: 'Pendiente',
    precio: 0,
    observaciones: ''
  });

  setSearchText(value: string) {
    this.searchText.set((value ?? '').toString());
    this.page.set(1);
  }

  buscarPorEnter(value: string) {
    this.setSearchText(value);
    setTimeout(() => {
      const target = document.getElementById('panel-citas');
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  setEstadoFiltro(value: string) {
    this.estadoFiltro.set(value);
    this.page.set(1);
  }

  updateNuevaCita<K extends keyof CitaTatuaje>(field: K, value: CitaTatuaje[K]) {
    this.nuevaCita.update(current => ({ ...current, [field]: value }));
  }

  filteredCitas = computed(() => {
    const text = this.normalizeText(this.searchText());
    const estado = this.estadoFiltro();
    return this.citas().filter(cita => {
      const matchesText = !text || [cita.cliente, cita.tatuador]
        .some(field => this.normalizeText(field).includes(text));
      const matchesEstado = estado === 'Todos' || cita.estado === estado;
      return matchesText && matchesEstado;
    });
  });

  paginatedCitas = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filteredCitas().slice(start, start + this.pageSize);
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredCitas().length / this.pageSize)));

  totalCitas = computed(() => this.citas().length);
  confirmadas = computed(() => this.citas().filter(c => c.estado === 'Confirmada').length);
  pendientes = computed(() => this.citas().filter(c => c.estado === 'Pendiente').length);
  disenio = computed(() => this.citas().filter(c => c.estado === 'En diseño').length);
  canceladas = computed(() => this.citas().filter(c => c.estado === 'Cancelada').length);
  ingresosConfirmados = computed(() => this.citas()
    .filter(c => c.estado === 'Confirmada')
    .reduce((acc, cita) => acc + (Number(cita.precio) || 0), 0));
  ticketPromedio = computed(() => {
    const total = this.citas().reduce((acc, cita) => acc + (Number(cita.precio) || 0), 0);
    return this.totalCitas() ? total / this.totalCitas() : 0;
  });
  proximas72h = computed(() => {
    const now = new Date();
    const limit = new Date(now);
    limit.setHours(limit.getHours() + 72);
    return this.citas().filter(cita => {
      const fecha = new Date(cita.fecha);
      return fecha >= now && fecha <= limit;
    }).length;
  });

  crearCita() {
    const cita = this.nuevaCita();
    if (!cita.cliente || !cita.fecha || !cita.tatuador || !cita.estilo || !cita.zonaCuerpo || cita.precio < 0) {
      alert('Rellena todos los campos antes de crear la cita.');
      return;
    }
    this.citasService.agregarCita({ ...cita, id: Date.now().toString() });
    this.nuevaCita.set({
      id: '', cliente: '', fecha: '', tatuador: '', estilo: '', zonaCuerpo: '', estado: 'Pendiente', precio: 0, observaciones: ''
    });
    this.page.set(this.totalPages());
  }

  guardar(cita: CitaTatuaje) {
    this.citasService.actualizarCita(cita);
  }

  confirmarCita(cita: CitaTatuaje) {
    if (cita.estado !== 'Confirmada') {
      cita.estado = 'Confirmada';
    }
    this.guardar(cita);
  }

  restaurarPredeterminadas() {
    if (confirm('¿Restaurar las citas predeterminadas?')) {
      this.citasService.restaurarCitas();
      this.page.set(1);
    }
  }

  eliminar(id: string) {
    if (confirm('¿Eliminar esta cita?')) {
      this.citasService.eliminarCita(id);
    }
  }

  imprimir() {
    window.print();
  }

  exportarCsv() {
    const rows = this.filteredCitas().map((cita) => [
      cita.id,
      cita.cliente,
      cita.fecha,
      cita.tatuador,
      cita.estilo,
      cita.zonaCuerpo,
      cita.estado,
      String(cita.precio),
      cita.observaciones.replace(/\n/g, ' ').trim()
    ]);

    const header = ['id', 'cliente', 'fecha', 'tatuador', 'estilo', 'zonaCuerpo', 'estado', 'precio', 'observaciones'];
    const csv = [header, ...rows]
      .map((cols) => cols.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-citas-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private normalizeText(value: unknown): string {
    return String(value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  logout() {
    this.accesoService.cerrarSesion();
    this.router.navigate(['/acceso']);
  }

  prevPage() {
    this.page.update(value => Math.max(1, value - 1));
  }

  nextPage() {
    this.page.update(value => Math.min(this.totalPages(), value + 1));
  }
}
