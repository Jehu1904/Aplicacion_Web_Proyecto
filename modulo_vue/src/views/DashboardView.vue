<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import {
    AUTO_ASSIGN_ARTIST,
    analyzeTattooDesign,
    createAppointment,
    getActiveArtists,
    getArtistSchedule,
    getPaymentSettings,
    type Artist,
    type PaymentSettings,
    type TattooAnalysis
} from '../services/clientPortal';
import { getCatalogDesigns, type CatalogDesign } from '../../../lib/tattoo-catalog';

const route = useRoute();
const esAdmin = computed(() => localStorage.getItem('user_role') === 'admin');

// Campos del simulador de cotización
const cliente = ref<string>('');
const artista = ref<string>(AUTO_ASSIGN_ARTIST);
const estilo = ref<string>('');
const fecha = ref<string>(new Date().toISOString().split('T')[0]);
const tamanoCm = ref<number>(10);
const zonaCuerpo = ref<string>('Brazo');
const notas = ref<string>('');
const precioSimulado = ref<number | null>(null);
const imagenDiseno = ref<File | null>(null);
const imagenPreviewUrl = ref('');
const analisisImagen = ref<TattooAnalysis | null>(null);
const disenosCatalogo = ref<CatalogDesign[]>([]);
const disenoCatalogoId = ref('');
const cargandoCatalogo = ref(false);
const errorImagen = ref('');
const avisoCotizacion = ref('');
const analizandoImagen = ref(false);
const errorCotizacion = ref('');
const imagenComprobante = ref<File | null>(null);
const nombreComprobante = ref('');
const datosPago = ref<PaymentSettings | null>(null);
const errorDatosPago = ref('');
const cargandoDatosPago = ref(false);

// Campos del formulario de agendamiento lateral
const agendaCliente = ref<string>('');
const agendaFecha = ref<string>(new Date().toISOString().split('T')[0]);
const agendaArtista = ref<string>('');
const agendaHora = ref<string>('');
const agendaEstilo = ref<string>('');
const agendaZonaCuerpo = ref<string>('');
const agendaObservaciones = ref<string>('');
const agendaEstado = ref<'pendiente' | 'confirmada' | 'completada' | 'cancelada'>('pendiente');
const agendaPrecioManual = ref<number>(0);
const horariosOcupados = ref<Array<{ start_time: string; duration_minutes: number }>>([]);
const horariosPorArtista = ref<Record<string, Array<{ start_time: string; duration_minutes: number }>>>({});
const disponibilidadError = ref('');
const cargandoHorarios = ref(false);
const tatuadores = ref<Artist[]>([]);
const cargandoTatuadores = ref(true);
const errorTatuadores = ref('');
const asignacionAutomatica = computed(() => artista.value === AUTO_ASSIGN_ARTIST);

interface AppointmentDraft {
    cliente: string;
    artista: string;
    estilo: string;
    fecha: string;
    tamanoCm: number;
    zonaCuerpo: string;
    notas: string;
    disenoCatalogoId: string;
    agendaCliente: string;
    agendaFecha: string;
    agendaArtista: string;
    agendaHora: string;
    agendaEstilo: string;
    agendaZonaCuerpo: string;
    agendaObservaciones: string;
    agendaEstado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
    agendaPrecioManual: number;
}

const usuarioBorrador = localStorage.getItem('user_email')?.toLowerCase() || 'anonimo';
const BORRADOR_CITA_KEY = `inkiron.cita.borrador.${esAdmin.value ? 'admin' : 'cliente'}.${usuarioBorrador}`;
const ESTADOS_CITA = new Set(['pendiente', 'confirmada', 'completada', 'cancelada']);

