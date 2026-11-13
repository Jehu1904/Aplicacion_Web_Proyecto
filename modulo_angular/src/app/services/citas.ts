import { Injectable, signal } from '@angular/core';
import { CitaTatuaje } from '../models/cita.model';

class SessionExpiredError extends Error {
  constructor() {
    super('Tu sesión ha vencido. Se está comprobando si puede restaurarse.');
    this.name = 'SessionExpiredError';
  }
}

const STORAGE_KEY = 'moduloAngularCitas';
const STORAGE_MIGRATION_KEY = 'moduloAngularCitasSinDatosDemoV1';

export interface Tatuador {
  id: string;
  nombre: string;
  activo: boolean;
}

export interface MensajeCita {
  id: string;
  appointment_id: string;
  sender_role: 'cliente' | 'admin';
  body: string;
  created_at: string;
}

export interface ConfiguracionPago {
  bank_name: string;
  account_holder: string;
  account_type: string;
  account_number: string;
  account_id_number: string;
  deposit_amount: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class CitasService {
  private defaultCitas: CitaTatuaje[] = [];

  /* Citas de demostración retiradas: las citas reales se guardan en Supabase.
    {
      id: '1',
      cliente: 'Jandry Sanchez',
      fecha: '2026-07-05',
      estilo: 'Blackwork',
      tatuador: 'Jehu Villamar',
      zonaCuerpo: 'Antebrazo',
      estado: 'Confirmada',
      precio: 180,
      observaciones: 'Requiere diseño geométrico de referencia.'
    },
    {
      id: '2',
      cliente: 'Jordan Solorzano',
      fecha: '2026-07-06',
      estilo: 'Tradicional',
      tatuador: 'Jesus Macias',
      zonaCuerpo: 'Pecho',
      estado: 'Pendiente',
      precio: 140,
      observaciones: 'Pendiente de confirmar abono.'
    },
    {
      id: '3',
      cliente: 'Carlos Mendoza',
      fecha: '2026-07-08',
      estilo: 'Realismo',
      tatuador: 'Jehu Villamar',
      zonaCuerpo: 'Espalda',
      estado: 'En diseño',
      precio: 260,
      observaciones: 'Sesión en dos jornadas.'
    },
    {
      id: '4',
      cliente: 'Valeria Paredes',
      fecha: '2026-07-09',
      estilo: 'Minimalista',
      tatuador: 'Jesus Macias',
      zonaCuerpo: 'Muneca',
      estado: 'Pendiente',
      precio: 95,
      observaciones: 'Primera cita del cliente.'
    },
    {
      id: '5',
      cliente: 'Andres Zambrano',
      fecha: '2026-07-10',
      estilo: 'Tribal',
      tatuador: 'Jehu Villamar',
      zonaCuerpo: 'Hombro',
      estado: 'Confirmada',
      precio: 185,
      observaciones: 'Diseno aprobado por WhatsApp.'
    },
    {
      id: '6',
      cliente: 'Melissa Alcivar',
      fecha: '2026-07-11',
      estilo: 'Blackwork',
      tatuador: 'Jordan Solorzano',
      zonaCuerpo: 'Antebrazo',
      estado: 'En diseño',
      precio: 210,
      observaciones: 'Falta definir detalles de sombras.'
    },
    {
      id: '7',
      cliente: 'Luis Intriago',
      fecha: '2026-07-12',
      estilo: 'Realismo',
      tatuador: 'Jesus Macias',
      zonaCuerpo: 'Pecho',
      estado: 'Cancelada',
      precio: 300,
      observaciones: 'Cliente reagendara en agosto.'
    },
    {
      id: '8',
      cliente: 'Karen Vera',
      fecha: '2026-07-13',
      estilo: 'Lettering',
      tatuador: 'Jehu Villamar',
      zonaCuerpo: 'Costillas',
      estado: 'Pendiente',
      precio: 120,
      observaciones: 'Pendiente pago de reserva.'
    },
    {
      id: '9',
      cliente: 'Diego Cevallos',
      fecha: '2026-07-14',
      estilo: 'Neo tradicional',
      tatuador: 'Jordan Solorzano',
      zonaCuerpo: 'Pierna',
      estado: 'Confirmada',
      precio: 240,
      observaciones: 'Sesion de 4 horas.'
    },
    {
      id: '10',
      cliente: 'Fernanda Pincay',
      fecha: '2026-07-15',
      estilo: 'Acuarela',
      tatuador: 'Jesus Macias',
      zonaCuerpo: 'Tobillo',
      estado: 'En diseño',
      precio: 160,
      observaciones: 'Cliente envio referencias nuevas.'
    },
    {
      id: '11',
      cliente: 'Ruben Cardenas',
      fecha: '2026-07-16',
      estilo: 'Black and grey',
      tatuador: 'Jehu Villamar',
      zonaCuerpo: 'Espalda',
      estado: 'Confirmada',
      precio: 380,
      observaciones: 'Proyecto grande por sesiones.'
    },
    {
      id: '12',
      cliente: 'Camila Loor',
      fecha: '2026-07-17',
      estilo: 'Minimalista',
      tatuador: 'Jordan Solorzano',
      zonaCuerpo: 'Cuello',
      estado: 'Pendiente',
      precio: 110,
      observaciones: 'Solo linea fina.'
    },
    {
      id: '13',
      cliente: 'Esteban Mero',
      fecha: '2026-07-18',
      estilo: 'Biomecanico',
      tatuador: 'Jesus Macias',
      zonaCuerpo: 'Brazo',
      estado: 'Cancelada',
      precio: 290,
      observaciones: 'Sin respuesta del cliente.'
    },
    {
      id: '14',
      cliente: 'Sofia Choez',
      fecha: '2026-07-19',
      estilo: 'Dotwork',
      tatuador: 'Jehu Villamar',
      zonaCuerpo: 'Clavicula',
      estado: 'Confirmada',
      precio: 175,
      observaciones: 'Llega con referencia impresa.'
    },
    {
      id: '15',
      cliente: 'Martin Delgado',
      fecha: '2026-07-20',
      estilo: 'Tradicional',
      tatuador: 'Jordan Solorzano',
      zonaCuerpo: 'Pantorrilla',
      estado: 'Pendiente',
      precio: 200,
      observaciones: 'Cotizacion aceptada, falta abono.'
    },
    {
      id: '16',
      cliente: 'Paola Santana',
      fecha: '2026-07-21',
      estilo: 'Fineline',
      tatuador: 'Jesus Macias',
      zonaCuerpo: 'Costillas',
      estado: 'En diseño',
      precio: 150,
      observaciones: 'Diseno floral en progreso.'
    },
    {
      id: '17',
      cliente: 'Javier Quijije',
      fecha: '2026-07-22',
      estilo: 'Old school',
      tatuador: 'Jehu Villamar',
      zonaCuerpo: 'Antebrazo',
      estado: 'Confirmada',
      precio: 230,
      observaciones: 'Sesion agendada por la tarde.'
    },
    {
      id: '18',
      cliente: 'Nicole Solis',
      fecha: '2026-07-23',
      estilo: 'Acuarela',
      tatuador: 'Jordan Solorzano',
      zonaCuerpo: 'Espalda',
      estado: 'Cancelada',
      precio: 275,
      observaciones: 'Cliente viaja fuera de la ciudad.'
    },
    {
      id: '19',
      cliente: 'Daniel Bravo',
      fecha: '2026-07-24',
      estilo: 'Blackwork',
      tatuador: 'Jesus Macias',
      zonaCuerpo: 'Brazo',
      estado: 'Pendiente',
      precio: 205,
      observaciones: 'Pendiente confirmacion final.'
    },
    {
      id: '20',
      cliente: 'Lucia Anchundia',
      fecha: '2026-07-25',
      estilo: 'Realismo',
      tatuador: 'Jehu Villamar',
      zonaCuerpo: 'Muslo',
      estado: 'Confirmada',
      precio: 340,
      observaciones: 'Proyecto con sombreado completo.'
    },
    {
      id: '21',
      cliente: 'Bruno Zamora',
      fecha: '2026-07-26',
      estilo: 'Geometrico',
      tatuador: 'Jordan Solorzano',
      zonaCuerpo: 'Hombro',
      estado: 'En diseño',
      precio: 220,
      observaciones: 'Diseno pendiente de ajustes.'
    },
    {
      id: '22',
      cliente: 'Alejandra Moreira',
      fecha: '2026-07-27',
      estilo: 'Minimalista',
      tatuador: 'Jesus Macias',
      zonaCuerpo: 'Tobillo',
      estado: 'Pendiente',
      precio: 98,
      observaciones: 'Cliente solicita cita matutina.'
    },
    {
      id: '23',
      cliente: 'Gustavo Pino',
      fecha: '2026-07-28',
      estilo: 'Tribal',
      tatuador: 'Jehu Villamar',
      zonaCuerpo: 'Pecho',
      estado: 'Confirmada',
      precio: 260,
      observaciones: 'Abono registrado en caja.'
    }
  */

  citas = signal<CitaTatuaje[]>(this.loadCitas());
  tatuadores = signal<Tatuador[]>([]);
  private readonly estadoRemotoPorCita = new Map<string, string>();

  private getRemoteConfig(): { url: string; key: string; token: string } | null {
    const params = new URLSearchParams(window.location.search);
    const url = localStorage.getItem('supabase_url') || params.get('supabaseUrl');
    const key = localStorage.getItem('supabase_key') || params.get('supabaseKey');
    const token = localStorage.getItem('token');
    return url && key && token ? { url, key, token } : null;
  }

  private async getResponseError(response: Response, fallbackMessage: string): Promise<Error> {
    if (response.status === 401) {
      (window.top ?? window).location.assign('/');
      return new SessionExpiredError();
    }

    const body = await response.text();
    if (!body) return new Error(fallbackMessage);

    try {
      const details = JSON.parse(body) as { message?: string; hint?: string; details?: string };
      const message = [details.message, details.hint, details.details].filter(Boolean).join(' ');
      return new Error(message || fallbackMessage);
    } catch {
      return new Error(body);
    }
  }

  async cargarCitasRemotas(): Promise<void> {
    const config = this.getRemoteConfig();
    if (!config) return;

    const response = await fetch(`${config.url}/rest/v1/rpc/get_appointments_for_admin`, {
      method: 'POST',
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json'
      },
      body: '{}'
    });
    if (!response.ok) throw await this.getResponseError(response, 'No se pudieron cargar las citas de clientes.');

    const data = await response.json() as Array<{
      id: string; client_name: string; appointment_date: string; artist: string;
      style: string; body_area: string; status: string; price: number; notes: string | null;
      size_cm: number | null; tattoo_reference_path: string | null; catalog_design_id: string | null;
      catalog_image_url: string | null; payment_receipt_path: string | null; ai_analysis: CitaTatuaje['aiAnalysis'];
      original_price: number | null; payment_verified_at: string | null; user_id: string;
    }>;
    const citas = await Promise.all(data.map(async (cita) => ({
      id: cita.id,
      cliente: cita.client_name,
      fecha: cita.appointment_date,
      tatuador: cita.artist,
      estilo: cita.style,
      zonaCuerpo: cita.body_area,
      estado: cita.status.charAt(0).toUpperCase() + cita.status.slice(1),
      precio: Number(cita.price),
      observaciones: cita.notes ?? '',
      sizeCm: cita.size_cm,
      tattooReferenceUrl: await this.getPrivateFileUrl(cita.tattoo_reference_path),
      catalogDesignId: cita.catalog_design_id,
      catalogImageUrl: cita.catalog_image_url,
      paymentReceiptUrl: await this.getPrivateFileUrl(cita.payment_receipt_path),
      aiAnalysis: cita.ai_analysis,
      originalPrice: cita.original_price,
      paymentVerifiedAt: cita.payment_verified_at,
      userId: cita.user_id
    })));
    this.estadoRemotoPorCita.clear();
    for (const cita of data) {
      this.estadoRemotoPorCita.set(cita.id, cita.status);
    }
    this.citas.set(citas);
    this.saveCitas(citas);
  }

