import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AccesoService } from '../../services/acceso.service';
import { CitasService, ConfiguracionPago, MensajeCita } from '../../services/citas';
import { CitaTatuaje } from '../../models/cita.model';

const FILTER_STORAGE_KEY = 'inkiron.admin.estadoFiltro';
const ALLOWED_STATUS_FILTERS = new Set([
  'Todos',
  'Confirmada',
  'Pendiente',
  'En diseño',
  'Completada',
  'Cancelada'
]);

function readStatusFilter(): string {
  const saved = localStorage.getItem(FILTER_STORAGE_KEY);
  if (!saved) return 'Todos';
  if (ALLOWED_STATUS_FILTERS.has(saved)) return saved;

  localStorage.removeItem(FILTER_STORAGE_KEY);
  return 'Todos';
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class AdminComponent {
  citas: CitasService['citas'];
  tatuadores: CitasService['tatuadores'];
  private accesoService: AccesoService;
  private router: Router;
  private citasService: CitasService;
  loadError = signal('');
  artistError = signal('');
  nuevoTatuador = signal('');
  configuracionPago = signal<ConfiguracionPago>({
    bank_name: 'Banco Pichincha',
    account_holder: '',
    account_type: '',
    account_number: '',
    account_id_number: '',
    deposit_amount: null
  });
  errorConfiguracionPago = signal('');
  mensajeConfiguracionPago = signal('');
  mensajesCita = signal<Record<string, MensajeCita[] | undefined>>({});
  borradoresMensaje = signal<Record<string, string | undefined>>({});
  erroresChat = signal<Record<string, string>>({});
  chatsAbiertos = signal<Record<string, boolean>>({});
  precioFinalDescuento = signal<Record<string, number | undefined>>({});
  codigosDescuento = signal<Record<string, string>>({});
  erroresDescuento = signal<Record<string, string>>({});

  constructor(accesoService: AccesoService, router: Router, citasService: CitasService) {
    this.accesoService = accesoService;
    this.router = router;
    this.citasService = citasService;
    this.citas = citasService.citas;
    this.tatuadores = citasService.tatuadores;

    void this.citasService.cargarCitasRemotas().catch((error: unknown) => {
      this.loadError.set(error instanceof Error ? error.message : 'No se pudieron cargar las citas reales.');
    });
    void this.citasService.cargarTatuadoresRemotos().catch((error: unknown) => {
      this.artistError.set(error instanceof Error ? error.message : 'No se pudo cargar la lista de tatuadores.');
    });
    void this.citasService.getConfiguracionPago()
      .then(settings => this.configuracionPago.set(settings))
      .catch((error: unknown) => this.errorConfiguracionPago.set(error instanceof Error ? error.message : 'No se pudo cargar la configuración de abonos.'));
  }

  searchText = signal('');
  estadoFiltro = signal(readStatusFilter());
  facturaBusqueda = signal('');
  citaFacturaId = signal('');
  estadoFactura = signal('');
  facturaMensaje = signal('');
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
    const filter = ALLOWED_STATUS_FILTERS.has(value) ? value : 'Todos';
    this.estadoFiltro.set(filter);
    localStorage.setItem(FILTER_STORAGE_KEY, filter);
    this.page.set(1);
    setTimeout(() => {
      const target = document.getElementById('panel-citas');
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  updateNuevaCita<K extends keyof CitaTatuaje>(field: K, value: CitaTatuaje[K]) {
    this.nuevaCita.update(current => ({ ...current, [field]: value }));
  }

  capitalizarPrimeraLetra(valor: string): string {
    const texto = String(valor ?? '').trim();
    return texto ? texto.charAt(0).toLocaleUpperCase('es-EC') + texto.slice(1) : '';
  }

  async agregarTatuador() {
    const nombre = this.capitalizarPrimeraLetra(this.nuevoTatuador());
    if (!nombre) return;
    this.artistError.set('');
    try {
      await this.citasService.agregarTatuador(nombre);
      this.nuevoTatuador.set('');
    } catch (error) {
      this.artistError.set(error instanceof Error ? error.message : 'No se pudo agregar el tatuador.');
    }
  }

  async retirarTatuador(id: string, nombre: string) {
    if (!confirm(`¿Retirar a ${nombre} de la lista de tatuadores?`)) return;
    this.artistError.set('');
    try {
      await this.citasService.retirarTatuador(id);
    } catch (error) {
      this.artistError.set(error instanceof Error ? error.message : 'No se pudo retirar el tatuador.');
    }
  }

  filteredCitas = computed(() => {
    const text = this.normalizeText(this.searchText());
    const estado = this.estadoFiltro();
    return this.citas().filter(cita => {
      if (cita.estado === 'Completada') return false;
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

  citasParaFacturar = computed(() => {
    const text = this.normalizeText(this.facturaBusqueda());
    return this.citas().filter(cita => !text || [
      cita.id,
      cita.cliente,
      cita.fecha,
      cita.tatuador,
      cita.estilo,
      cita.zonaCuerpo,
      cita.estado,
      cita.precio,
      cita.sizeCm,
      cita.observaciones
    ].some(field => this.normalizeText(field).includes(text)));
  });

  citaFactura = computed(() => this.citas().find(cita => cita.id === this.citaFacturaId()) ?? null);

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

  async guardar(cita: CitaTatuaje): Promise<boolean> {
    try {
      await this.citasService.actualizarCita(cita);
      return true;
    } catch (error) {
      alert(error instanceof Error ? error.message : 'No se pudo guardar la cita.');
      return false;
    }
  }

  async confirmarCita(cita: CitaTatuaje) {
    if (!cita.paymentReceiptUrl) {
      alert('No se puede confirmar: la cita no tiene comprobante adjunto.');
      return;
    }
    try {
      await this.citasService.confirmarPago(cita.id);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'No se pudo verificar el pago.');
    }
  }

  updateConfiguracionPago<K extends keyof ConfiguracionPago>(field: K, value: ConfiguracionPago[K]) {
    this.configuracionPago.update(current => ({ ...current, [field]: value }));
    this.mensajeConfiguracionPago.set('');
  }

  setPrecioFinalDescuento(appointmentId: string, value: number | null) {
    this.precioFinalDescuento.update(current => ({ ...current, [appointmentId]: value ?? 0 }));
  }

  precioFinalFormateado(appointmentId: string): string {
    return (this.precioFinalDescuento()[appointmentId] ?? 0).toFixed(2);
  }

  setBorradorMensaje(appointmentId: string, value: string) {
    this.borradoresMensaje.update(current => ({ ...current, [appointmentId]: value }));
  }

  async guardarConfiguracionPago() {
    const settings = this.configuracionPago();
    if (!settings.account_holder.trim() || !settings.account_type.trim() || !settings.account_number.trim() ||
      !settings.account_id_number.trim() || !settings.deposit_amount || settings.deposit_amount <= 0) {
      this.errorConfiguracionPago.set('Completa titular, tipo y número de cuenta, identificación y monto del abono.');
      return;
    }
    this.errorConfiguracionPago.set('');
    this.mensajeConfiguracionPago.set('');
    try {
      await this.citasService.guardarConfiguracionPago(settings);
      this.mensajeConfiguracionPago.set('Los datos de transferencia se guardaron correctamente.');
    } catch (error) {
      this.errorConfiguracionPago.set(error instanceof Error ? error.message : 'No se pudo guardar la configuración.');
    }
  }

  async toggleChat(cita: CitaTatuaje) {
    const open = !this.chatsAbiertos()[cita.id];
    this.chatsAbiertos.update(current => ({ ...current, [cita.id]: open }));
    if (!open) return;
    try {
      const messages = await this.citasService.getMensajesCita(cita.id);
      this.mensajesCita.update(current => ({ ...current, [cita.id]: messages }));
      this.erroresChat.update(current => ({ ...current, [cita.id]: '' }));
    } catch (error) {
      this.erroresChat.update(current => ({
        ...current,
        [cita.id]: error instanceof Error ? error.message : 'No se pudo cargar la conversación.'
      }));
    }
  }

  async enviarMensaje(cita: CitaTatuaje) {
    const body = (this.borradoresMensaje()[cita.id] ?? '').trim();
    if (!body) return;
    try {
      await this.citasService.enviarMensajeCita(cita.id, body);
      this.borradoresMensaje.update(current => ({ ...current, [cita.id]: '' }));
      const messages = await this.citasService.getMensajesCita(cita.id);
      this.mensajesCita.update(current => ({ ...current, [cita.id]: messages }));
      this.erroresChat.update(current => ({ ...current, [cita.id]: '' }));
    } catch (error) {
      this.erroresChat.update(current => ({
        ...current,
        [cita.id]: error instanceof Error ? error.message : 'No se pudo enviar el mensaje.'
      }));
    }
  }

  async crearDescuento(cita: CitaTatuaje) {
    const finalPrice = Number(this.precioFinalDescuento()[cita.id]);
    if (!Number.isFinite(finalPrice) || finalPrice < 0 || finalPrice >= cita.precio) {
      this.erroresDescuento.update(current => ({ ...current, [cita.id]: 'El precio final debe ser menor al precio actual y no puede ser negativo.' }));
      return;
    }

    this.erroresDescuento.update(current => ({ ...current, [cita.id]: '' }));
    try {
      const code = await this.citasService.crearCodigoDescuento(cita.id, finalPrice);
      this.codigosDescuento.update(current => ({ ...current, [cita.id]: code }));
      try {
        await this.citasService.enviarMensajeCita(
          cita.id,
          `Descuento acordado: ${cita.precio.toFixed(2)} USD → ${finalPrice.toFixed(2)} USD. Código de un solo uso: ${code}`
        );
      } catch (error) {
        this.erroresDescuento.update(current => ({
          ...current,
          [cita.id]: `Código creado, pero no se pudo enviar por el chat: ${error instanceof Error ? error.message : 'error desconocido'}. Copia el código para compartirlo.`
        }));
      }
    } catch (error) {
      this.erroresDescuento.update(current => ({
        ...current,
        [cita.id]: error instanceof Error ? error.message : 'No se pudo crear el código.'
      }));
    }
  }

  seleccionarCitaFactura(id: string) {
    this.citaFacturaId.set(id);
    const cita = this.citas().find(item => item.id === id);
    this.estadoFactura.set(cita?.estado ?? '');
  }

  setFacturaBusqueda(value: string) {
    this.facturaBusqueda.set(value);
    this.citaFacturaId.set('');
    this.estadoFactura.set('');
    this.facturaMensaje.set('');
  }

  async guardarEstadoFactura() {
    const cita = this.citaFactura();
    if (!cita || !this.estadoFactura()) return;
    this.facturaMensaje.set('');
    const actualizado = await this.guardar({ ...cita, estado: this.estadoFactura() });
    if (actualizado) {
      this.facturaMensaje.set(`Estado guardado: ${this.estadoFactura()}.`);
    }
  }

  formatearFecha(fecha: string): string {
    return new Intl.DateTimeFormat('es-EC', { dateStyle: 'long' }).format(new Date(`${fecha}T00:00:00`));
  }

  imprimirFactura() {
    const cita = this.citaFactura();
    if (!cita) return;

    const escapeHtml = (value: unknown) => String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    const factura = window.open('', '_blank', 'width=760,height=680');
    if (!factura) return;

    factura.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Factura ${escapeHtml(cita.id.slice(0, 8))}</title><style>body{font-family:Arial,sans-serif;color:#1f2937;padding:42px;max-width:680px;margin:auto}header{display:flex;justify-content:space-between;border-bottom:2px solid #f59e0b;padding-bottom:16px;margin-bottom:28px}h1{margin:0;font-size:28px}.muted{color:#6b7280}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:22px 0}.total{margin-top:28px;padding-top:16px;border-top:1px solid #d1d5db;text-align:right;font-size:22px;font-weight:bold}</style></head><body><header><div><h1>INK &amp; IRON</h1><p class="muted">Factura de cita</p></div><div><strong>N.° ${escapeHtml(cita.id.slice(0, 8).toUpperCase())}</strong><br><span class="muted">${escapeHtml(this.formatearFecha(cita.fecha))}</span></div></header><div class="grid"><div><strong>Cliente</strong><br>${escapeHtml(cita.cliente)}</div><div><strong>Estado</strong><br>${escapeHtml(cita.estado)}</div><div><strong>Tatuador</strong><br>${escapeHtml(cita.tatuador)}</div><div><strong>Estilo</strong><br>${escapeHtml(cita.estilo)}</div><div><strong>Zona del cuerpo</strong><br>${escapeHtml(cita.zonaCuerpo)}</div><div><strong>Observaciones</strong><br>${escapeHtml(cita.observaciones || 'Sin observaciones')}</div></div><div class="total">Total: $${Number(cita.precio || 0).toFixed(2)}</div></body></html>`);
    factura.document.close();
    factura.focus();
    factura.print();
  }

  restaurarPredeterminadas() {
    if (confirm('¿Restaurar las citas predeterminadas?')) {
      this.citasService.restaurarCitas();
      this.page.set(1);
    }
  }

  async eliminar(id: string) {
    if (confirm('¿Eliminar esta cita?')) {
      try {
        await this.citasService.eliminarCita(id);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'No se pudo eliminar la cita.');
      }
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
