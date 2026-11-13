<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import {
  applyAppointmentDiscount,
  cancelMyAppointment,
  getAppointmentFileUrl,
  getAppointmentMessages,
  getCompletedAppointmentsForAdmin,
  getMyAppointments,
  sendAppointmentMessage,
  type Appointment,
  type AppointmentMessage
} from '../services/clientPortal';

const appointments = ref<Appointment[]>([]);
const loading = ref(true);
const error = ref('');
const errorArchivo = ref('');
const esAdmin = localStorage.getItem('user_role') === 'admin';
const filtroCitas = ref('');
const mensajes = ref<Record<string, AppointmentMessage[]>>({});
const chatAbierto = ref<Record<string, boolean>>({});
const borradores = ref<Record<string, string>>({});
const erroresChat = ref<Record<string, string>>({});
const codigosDescuento = ref<Record<string, string>>({});
const erroresDescuento = ref<Record<string, string>>({});
const erroresCita = ref<Record<string, string>>({});
const archivosPrivados = ref<Record<string, string>>({});
const procesandoCita = ref<Record<string, boolean>>({});

function getErrorMessage(cause: unknown, fallback: string): string {
  if (cause instanceof Error) return cause.message;
  if (typeof cause === 'object' && cause !== null && 'message' in cause && typeof cause.message === 'string') {
    return cause.message;
  }
  return fallback;
}

const completed = computed(() => appointments.value.filter(item => item.status === 'completada'));
const completedFiltered = computed(() => {
  const filtro = filtroCitas.value.trim().toLocaleLowerCase('es-EC');
  return completed.value.filter(cita => !filtro ||
    cita.client_name.toLocaleLowerCase('es-EC').includes(filtro) ||
    cita.artist.toLocaleLowerCase('es-EC').includes(filtro));
});

function formatDate(date: string) {
  return new Intl.DateTimeFormat('es-EC', { dateStyle: 'long' }).format(new Date(`${date}T00:00:00`));
}

function formatTime(time: string | null) {
  return time ? time.slice(0, 5) : 'Por confirmar';
}

async function abrirChat(cita: Appointment) {
  const open = !chatAbierto.value[cita.id];
  chatAbierto.value[cita.id] = open;
  if (!open) return;
  try {
    mensajes.value[cita.id] = await getAppointmentMessages(cita.id);
    erroresChat.value[cita.id] = '';
  } catch (cause) {
    erroresChat.value[cita.id] = cause instanceof Error ? cause.message : 'No se pudo cargar la conversación.';
  }
}

async function enviarMensaje(cita: Appointment) {
  const body = (borradores.value[cita.id] ?? '').trim();
  if (!body) return;
  try {
    await sendAppointmentMessage(cita.id, body, 'cliente');
    borradores.value[cita.id] = '';
    mensajes.value[cita.id] = await getAppointmentMessages(cita.id);
    erroresChat.value[cita.id] = '';
  } catch (cause) {
    erroresChat.value[cita.id] = cause instanceof Error ? cause.message : 'No se pudo enviar el mensaje.';
  }
}

async function aplicarDescuento(cita: Appointment) {
  const code = (codigosDescuento.value[cita.id] ?? '').trim();
  if (!code) return;
  procesandoCita.value[cita.id] = true;
  erroresDescuento.value[cita.id] = '';
  try {
    const result = await applyAppointmentDiscount(cita.id, code);
    cita.original_price = Number(result.original_price);
    cita.price = Number(result.final_price);
    cita.discount_code_id = 'applied';
    codigosDescuento.value[cita.id] = '';
  } catch (cause) {
    erroresDescuento.value[cita.id] = cause instanceof Error ? cause.message : 'No se pudo aplicar el código.';
  } finally {
    procesandoCita.value[cita.id] = false;
  }
}

async function cancelarCita(cita: Appointment) {
  if (!window.confirm('¿Cancelar esta cita pendiente?')) return;
  procesandoCita.value[cita.id] = true;
  erroresCita.value[cita.id] = '';
  try {
    await cancelMyAppointment(cita.id);
    cita.status = 'cancelada';
  } catch (cause) {
    erroresCita.value[cita.id] = cause instanceof Error ? cause.message : 'No se pudo cancelar la cita.';
  } finally {
    procesandoCita.value[cita.id] = false;
  }
}