function readAppointmentDraft(): AppointmentDraft | null {
    const saved = sessionStorage.getItem(BORRADOR_CITA_KEY);
    if (saved === null) return null;

    let draft: unknown;
    try {
        draft = JSON.parse(saved);
    } catch {
        sessionStorage.removeItem(BORRADOR_CITA_KEY);
        return null;
    }

    if (
        typeof draft !== 'object' ||
        draft === null ||
        !('cliente' in draft) ||
        !('artista' in draft) ||
        !('estilo' in draft) ||
        !('fecha' in draft) ||
        !('tamanoCm' in draft) ||
        !('zonaCuerpo' in draft) ||
        !('notas' in draft) ||
        !('disenoCatalogoId' in draft) ||
        !('agendaCliente' in draft) ||
        !('agendaFecha' in draft) ||
        !('agendaArtista' in draft) ||
        !('agendaHora' in draft) ||
        !('agendaEstilo' in draft) ||
        !('agendaZonaCuerpo' in draft) ||
        !('agendaObservaciones' in draft) ||
        !('agendaEstado' in draft) ||
        !('agendaPrecioManual' in draft)
    ) {
        sessionStorage.removeItem(BORRADOR_CITA_KEY);
        return null;
    }

    const value = draft as AppointmentDraft;
    const textFields: Array<keyof AppointmentDraft> = [
        'cliente', 'artista', 'estilo', 'fecha', 'zonaCuerpo', 'notas',
        'disenoCatalogoId', 'agendaCliente', 'agendaFecha', 'agendaArtista',
        'agendaHora', 'agendaEstilo', 'agendaZonaCuerpo', 'agendaObservaciones'
    ];
    if (
        textFields.some(field => typeof value[field] !== 'string') ||
        !Number.isFinite(value.tamanoCm) ||
        value.tamanoCm < 5 ||
        value.tamanoCm > 40 ||
        !Number.isFinite(value.agendaPrecioManual) ||
        value.agendaPrecioManual < 0 ||
        !ESTADOS_CITA.has(value.agendaEstado)
    ) {
        sessionStorage.removeItem(BORRADOR_CITA_KEY);
        return null;
    }

    return value;
}

const borradorGuardado = readAppointmentDraft();
if (borradorGuardado) {
    cliente.value = borradorGuardado.cliente;
    artista.value = borradorGuardado.artista;
    estilo.value = borradorGuardado.estilo;
    fecha.value = borradorGuardado.fecha;
    tamanoCm.value = borradorGuardado.tamanoCm;
    zonaCuerpo.value = borradorGuardado.zonaCuerpo;
    notas.value = borradorGuardado.notas;
    disenoCatalogoId.value = borradorGuardado.disenoCatalogoId;
    agendaCliente.value = borradorGuardado.agendaCliente;
    agendaFecha.value = borradorGuardado.agendaFecha;
    agendaArtista.value = borradorGuardado.agendaArtista;
    agendaHora.value = borradorGuardado.agendaHora;
    agendaEstilo.value = borradorGuardado.agendaEstilo;
    agendaZonaCuerpo.value = borradorGuardado.agendaZonaCuerpo;
    agendaObservaciones.value = borradorGuardado.agendaObservaciones;
    agendaEstado.value = borradorGuardado.agendaEstado;
    agendaPrecioManual.value = borradorGuardado.agendaPrecioManual;
}

watch(
    [
        cliente, artista, estilo, fecha, tamanoCm, zonaCuerpo, notas, disenoCatalogoId,
        agendaCliente, agendaFecha, agendaArtista, agendaHora, agendaEstilo,
        agendaZonaCuerpo, agendaObservaciones, agendaEstado, agendaPrecioManual
    ],
    () => {
        const draft: AppointmentDraft = {
            cliente: cliente.value,
            artista: artista.value,
            estilo: estilo.value,
            fecha: fecha.value,
            tamanoCm: tamanoCm.value,
            zonaCuerpo: zonaCuerpo.value,
            notas: notas.value,
            disenoCatalogoId: disenoCatalogoId.value,
            agendaCliente: agendaCliente.value,
            agendaFecha: agendaFecha.value,
            agendaArtista: agendaArtista.value,
            agendaHora: agendaHora.value,
            agendaEstilo: agendaEstilo.value,
            agendaZonaCuerpo: agendaZonaCuerpo.value,
            agendaObservaciones: agendaObservaciones.value,
            agendaEstado: agendaEstado.value,
            agendaPrecioManual: agendaPrecioManual.value
        };
        sessionStorage.setItem(BORRADOR_CITA_KEY, JSON.stringify(draft));
    },
    { flush: 'sync' }
);

function mensajeError(error: unknown, fallback: string): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
        return error.message;
    }
    return fallback;
}

function capitalizarPrimeraLetra(valor: string): string {
    const texto = valor.trim();
    return texto ? texto.charAt(0).toLocaleUpperCase('es-EC') + texto.slice(1) : '';
}

const precioEstimado = computed(() => {
    const multiplicadorZona = {
        Brazo: 1,
        Costillas: 1.2,
        Cuello: 1.3
    } as const;

    const base = (50 + (tamanoCm.value * 5))
        * (multiplicadorZona[zonaCuerpo.value as keyof typeof multiplicadorZona] ?? 1);
    const analysis = analisisImagen.value;
    if (!analysis) return base;

    const factorComplejidad = {
        simple: 1,
        media: 1.12,
        alta: 1.25,
        muy_alta: 1.4
    }[analysis.complexity];
    const factorColor = analysis.colors.length > 1 ? 1.12 : 1;
    const factorSombreado = analysis.shading === 'alto' ? 1.12 : analysis.shading === 'medio' ? 1.05 : 1;
    const factorLineas = analysis.lineDetail === 'alto' ? 1.12 : analysis.lineDetail === 'medio' ? 1.05 : 1;

    return base * factorComplejidad * factorColor * factorSombreado * factorLineas;
});