  private async getPrivateFileUrl(path: string | null): Promise<string | null> {
    if (!path) return null;
    const config = this.getRemoteConfig();
    if (!config) throw new Error('No se encontró la configuración de Supabase.');
    const encodedPath = path.split('/').map(encodeURIComponent).join('/');
    const response = await fetch(`${config.url}/storage/v1/object/sign/tattoo-attachments/${encodedPath}`, {
      method: 'POST',
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ expiresIn: 600 })
    });
    if (!response.ok) throw await this.getResponseError(response, 'No se pudo abrir un archivo adjunto.');
    const data = await response.json() as { signedURL?: string };
    if (!data.signedURL) throw new Error('Supabase no devolvió el enlace temporal del archivo.');
    return new URL(data.signedURL, config.url).toString();
  }

  async confirmarPago(id: string): Promise<void> {
    const config = this.getRemoteConfig();
    if (!config) throw new Error('No se encontró la configuración de Supabase.');
    const response = await fetch(`${config.url}/rest/v1/rpc/confirm_appointment_payment`, {
      method: 'POST',
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ p_id: id })
    });
    if (!response.ok) throw await this.getResponseError(response, 'No se pudo confirmar el pago.');
    await this.cargarCitasRemotas();
  }

  async crearCodigoDescuento(appointmentId: string, finalPrice: number): Promise<string> {
    const config = this.getRemoteConfig();
    if (!config) throw new Error('No se encontró la configuración de Supabase.');
    const response = await fetch(`${config.url}/rest/v1/rpc/create_discount_code_for_admin`, {
      method: 'POST',
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ p_appointment_id: appointmentId, p_final_price: finalPrice })
    });
    if (!response.ok) throw await this.getResponseError(response, 'No se pudo crear el código de descuento.');
    return await response.json() as string;
  }

  async getMensajesCita(appointmentId: string): Promise<MensajeCita[]> {
    const config = this.getRemoteConfig();
    if (!config) throw new Error('No se encontró la configuración de Supabase.');
    const query = new URLSearchParams({
      select: 'id,appointment_id,sender_role,body,created_at',
      appointment_id: `eq.${appointmentId}`,
      order: 'created_at.asc'
    });
    const response = await fetch(`${config.url}/rest/v1/appointment_messages?${query}`, {
      headers: { apikey: config.key, Authorization: `Bearer ${config.token}` }
    });
    if (!response.ok) throw await this.getResponseError(response, 'No se pudo cargar la conversación.');
    return await response.json() as MensajeCita[];
  }

  async enviarMensajeCita(appointmentId: string, body: string): Promise<void> {
    const config = this.getRemoteConfig();
    if (!config) throw new Error('No se encontró la configuración de Supabase.');
    const response = await fetch(`${config.url}/rest/v1/appointment_messages`, {
      method: 'POST',
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({ appointment_id: appointmentId, sender_role: 'admin', body: body.trim() })
    });
    if (!response.ok) throw await this.getResponseError(response, 'No se pudo enviar el mensaje.');
  }

  async getConfiguracionPago(): Promise<ConfiguracionPago> {
    const config = this.getRemoteConfig();
    if (!config) throw new Error('No se encontró la configuración de Supabase.');
    const response = await fetch(`${config.url}/rest/v1/studio_payment_settings?id=eq.true&select=bank_name,account_holder,account_type,account_number,account_id_number,deposit_amount`, {
      headers: { apikey: config.key, Authorization: `Bearer ${config.token}` }
    });
    if (!response.ok) throw await this.getResponseError(response, 'No se pudo cargar la configuración de abonos.');
    const data = await response.json() as ConfiguracionPago[];
    if (!data.length) throw new Error('No existe una configuración de pago.');
    return data[0];
  }

  async guardarConfiguracionPago(settings: ConfiguracionPago): Promise<void> {
    const config = this.getRemoteConfig();
    if (!config) throw new Error('No se encontró la configuración de Supabase.');
    const response = await fetch(`${config.url}/rest/v1/studio_payment_settings`, {
      method: 'POST',
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify({ id: true, ...settings, updated_at: new Date().toISOString() })
    });
    if (!response.ok) throw await this.getResponseError(response, 'No se pudo guardar la configuración de abonos.');
  }

  async cargarTatuadoresRemotos(): Promise<void> {
    const config = this.getRemoteConfig();
    if (!config) return;

    const response = await fetch(`${config.url}/rest/v1/rpc/get_artists_for_admin`, {
      method: 'POST',
      headers: { apikey: config.key, Authorization: `Bearer ${config.token}`, 'Content-Type': 'application/json' },
      body: '{}'
    });
    if (!response.ok) throw await this.getResponseError(response, 'No se pudieron cargar los tatuadores.');

    const data = await response.json() as Array<{ id: string; name: string; active: boolean }>;
    this.tatuadores.set(data.map((tatuador) => ({
      id: tatuador.id,
      nombre: tatuador.name,
      activo: tatuador.active
    })));
  }

  async agregarTatuador(nombre: string): Promise<void> {
    const config = this.getRemoteConfig();
    if (!config) throw new Error('No se encontró la configuración de Supabase.');

    const response = await fetch(`${config.url}/rest/v1/rpc/add_artist_for_admin`, {
      method: 'POST',
      headers: { apikey: config.key, Authorization: `Bearer ${config.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_name: nombre.trim() })
    });
    if (!response.ok) throw new Error('No se pudo agregar el tatuador.');
    await this.cargarTatuadoresRemotos();
  }

  async retirarTatuador(id: string): Promise<void> {
    const config = this.getRemoteConfig();
    if (!config) throw new Error('No se encontró la configuración de Supabase.');

    const response = await fetch(`${config.url}/rest/v1/rpc/remove_artist_for_admin`, {
      method: 'POST',
      headers: { apikey: config.key, Authorization: `Bearer ${config.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_id: id })
    });
    if (!response.ok) throw new Error('No se pudo retirar el tatuador.');
    await this.cargarTatuadoresRemotos();
  }

  private saveCitas(citas: CitaTatuaje[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(citas));
  }

  private loadCitas(): CitaTatuaje[] {
    if (localStorage.getItem(STORAGE_MIGRATION_KEY) !== 'true') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(STORAGE_MIGRATION_KEY, 'true');
      return [];
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [...this.defaultCitas];
    }
    try {
      const parsed = JSON.parse(raw) as CitaTatuaje[];
      if (!Array.isArray(parsed)) {
        return [...this.defaultCitas];
      }
      // Migración defensiva para datos antiguos guardados sin nuevos campos.
      return parsed.map((cita) => ({
        ...cita,
        precio: Number(cita.precio ?? 0),
        observaciones: cita.observaciones ?? ''
      }));
    } catch {
      return [...this.defaultCitas];
    }
  }

  private updateAndSave(updateFn: (current: CitaTatuaje[]) => CitaTatuaje[]) {
    const next = updateFn(this.citas());
    this.citas.set(next);
    this.saveCitas(next);
  }

  obtenerCitaPorId(id: string): CitaTatuaje | undefined {
    return this.citas().find(c => c.id === id);
  }

  agregarCita(cita: CitaTatuaje) {
    this.updateAndSave(list => [...list, cita]);
  }

  async eliminarCita(id: string) {
    const config = this.getRemoteConfig();
    if (config) {
      const response = await fetch(`${config.url}/rest/v1/rpc/delete_appointment_for_admin`, {
        method: 'POST',
        headers: { apikey: config.key, Authorization: `Bearer ${config.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_id: id })
      });
      if (!response.ok) throw await this.getResponseError(response, 'No se pudo eliminar la cita.');
    }
    this.updateAndSave(list => list.filter(c => c.id !== id));
  }

  async actualizarCita(updated: CitaTatuaje) {
    const config = this.getRemoteConfig();
    if (config) {
      const expectedStatus = this.estadoRemotoPorCita.get(updated.id);
      if (expectedStatus === undefined) {
        await this.cargarCitasRemotas();
        throw new Error('Se actualizó el listado para verificar la cita. Revísala y vuelve a guardar.');
      }

      const response = await fetch(`${config.url}/rest/v1/rpc/update_appointment_for_admin`, {
        method: 'POST',
        headers: { apikey: config.key, Authorization: `Bearer ${config.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          p_id: updated.id,
          p_artist: updated.tatuador,
          p_style: updated.estilo,
          p_date: updated.fecha,
          p_start_time: null,
          p_body_area: updated.zonaCuerpo,
          p_status: updated.estado.toLowerCase(),
          p_price: updated.precio,
          p_notes: updated.observaciones,
          p_expected_status: expectedStatus
        })
      });
      if (!response.ok) throw await this.getResponseError(response, 'No se pudo guardar la cita.');

      const saved = await response.json() as boolean;
      if (saved !== true) {
        try {
          await this.cargarCitasRemotas();
        } catch (error) {
          const reason = error instanceof Error ? error.message : 'error desconocido';
          throw new Error(`Otra persona modificó esta cita. No se pudo actualizar el listado: ${reason}`);
        }
        throw new Error('Otra persona modificó esta cita. Se actualizó el listado; revisa los datos antes de volver a guardar.');
      }

      this.estadoRemotoPorCita.set(updated.id, updated.estado.toLowerCase());
    }
    this.updateAndSave(list => list.map(c => c.id === updated.id ? updated : c));
  }

  restaurarCitas() {
    this.citas.set([]);
    this.saveCitas([]);
  }
}