async function abrirArchivo(path: string | null, appointmentId: string, kind: string) {
  if (!path) return;
  const key = `${appointmentId}:${kind}`;
  if (archivosPrivados.value[key]) {
    window.open(archivosPrivados.value[key], '_blank', 'noopener,noreferrer');
    return;
  }
  try {
    const url = await getAppointmentFileUrl(path);
    archivosPrivados.value[key] = url;
    window.open(url, '_blank', 'noopener,noreferrer');
  } catch (cause) {
    errorArchivo.value = cause instanceof Error ? cause.message : 'No se pudo abrir el archivo.';
  }
}

function reimprimirFactura(cita: Appointment) {
  const escapeHtml = (value: unknown) => String(value ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  const factura = window.open('', '_blank', 'width=760,height=680');
  if (!factura) return;

  factura.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Factura ${escapeHtml(cita.id.slice(0, 8))}</title><style>body{font-family:Arial,sans-serif;color:#1f2937;padding:42px;max-width:680px;margin:auto}header{display:flex;justify-content:space-between;border-bottom:2px solid #f59e0b;padding-bottom:16px;margin-bottom:28px}h1{margin:0;font-size:28px}.muted{color:#6b7280}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:22px 0}.total{margin-top:28px;padding-top:16px;border-top:1px solid #d1d5db;text-align:right;font-size:22px;font-weight:bold}</style></head><body><header><div><h1>INK &amp; IRON</h1><p class="muted">Factura de cita</p></div><div><strong>N.° ${escapeHtml(cita.id.slice(0, 8).toUpperCase())}</strong><br><span class="muted">${escapeHtml(formatDate(cita.appointment_date))}</span></div></header><div class="grid"><div><strong>Cliente</strong><br>${escapeHtml(cita.client_name)}</div><div><strong>Estado</strong><br>Completada</div><div><strong>Tatuador</strong><br>${escapeHtml(cita.artist)}</div><div><strong>Estilo</strong><br>${escapeHtml(cita.style)}</div><div><strong>Zona del cuerpo</strong><br>${escapeHtml(cita.body_area)}</div><div><strong>Observaciones</strong><br>${escapeHtml(cita.notes || 'Sin observaciones')}</div></div><div class="total">Total: $${Number(cita.price || 0).toFixed(2)}</div></body></html>`);
  factura.document.close();
  factura.focus();
  factura.print();
}

onMounted(async () => {
  try {
    appointments.value = esAdmin
      ? await getCompletedAppointmentsForAdmin()
      : await getMyAppointments();
    if (!esAdmin) {
      for (const cita of appointments.value) {
        if (cita.tattoo_reference_path) {
          try {
            archivosPrivados.value[`${cita.id}:reference`] = await getAppointmentFileUrl(cita.tattoo_reference_path);
          } catch (cause) {
            errorArchivo.value = cause instanceof Error ? cause.message : 'No se pudo cargar una imagen de referencia.';
          }
        }
      }
    }
  } catch (cause) {
    error.value = getErrorMessage(cause, 'No se pudo cargar tu historial.');
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <main class="history-page">
    <header class="history-header">
      <div><p class="eyebrow">{{ esAdmin ? 'Administrador' : 'Cuenta de cliente' }}</p><h1>{{ esAdmin ? 'Citas realizadas' : 'Mi historial de citas' }}</h1><p>{{ esAdmin ? 'Consulta únicamente las citas completadas por los clientes.' : 'Consulta tus próximas reservas y sesiones realizadas.' }}</p></div>
      <label v-if="esAdmin" class="history-search">Buscar (cliente o tatuador)<input v-model="filtroCitas" type="search" placeholder="Escribe para filtrar" /></label>
    </header>
    <p v-if="loading" class="panel">Cargando historial...</p>
    <p v-else-if="error" class="panel error">{{ error }}</p>
    <template v-else>
      <p v-if="errorArchivo" class="panel error">{{ errorArchivo }}</p>
      <section v-if="!esAdmin" class="panel">
        <h2>Mis citas</h2>
        <p v-if="!appointments.length" class="empty">Todavía no tienes citas.</p>
        <article v-for="cita in appointments" :key="cita.id" class="appointment">
          <div>
            <strong>Estilo: {{ cita.style }}</strong>
            <span>Fecha: {{ formatDate(cita.appointment_date) }}</span>
          </div>
          <span :class="['status', cita.status]">{{ cita.status }}</span>
          <div class="details">
            <span>Artista: {{ cita.artist }}</span>
            <span>Hora: {{ formatTime(cita.start_time) }}</span>
            <span>Duración: {{ cita.duration_minutes }} min</span>
            <span>Zona: {{ cita.body_area }}</span>
            <span v-if="cita.size_cm">Tamaño: {{ cita.size_cm }} cm</span>
            <span v-if="cita.original_price && cita.original_price !== cita.price">Precio anterior: ${{ Number(cita.original_price).toFixed(2) }}</span>
            <span>Precio actual: ${{ Number(cita.price).toFixed(2) }}</span>
            <span v-if="cita.catalog_design_id">Diseño del catálogo: ID {{ cita.catalog_design_id }}</span>
            <span v-if="cita.notes">Comentario: {{ cita.notes }}</span>
          </div>
          <div v-if="cita.catalog_image_url || cita.tattoo_reference_path" class="reference-preview">
            <a v-if="cita.tattoo_reference_path" href="#" @click.prevent="abrirArchivo(cita.tattoo_reference_path, cita.id, 'reference')">
              <img v-if="archivosPrivados[`${cita.id}:reference`]" :src="archivosPrivados[`${cita.id}:reference`]" alt="Diseño de referencia adjunto" />
              Ver referencia subida
            </a>
            <a v-if="cita.catalog_image_url" :href="cita.catalog_image_url" target="_blank" rel="noopener noreferrer">Abrir diseño del catálogo</a>
            <button v-if="cita.payment_receipt_path" class="reprint-button" type="button" @click="abrirArchivo(cita.payment_receipt_path, cita.id, 'receipt')">Ver comprobante</button>
          </div>
          <div v-if="cita.status === 'pendiente'" class="discount-form">
            <label :for="`discount-${cita.id}`">¿Acordaste otro precio con el admin? Ingresa el código que te enviaron</label>
            <div class="discount-row">
              <input :id="`discount-${cita.id}`" v-model="codigosDescuento[cita.id]" placeholder="Código de descuento" />
              <button type="button" :disabled="procesandoCita[cita.id]" @click="aplicarDescuento(cita)">Aplicar</button>
            </div>
            <p v-if="erroresDescuento[cita.id]" class="error">{{ erroresDescuento[cita.id] }}</p>
          </div>
          <div v-if="cita.status !== 'completada' && cita.status !== 'cancelada'" class="chat-box">
            <button type="button" class="reprint-button" @click="abrirChat(cita)">
              {{ chatAbierto[cita.id] ? 'Cerrar chat con el admin' : 'Hablar con el admin sobre el precio' }}
            </button>
            <div v-if="chatAbierto[cita.id]" class="chat-thread">
              <p v-for="mensaje in mensajes[cita.id] ?? []" :key="mensaje.id" :class="['chat-message', mensaje.sender_role === 'cliente' ? 'client-message' : 'admin-message']">
                <strong>{{ mensaje.sender_role === 'cliente' ? 'Tú' : 'Admin' }}:</strong> {{ mensaje.body }}
              </p>
              <p v-if="erroresChat[cita.id]" class="error">{{ erroresChat[cita.id] }}</p>
              <div class="discount-row">
                <input v-model="borradores[cita.id]" placeholder="Escribe un mensaje" maxlength="2000" />
                <button type="button" @click="enviarMensaje(cita)">Enviar</button>
              </div>
            </div>
          </div>
          <button v-if="cita.status === 'pendiente'" class="cancel-button" type="button" :disabled="procesandoCita[cita.id]" @click="cancelarCita(cita)">Cancelar cita</button>
          <p v-if="erroresCita[cita.id]" class="error">{{ erroresCita[cita.id] }}</p>
          <p v-if="cita.status === 'pendiente'" class="pending-note">La cita queda pendiente hasta que el admin revise el comprobante en Banco Pichincha y la confirme.</p>
        </article>
      </section>
      <section class="panel"><div class="completed-heading"><h2>{{ esAdmin ? 'Citas completadas por clientes' : 'Historial realizado' }}</h2></div><p v-if="!(esAdmin ? completedFiltered : completed).length" class="empty">{{ esAdmin ? 'No hay citas completadas que coincidan con el filtro.' : 'Las sesiones completadas aparecerán aquí.' }}</p><article v-for="cita in esAdmin ? completedFiltered : completed" :key="cita.id" class="appointment"><div><strong>Estilo: {{ cita.style }}</strong><span>Fecha: {{ formatDate(cita.appointment_date) }}</span></div><span class="status completada">Completada</span><div class="details"><span v-if="esAdmin">Cliente: {{ cita.client_name }}</span><span>Artista: {{ cita.artist }}</span><span>Hora: {{ formatTime(cita.start_time) }}</span><span>Duración: {{ cita.duration_minutes }} min</span><span>Zona: {{ cita.body_area }}</span><span v-if="cita.size_cm">Tamaño: {{ cita.size_cm }} cm</span><span>Precio: ${{ cita.price.toFixed(2) }}</span><span v-if="cita.notes">Comentario: {{ cita.notes }}</span></div><button v-if="esAdmin" class="reprint-button" type="button" @click="reimprimirFactura(cita)">Reimprimir factura</button></article></section>
    </template>
  </main>
</template>

<style scoped>
.history-page { min-height: 100vh; padding: 2rem; background: #0f0f0f; color: #f3f4f6; font-family: Raleway, Arial, sans-serif; }.history-header { max-width: 960px; margin: 0 auto 1.5rem; display: flex; justify-content: space-between; gap: 1rem; }.history-header h1 { margin: .2rem 0; font-family: 'Playfair Display', serif; }.history-header p { margin: 0; color: #9ca3af; }.eyebrow { color: #fbbf24 !important; text-transform: uppercase; font-size: .75rem; font-weight: 700; letter-spacing: .08em; }.panel { max-width: 960px; margin: 0 auto 1rem; padding: 1.25rem; background: #1a1a1a; border: 1px solid rgba(255,255,255,.12); border-radius: 8px; }.panel h2 { margin: 0; }.completed-heading { display: flex; justify-content: space-between; align-items: end; gap: 1rem; margin-bottom: 1rem; }.history-search { display: grid; gap: .4rem; color: #d1d5db; font-size: .85rem; min-width: 270px; }.history-search input { padding: .65rem .75rem; border: 1px solid rgba(255,255,255,.15); border-radius: 6px; background: rgba(255,255,255,.05); color: #f3f4f6; font: inherit; }.appointment { display: grid; grid-template-columns: 1fr auto; gap: .5rem 1rem; border-top: 1px solid rgba(255,255,255,.1); padding: 1rem 0; }.appointment strong, .appointment span { display: block; }.appointment div span, .empty { color: #9ca3af; margin-top: .25rem; }.details { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .45rem 1rem; color: #d1d5db; font-size: .9rem; }.details span { margin: 0; }.reprint-button, .discount-row button, .cancel-button { justify-self: start; padding: .6rem .8rem; border: 0; border-radius: 6px; background: #f59e0b; color: #111827; font-weight: 700; cursor: pointer; }.status { text-transform: capitalize; border-radius: 999px; padding: .25rem .6rem; height: fit-content; font-size: .8rem; font-weight: 700; background: rgba(245,158,11,.18); color: #fcd34d; }.confirmada { background: rgba(59,130,246,.18); color: #93c5fd; }.completada { background: rgba(34,197,94,.18); color: #86efac; }.error { color: #fca5a5; background: rgba(239,68,68,.12); }.reference-preview, .discount-form, .chat-box, .chat-thread { grid-column: 1 / -1; display: grid; gap: .6rem; }.reference-preview { grid-template-columns: repeat(auto-fit, minmax(160px, max-content)); align-items: start; }.reference-preview img { display: block; max-width: 180px; max-height: 180px; object-fit: contain; border-radius: 6px; }.discount-form label, .pending-note { color: #fcd34d; font-size: .88rem; }.discount-row { display: flex; gap: .5rem; }.discount-row input { min-width: 0; flex: 1; padding: .65rem .75rem; border: 1px solid rgba(255,255,255,.15); border-radius: 6px; background: rgba(255,255,255,.05); color: #f3f4f6; font: inherit; }.chat-thread { padding: .75rem; border: 1px solid rgba(255,255,255,.1); border-radius: 6px; }.chat-message { margin: 0; padding: .5rem .65rem; border-radius: 6px; background: rgba(255,255,255,.06); }.admin-message { background: rgba(245,158,11,.12); }.cancel-button { background: #7f1d1d; color: #fecaca; }.pending-note { margin: 0; } @media (max-width: 620px) { .history-page { padding: 1rem; }.history-header, .completed-heading { flex-direction: column; align-items: stretch; }.history-search { min-width: 0; }.details { grid-template-columns: 1fr; }.discount-row { flex-direction: column; } }
</style>