const disenoCatalogoSeleccionado = computed(() => disenosCatalogo.value.find(diseno => diseno.id === disenoCatalogoId.value) ?? null);

function seleccionarImagen(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    precioSimulado.value = null;
    analisisImagen.value = null;
    errorImagen.value = '';
    avisoCotizacion.value = '';
    errorCotizacion.value = '';
    imagenDiseno.value = file;
    disenoCatalogoId.value = '';

    if (imagenPreviewUrl.value) URL.revokeObjectURL(imagenPreviewUrl.value);
    imagenPreviewUrl.value = '';
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        errorImagen.value = 'Elige una imagen JPG, PNG o WebP.';
        imagenDiseno.value = null;
        input.value = '';
        return;
    }
    if (file.size > 5 * 1024 * 1024) {
        errorImagen.value = 'La imagen no debe superar 5 MB.';
        imagenDiseno.value = null;
        input.value = '';
        return;
    }

    imagenPreviewUrl.value = URL.createObjectURL(file);
}

function seleccionarDisenoCatalogo(): void {
    precioSimulado.value = null;
    analisisImagen.value = null;
    errorImagen.value = '';
    avisoCotizacion.value = '';
    errorCotizacion.value = '';
    imagenDiseno.value = null;
    if (imagenPreviewUrl.value) URL.revokeObjectURL(imagenPreviewUrl.value);
    imagenPreviewUrl.value = '';
    const imageInput = document.querySelector<HTMLInputElement>('#imagen-diseno');
    if (imageInput) imageInput.value = '';
    if (disenoCatalogoSeleccionado.value && !estilo.value.trim()) {
        estilo.value = disenoCatalogoSeleccionado.value.style;
    }
}

function seleccionarComprobante(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    imagenComprobante.value = null;
    nombreComprobante.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type)) {
        errorCotizacion.value = 'El comprobante debe ser JPG, PNG, WebP o PDF.';
        input.value = '';
        return;
    }
    if (file.size > 5 * 1024 * 1024) {
        errorCotizacion.value = 'El comprobante no debe superar 5 MB.';
        input.value = '';
        return;
    }
    imagenComprobante.value = file;
    nombreComprobante.value = file.name;
    errorCotizacion.value = '';
}

onUnmounted(() => {
    if (imagenPreviewUrl.value) URL.revokeObjectURL(imagenPreviewUrl.value);
});

watch([tamanoCm, zonaCuerpo, estilo, disenoCatalogoId], () => {
    precioSimulado.value = null;
    analisisImagen.value = null;
    avisoCotizacion.value = '';
});

const resumenCotizacion = computed(() => [
    cliente.value ? `Cliente: ${cliente.value}` : 'Cliente sin definir',
    `Tatuador: ${artista.value === AUTO_ASSIGN_ARTIST ? 'Asignación automática' : artista.value}`,
    `Estilo: ${estilo.value}`,
    `Fecha: ${fecha.value}`,
    `Zona: ${zonaCuerpo.value}`
].join(' · '));

const agendaPrecioAutomatico = computed(() => {
    return Number((precioSimulado.value ?? 0).toFixed(2));
});

const agendaPrecio = computed(() => esAdmin.value ? agendaPrecioManual.value : agendaPrecioAutomatico.value);

const duracionEstimada = computed(() => {
    if (tamanoCm.value <= 10) return 60;
    if (tamanoCm.value <= 20) return 90;
    if (tamanoCm.value <= 30) return 120;
    return 180;
});

const opcionesHorario = ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

function minutosDesdeHora(hora: string): number {
    const [horas, minutos] = hora.slice(0, 5).split(':').map(Number);
    return horas * 60 + minutos;
}

const horariosDisponibles = computed(() => opcionesHorario.filter(hora => {
    const inicio = minutosDesdeHora(hora);
    const fin = inicio + duracionEstimada.value;
    if (fin > 18 * 60) return false;
    if (asignacionAutomatica.value) {
        return tatuadores.value.some(tatuador => {
            const ocupados = horariosPorArtista.value[tatuador.name] ?? [];
            return !ocupados.some(cita => {
                const ocupadoInicio = minutosDesdeHora(cita.start_time);
                const ocupadoFin = ocupadoInicio + cita.duration_minutes;
                return inicio < ocupadoFin && fin > ocupadoInicio;
            });
        });
    }
    return !horariosOcupados.value.some(cita => {
        const ocupadoInicio = minutosDesdeHora(cita.start_time);
        const ocupadoFin = ocupadoInicio + cita.duration_minutes;
        return inicio < ocupadoFin && fin > ocupadoInicio;
    });
}));

async function cargarDisponibilidad(): Promise<void> {
    agendaHora.value = '';
    disponibilidadError.value = '';
    if (!agendaArtista.value.trim() || !agendaFecha.value) {
        horariosOcupados.value = [];
        return;
    }

    cargandoHorarios.value = true;
    try {
        if (agendaArtista.value === AUTO_ASSIGN_ARTIST) {
            const schedules = await Promise.all(tatuadores.value.map(async tatuador => [
                tatuador.name,
                await getArtistSchedule(tatuador.name, agendaFecha.value)
            ] as const));
            horariosPorArtista.value = Object.fromEntries(schedules);
            horariosOcupados.value = [];
        } else {
            horariosPorArtista.value = {};
            horariosOcupados.value = await getArtistSchedule(agendaArtista.value, agendaFecha.value);
        }
    } catch {
        disponibilidadError.value = 'No se pudo consultar la disponibilidad. Intenta nuevamente.';
        horariosOcupados.value = [];
        horariosPorArtista.value = {};
    } finally {
        cargandoHorarios.value = false;
    }
}

watch([agendaArtista, agendaFecha], cargarDisponibilidad);

watch(fecha, (nuevaFecha) => {
    agendaFecha.value = nuevaFecha;
});

watch(artista, (nuevoTatuador) => {
    agendaArtista.value = nuevoTatuador;
});

onMounted(async () => {
    const results = await Promise.allSettled([
        getActiveArtists(),
        getCatalogDesigns()
    ]);
    if (results[0].status === 'fulfilled') tatuadores.value = results[0].value;
    else errorTatuadores.value = mensajeError(results[0].reason, 'No se pudo cargar la lista de tatuadores.');
    cargandoTatuadores.value = false;
    if (!esAdmin.value && !agendaArtista.value) {
        agendaArtista.value = AUTO_ASSIGN_ARTIST;
    }
    if (tatuadores.value.length) {
        void cargarDisponibilidad();
    }
    if (results[1].status === 'fulfilled') {
        disenosCatalogo.value = results[1].value;
        const selectedId = typeof route.query.designId === 'string' ? route.query.designId : '';
        if (selectedId && disenosCatalogo.value.some(diseno => diseno.id === selectedId)) {
            disenoCatalogoId.value = selectedId;
        }
    } else {
        errorImagen.value = mensajeError(results[1].reason, 'No se pudo cargar el catálogo.');
    }
    cargandoCatalogo.value = false;

    if (!esAdmin.value) {
        cargandoDatosPago.value = true;
        try {
            datosPago.value = await getPaymentSettings();
        } catch (error) {
            errorDatosPago.value = error instanceof Error ? error.message : 'No se pudieron cargar los datos de pago.';
        } finally {
            cargandoDatosPago.value = false;
        }
    }
});

const mostrarCotizacion = async (): Promise<void> => {
    if (!cliente.value.trim()) return;
    const imageUrl = disenoCatalogoSeleccionado.value?.image_url ?? null;
    if (!imagenDiseno.value && !imageUrl) {
        errorImagen.value = 'Sube una foto o selecciona un diseño del catálogo por su ID.';
        return;
    }

    analizandoImagen.value = true;
    errorImagen.value = '';
    avisoCotizacion.value = '';
    errorCotizacion.value = '';
    precioSimulado.value = null;
    try {
        analisisImagen.value = await analyzeTattooDesign(
            imagenDiseno.value,
            imageUrl,
            estilo.value.trim(),
            tamanoCm.value,
            zonaCuerpo.value
        );
        precioSimulado.value = Number(precioEstimado.value.toFixed(2));
    } catch (error) {
        console.error('No se pudo analizar el diseño; se usará la cotización base.', error);
        analisisImagen.value = null;
        precioSimulado.value = Number(precioEstimado.value.toFixed(2));
        avisoCotizacion.value = 'No se pudo conectar con el análisis de IA. Se generó un precio base según tamaño y zona; el tatuador confirmará el precio final.';
    } finally {
        analizandoImagen.value = false;
    }

    // Sincroniza el formulario de agendamiento con los datos simulados.
    agendaCliente.value = cliente.value.trim();
    agendaFecha.value = fecha.value;
    agendaArtista.value = artista.value.trim();
    agendaEstilo.value = estilo.value.trim();
    agendaZonaCuerpo.value = zonaCuerpo.value;
    const detalleImagen = analisisImagen.value
        ? `Análisis IA: ${analisisImagen.value.explanation}. Elementos: ${analisisImagen.value.elements.join(', ') || 'no identificados'}.`
        : '';
    agendaObservaciones.value = [notas.value.trim(), detalleImagen].filter(Boolean).join('\n');

    alert(`Cotización estimada para ${cliente.value}: $${precioSimulado.value.toFixed(2)}. No se guardó ninguna cita.`);
};

const agendarCita = async (): Promise<void> => {
    if (
        !agendaCliente.value.trim() ||
        !agendaFecha.value ||
        !agendaArtista.value.trim() ||
        !agendaHora.value ||
        !agendaEstilo.value.trim() ||
        !agendaZonaCuerpo.value.trim()
    ) {
        alert('Completa todos los campos del formulario para agendar la cita.');
        return;
    }

    if (!esAdmin.value && precioSimulado.value === null) {
        alert('Primero presiona "Simular Cita" para generar el precio automático.');
        return;
    }
    if (!esAdmin.value && !imagenComprobante.value) {
        errorCotizacion.value = 'Adjunta el comprobante del abono antes de enviar la solicitud.';
        return;
    }
    const configuracionPago = datosPago.value;
    if (!esAdmin.value && (!configuracionPago
        || !configuracionPago.account_holder.trim()
        || !configuracionPago.account_type.trim()
        || !configuracionPago.account_number.trim()
        || !configuracionPago.account_id_number.trim()
        || !configuracionPago.deposit_amount)) {
        errorCotizacion.value = 'El admin todavía no configuró todos los datos de la cuenta y el monto del abono.';
        return;
    }
    if (!esAdmin.value && !imagenDiseno.value && !disenoCatalogoSeleccionado.value) {
        errorCotizacion.value = 'Adjunta una referencia o selecciona un diseño del catálogo.';
        return;
    }

    try {
        const { assignedArtist } = await createAppointment({
            client_name: agendaCliente.value.trim(),
            artist: agendaArtista.value.trim(),
            style: agendaEstilo.value.trim(),
            appointment_date: agendaFecha.value,
            start_time: agendaHora.value,
            duration_minutes: duracionEstimada.value,
            price: agendaPrecio.value,
            body_area: agendaZonaCuerpo.value.trim(),
            size_cm: tamanoCm.value,
            notes: agendaObservaciones.value.trim() || null,
            tattoo_reference_path: null,
            catalog_design_id: disenoCatalogoSeleccionado.value?.id ?? null,
            catalog_image_url: disenoCatalogoSeleccionado.value?.image_url ?? null,
            payment_receipt_path: null,
            ai_analysis: analisisImagen.value,
            original_price: null,
            discount_code_id: null,
            status: esAdmin.value ? agendaEstado.value : 'pendiente'
        }, imagenDiseno.value, imagenComprobante.value);

        alert(esAdmin.value
            ? 'Cita agendada correctamente.'
            : `Solicitud enviada${assignedArtist ? ` y asignada a ${assignedArtist}` : ''}. La cita quedará pendiente hasta que el admin verifique el comprobante.`);
        agendaCliente.value = '';
        agendaFecha.value = new Date().toISOString().split('T')[0];
        agendaArtista.value = esAdmin.value ? '' : AUTO_ASSIGN_ARTIST;
        if (!esAdmin.value) {
            artista.value = AUTO_ASSIGN_ARTIST;
        }
        agendaHora.value = '';
        agendaEstilo.value = '';
        agendaZonaCuerpo.value = '';
        agendaObservaciones.value = '';
        imagenDiseno.value = null;
        imagenComprobante.value = null;
        nombreComprobante.value = '';
        disenoCatalogoId.value = '';
        if (imagenPreviewUrl.value) URL.revokeObjectURL(imagenPreviewUrl.value);
        imagenPreviewUrl.value = '';
        precioSimulado.value = null;
        analisisImagen.value = null;
        avisoCotizacion.value = '';
        agendaEstado.value = 'pendiente';
        agendaPrecioManual.value = 0;
        sessionStorage.removeItem(BORRADOR_CITA_KEY);
    } catch (error) {
        errorCotizacion.value = error instanceof Error ? error.message : 'No se pudo guardar la cita.';
    }
};
</script>

<template>
    <div class="dashboard-container">
        <div v-if="!esAdmin" class="grid-contenido">
            <section class="panel-formulario">
                <h2>Simulador de Cotización</h2>
                <form @submit.prevent="mostrarCotizacion">
                    <div class="campo">
                        <label>Cliente *</label>
                        <input type="text" v-model="cliente" @blur="cliente = capitalizarPrimeraLetra(cliente)" :disabled="analizandoImagen" required />
                    </div>
                    <div class="campo">
                        <label>Tatuador</label>
                        <select v-model="artista" :disabled="analizandoImagen || cargandoTatuadores || !tatuadores.length" required>
                            <option :value="AUTO_ASSIGN_ARTIST">Al azar</option>
                            <option v-for="tatuador in tatuadores" :key="tatuador.id" :value="tatuador.name">{{ tatuador.name }}</option>
                        </select>
                        <small v-if="errorTatuadores" class="nota-cotizacion">{{ errorTatuadores }}</small>
                        <small v-else-if="!cargandoTatuadores && !tatuadores.length" class="nota-cotizacion">No hay tatuadores disponibles.</small>
                    </div>
                    <div class="campo">
                        <label>Estilo</label>
                        <input type="text" v-model="estilo" @blur="estilo = capitalizarPrimeraLetra(estilo)" :disabled="analizandoImagen" />
                    </div>
                    <div class="campo">
                        <label>Fecha</label>
                        <input type="date" v-model="fecha" :disabled="analizandoImagen" />
                    </div>
                    <div class="campo">
                        <label>Tamaño (cm): {{ tamanoCm }}</label>
                        <input type="range" min="5" max="40" v-model.number="tamanoCm" :disabled="analizandoImagen" />
                    </div>
                    <div class="campo">
                        <label>Zona del Cuerpo</label>
                        <select v-model="zonaCuerpo" :disabled="analizandoImagen">
                            <option value="Brazo">Brazo</option>
                            <option value="Costillas">Costillas</option>
                            <option value="Cuello">Cuello</option>
                        </select>
                    </div>
                    <div class="campo">
                        <label for="diseno-catalogo">Diseño del catálogo (opcional)</label>
                        <select id="diseno-catalogo" v-model="disenoCatalogoId" :disabled="cargandoCatalogo || analizandoImagen" @change="seleccionarDisenoCatalogo">
                            <option value="">{{ cargandoCatalogo ? 'Cargando catálogo...' : 'Elige un diseño por su ID o sube una foto' }}</option>
                            <option v-for="diseno in disenosCatalogo" :key="diseno.id" :value="diseno.id">{{ diseno.id }} · {{ diseno.name }} · {{ diseno.style }}</option>
                        </select>
                        <label for="imagen-diseno">O sube una foto del diseño</label>
                        <input id="imagen-diseno" type="file" accept="image/jpeg,image/png,image/webp" :disabled="analizandoImagen" @change="seleccionarImagen" />
                        <small class="nota-cotizacion">Foto JPG, PNG o WebP · Máximo 5 MB. La IA la analiza al cotizar; se guarda con la solicitud de cita.</small>
                        <small v-if="analizandoImagen" class="nota-cotizacion">La IA está analizando estilo, color, líneas, sombras y complejidad...</small>
                        <small v-if="errorImagen" class="nota-cotizacion error-imagen">{{ errorImagen }}</small>
                        <div v-if="imagenPreviewUrl || disenoCatalogoSeleccionado" class="vista-previa-diseno">
                            <img :src="imagenPreviewUrl || disenoCatalogoSeleccionado?.image_url" alt="Vista previa del diseño de tatuaje" />
                            <small v-if="disenoCatalogoSeleccionado">ID de catálogo: {{ disenoCatalogoSeleccionado.id }}</small>
                        </div>
                    </div>
                    <div class="campo">
                        <label>Notas</label>
                        <textarea v-model="notas" @blur="notas = capitalizarPrimeraLetra(notas)" rows="3" placeholder="Detalles opcionales del diseño" :disabled="analizandoImagen"></textarea>
                    </div>
                    <div class="contenedor-costo">
                        <span>{{ avisoCotizacion ? 'Precio base estimado' : 'Precio estimado por IA' }}</span>
                        <strong v-if="precioSimulado !== null">${{ precioSimulado.toFixed(2) }}</strong>
                        <strong v-else>—</strong>
                    </div>
                    <p v-if="avisoCotizacion" class="nota-cotizacion">{{ avisoCotizacion }}</p>
                    <div v-if="analisisImagen" class="resumen-analisis">
                        <strong>{{ analisisImagen.style || estilo || 'Estilo por definir' }} · Complejidad {{ analisisImagen.complexity.replace('_', ' ') }}</strong>
                        <span>Colores: {{ analisisImagen.colors.join(', ') || 'monocromático' }}</span>
                        <span>Líneas: {{ analisisImagen.lineDetail }} · Sombreado: {{ analisisImagen.shading }}</span>
                        <span>Elementos: {{ analisisImagen.elements.join(', ') || 'sin identificar' }}</span>
                        <small>{{ analisisImagen.explanation }}</small>
                    </div>
                    <p class="nota-cotizacion">La IA analiza la imagen usando un servicio externo. La estimación considera tamaño, zona, detalle, colores y sombras; el tatuador confirma el precio final.</p>
                    <p class="nota-cotizacion">La imagen no se guarda durante la cotización. Se guardará con la solicitud de cita, junto al comprobante que adjuntes.</p>
                    <p class="nota-cotizacion nota-cotizacion-secundaria">{{ resumenCotizacion }}</p>
                    <p v-if="errorCotizacion" class="nota-cotizacion error-imagen">{{ errorCotizacion }}</p>
                    <button type="submit" :disabled="analizandoImagen">{{ analizandoImagen ? 'Analizando diseño...' : 'Generar cotización' }}</button>
                </form>
            </section>

            <section class="panel-listado panel-agendamiento">
                <h2>Agendar Cita</h2>
                <form @submit.prevent="agendarCita">
                    <div class="form-grid-agenda">
                        <div class="campo">
                            <label>Cliente</label>
                            <input type="text" v-model="agendaCliente" @blur="agendaCliente = capitalizarPrimeraLetra(agendaCliente)" placeholder="Nombre del cliente" required />
                        </div>
                        <div class="campo">
                            <label>Fecha</label>
                            <input type="date" v-model="agendaFecha" required />
                        </div>
                        <div class="campo">
                            <label>Tatuador</label>
                            <input
                                type="text"
                                :value="asignacionAutomatica ? 'Asignación automática según disponibilidad' : agendaArtista"
                                readonly
                                required
                            />
                        </div>
                        <div class="campo">
                            <label>Hora disponible</label>
                            <select v-model="agendaHora" :disabled="!agendaArtista || cargandoHorarios || !horariosDisponibles.length" required>
                                <option value="">{{ cargandoHorarios ? 'Consultando horarios...' : 'Selecciona una hora' }}</option>
                                <option v-for="hora in horariosDisponibles" :key="hora" :value="hora">{{ hora }}</option>
                            </select>
                            <small v-if="agendaArtista && !cargandoHorarios && !horariosDisponibles.length" class="nota-cotizacion">No hay horarios disponibles para esta fecha.</small>
                            <small v-else-if="agendaArtista" class="nota-cotizacion">
                                {{ asignacionAutomatica ? 'Se elegirá al tatuador menos ocupado que tenga libre el horario.' : 'Duración estimada: ' + duracionEstimada + ' minutos.' }}
                            </small>
                            <small v-if="disponibilidadError" class="nota-cotizacion">{{ disponibilidadError }}</small>
                        </div>
                        <div class="campo">
                            <label>Estilo</label>
                            <input type="text" v-model="agendaEstilo" placeholder="Estilo de tatuaje" readonly required />
                        </div>
                        <div class="campo">
                            <label>Zona del cuerpo</label>
                            <input type="text" v-model="agendaZonaCuerpo" placeholder="Ej: Brazo, espalda" readonly required />
                        </div>
                        <div class="campo">
                            <label>Precio</label>
                            <input type="number" :value="precioSimulado !== null ? agendaPrecioAutomatico : ''" placeholder="Se genera al simular" readonly />
                        </div>
                    </div>
                    <div class="campo">
                        <label>Observaciones</label>
                        <textarea v-model="agendaObservaciones" @blur="agendaObservaciones = capitalizarPrimeraLetra(agendaObservaciones)" rows="3" placeholder="Notas para el artista o el cliente"></textarea>
                    </div>
                    <div class="campo">
                        <label>Vincular datos del simulador</label>
                        <small class="nota-cotizacion">Tamaño: {{ tamanoCm }} cm · Zona: {{ zonaCuerpo }} · Diseño: {{ disenoCatalogoSeleccionado?.id || (imagenDiseno ? imagenDiseno.name : 'Sin referencia') }}</small>
                    </div>
                    <div class="campo datos-abono">
                        <label>Abono para reservar (transferencia Banco Pichincha)</label>
                        <p v-if="cargandoDatosPago" class="nota-cotizacion">Cargando datos de pago...</p>
                        <p v-else-if="errorDatosPago" class="nota-cotizacion error-imagen">{{ errorDatosPago }}</p>
                        <template v-else-if="datosPago">
                            <small class="nota-cotizacion">Titular: {{ datosPago.account_holder || 'Pendiente de configurar' }}</small>
                            <small class="nota-cotizacion">Banco: {{ datosPago.bank_name }} · Tipo: {{ datosPago.account_type || 'Pendiente de configurar' }}</small>
                            <small class="nota-cotizacion">Cuenta: {{ datosPago.account_number || 'Pendiente de configurar' }}</small>
                            <small v-if="datosPago.account_id_number" class="nota-cotizacion">Identificación: {{ datosPago.account_id_number }}</small>
                            <strong class="monto-abono">Abono solicitado: ${{ Number(datosPago.deposit_amount || 0).toFixed(2) }}</strong>
                        </template>
                        <label for="comprobante-abono">Comprobante de transferencia *</label>
                        <input id="comprobante-abono" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" @change="seleccionarComprobante" />
                        <small class="nota-cotizacion">JPG, PNG, WebP o PDF · Máximo 5 MB. El admin revisará la transferencia y confirmará la cita.</small>
                        <small v-if="nombreComprobante" class="nota-cotizacion">Archivo: {{ nombreComprobante }}</small>
                    </div>
                    <p v-if="errorCotizacion" class="nota-cotizacion error-imagen">{{ errorCotizacion }}</p>
                    <button type="submit">Guardar Cita</button>
                </form>
            </section>
        </div>

        <section v-else class="panel-listado panel-admin-lista">
            <h2>Crear nueva cita</h2>
            <form @submit.prevent="agendarCita">
                <div class="form-grid-agenda">
                    <div class="campo"><label>Cliente</label><input type="text" v-model="agendaCliente" @blur="agendaCliente = capitalizarPrimeraLetra(agendaCliente)" placeholder="Nombre del cliente" required /></div>
                    <div class="campo"><label>Fecha</label><input type="date" v-model="agendaFecha" required /></div>
                    <div class="campo">
                        <label>Tatuador</label>
                        <select v-model="agendaArtista" :disabled="cargandoTatuadores || !tatuadores.length" required>
                            <option value="">{{ cargandoTatuadores ? 'Cargando tatuadores...' : 'Selecciona un tatuador' }}</option>
                            <option v-for="tatuador in tatuadores" :key="tatuador.id" :value="tatuador.name">{{ tatuador.name }}</option>
                        </select>
                        <small v-if="errorTatuadores" class="nota-cotizacion">{{ errorTatuadores }}</small>
                        <small v-else-if="!cargandoTatuadores && !tatuadores.length" class="nota-cotizacion">No hay tatuadores disponibles.</small>
                    </div>
                    <div class="campo">
                        <label>Hora disponible</label>
                        <select v-model="agendaHora" :disabled="!agendaArtista || cargandoHorarios || !horariosDisponibles.length" required>
                            <option value="">{{ cargandoHorarios ? 'Consultando horarios...' : 'Selecciona una hora' }}</option>
                            <option v-for="hora in horariosDisponibles" :key="hora" :value="hora">{{ hora }}</option>
                        </select>
                        <small v-if="agendaArtista && !cargandoHorarios && !horariosDisponibles.length" class="nota-cotizacion">No hay horarios disponibles para esta fecha.</small>
                        <small v-else-if="agendaArtista" class="nota-cotizacion">Duración estimada: {{ duracionEstimada }} minutos.</small>
                        <small v-if="disponibilidadError" class="nota-cotizacion">{{ disponibilidadError }}</small>
                    </div>
                    <div class="campo"><label>Estilo</label><input type="text" v-model="agendaEstilo" @blur="agendaEstilo = capitalizarPrimeraLetra(agendaEstilo)" placeholder="Estilo de tatuaje" required /></div>
                    <div class="campo"><label>Zona del cuerpo</label><input type="text" v-model="agendaZonaCuerpo" @blur="agendaZonaCuerpo = capitalizarPrimeraLetra(agendaZonaCuerpo)" placeholder="Ej: Brazo, espalda" required /></div>
                    <div class="campo"><label>Tamaño (cm): {{ tamanoCm }}</label><input type="range" min="5" max="40" v-model.number="tamanoCm" /></div>
                    <div class="campo"><label>Precio</label><input type="number" min="0" v-model.number="agendaPrecioManual" required /></div>
                </div>
                <div class="campo"><label>Observaciones</label><textarea v-model="agendaObservaciones" @blur="agendaObservaciones = capitalizarPrimeraLetra(agendaObservaciones)" rows="3" placeholder="Notas para el artista o el cliente"></textarea></div>
                <button type="submit">Añadir cita</button>
            </form>
        </section>
    </div>
</template>
<style scoped>
@import "../styles/dashboard.css";
</style>