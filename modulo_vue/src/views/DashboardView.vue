<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCitasGlobales } from '../models/mockData';

const { citas, agregarCitaGlobal } = useCitasGlobales();
const esAdmin = computed(() => localStorage.getItem('user_role') === 'admin');

// Campos del simulador de cotización
const cliente = ref<string>('');
const artista = ref<string>('');
const estilo = ref<string>('');
const fecha = ref<string>(new Date().toISOString().split('T')[0]);
const tamanoCm = ref<number>(10);
const zonaCuerpo = ref<string>('Brazo');
const notas = ref<string>('');
const precioSimulado = ref<number | null>(null);

// Campos del formulario de agendamiento lateral
const agendaCliente = ref<string>('');
const agendaFecha = ref<string>(new Date().toISOString().split('T')[0]);
const agendaArtista = ref<string>('');
const agendaEstilo = ref<string>('');
const agendaZonaCuerpo = ref<string>('');
const agendaObservaciones = ref<string>('');

const precioEstimado = computed(() => {
    const multiplicadorZona = {
        Brazo: 1,
        Costillas: 1.2,
        Cuello: 1.3
    } as const;

    const base = 50 + (tamanoCm.value * 5);
    return base * (multiplicadorZona[zonaCuerpo.value as keyof typeof multiplicadorZona] ?? 1);
});

const resumenCotizacion = computed(() => [
    cliente.value ? `Cliente: ${cliente.value}` : 'Cliente sin definir',
    `Artista: ${artista.value}`,
    `Estilo: ${estilo.value}`,
    `Fecha: ${fecha.value}`,
    `Zona: ${zonaCuerpo.value}`
].join(' · '));

const agendaPrecioAutomatico = computed(() => {
    return Number((precioSimulado.value ?? 0).toFixed(2));
});

const mostrarCotizacion = (): void => {
    if (cliente.value.trim() === '') return;

    precioSimulado.value = precioEstimado.value;

    // Sincroniza el formulario de agendamiento con los datos simulados.
    agendaCliente.value = cliente.value.trim();
    agendaFecha.value = fecha.value;
    agendaArtista.value = artista.value.trim();
    agendaEstilo.value = estilo.value.trim();
    agendaZonaCuerpo.value = zonaCuerpo.value;
    agendaObservaciones.value = notas.value.trim();

    alert(`Cotización estimada para ${cliente.value}: $${precioSimulado.value.toFixed(2)}. No se guardó ninguna cita.`);
};

const agendarCita = (): void => {
    if (
        !agendaCliente.value.trim() ||
        !agendaFecha.value ||
        !agendaArtista.value.trim() ||
        !agendaEstilo.value.trim() ||
        !agendaZonaCuerpo.value.trim()
    ) {
        alert('Completa todos los campos del formulario para agendar la cita.');
        return;
    }

    if (precioSimulado.value === null) {
        alert('Primero presiona "Simular Cita" para generar el precio automático.');
        return;
    }

    agregarCitaGlobal({
        cliente: agendaCliente.value.trim(),
        artista: agendaArtista.value.trim(),
        estilo: agendaEstilo.value.trim(),
        fecha: agendaFecha.value,
        precio: agendaPrecioAutomatico.value,
        estado: 'pendiente',
        tamanoCm: tamanoCm.value,
        zonaCuerpo: agendaZonaCuerpo.value.trim(),
        notasDiseno: agendaObservaciones.value.trim() || undefined
    });

    alert(`Cita agendada para ${agendaCliente.value}. Ya se guardó y aparece en el panel de administrador.`);

    agendaCliente.value = '';
    agendaFecha.value = new Date().toISOString().split('T')[0];
    agendaArtista.value = '';
    agendaEstilo.value = '';
    agendaZonaCuerpo.value = '';
    agendaObservaciones.value = '';
};
</script>

<template>
    <div class="dashboard-container">
        <div class="grid-contenido">
            <section class="panel-formulario">
                <h2>Simulador de Cotización</h2>
                <form @submit.prevent="mostrarCotizacion">
                    <div class="campo">
                        <label>Cliente *</label>
                        <input type="text" v-model="cliente" required />
                    </div>
                    <div class="campo">
                        <label>Artista</label>
                        <input type="text" v-model="artista" />
                    </div>
                    <div class="campo">
                        <label>Estilo</label>
                        <input type="text" v-model="estilo" />
                    </div>
                    <div class="campo">
                        <label>Fecha</label>
                        <input type="date" v-model="fecha" />
                    </div>
                    <div class="campo">
                        <label>Tamaño (cm): {{ tamanoCm }}</label>
                        <input type="range" min="5" max="40" v-model.number="tamanoCm" />
                    </div>
                    <div class="campo">
                        <label>Zona del Cuerpo</label>
                        <select v-model="zonaCuerpo">
                            <option value="Brazo">Brazo</option>
                            <option value="Costillas">Costillas</option>
                            <option value="Cuello">Cuello</option>
                        </select>
                    </div>
                    <div class="campo">
                        <label>Notas</label>
                        <textarea v-model="notas" rows="3" placeholder="Detalles opcionales del diseño"></textarea>
                    </div>
                    <div class="contenedor-costo">
                        <span>Precio Estimado</span>
                        <strong v-if="precioSimulado !== null">${{ precioSimulado.toFixed(2) }}</strong>
                        <strong v-else>—</strong>
                    </div>
                    <p class="nota-cotizacion">Solo es una simulación de precio. No agenda citas ni guarda solicitudes.</p>
                    <p class="nota-cotizacion nota-cotizacion-secundaria">{{ resumenCotizacion }}</p>
                    <button type="submit">Simular Cita</button>
                </form>
            </section>

            <section class="panel-listado panel-agendamiento">
                <h2>Agendar Cita</h2>
                <form @submit.prevent="agendarCita">
                    <div class="form-grid-agenda">
                        <div class="campo">
                            <label>Cliente</label>
                            <input type="text" v-model="agendaCliente" placeholder="Nombre del cliente" required />
                        </div>
                        <div class="campo">
                            <label>Fecha</label>
                            <input type="date" v-model="agendaFecha" required />
                        </div>
                        <div class="campo">
                            <label>Tatuador</label>
                            <input type="text" v-model="agendaArtista" placeholder="Nombre del tatuador" required />
                        </div>
                        <div class="campo">
                            <label>Estilo</label>
                            <input type="text" v-model="agendaEstilo" placeholder="Estilo de tatuaje" required />
                        </div>
                        <div class="campo">
                            <label>Zona del cuerpo</label>
                            <input type="text" v-model="agendaZonaCuerpo" placeholder="Ej: Brazo, espalda" required />
                        </div>
                        <div class="campo">
                            <label>Precio</label>
                            <input type="number" :value="precioSimulado !== null ? agendaPrecioAutomatico : ''" placeholder="Se genera al simular" readonly />
                        </div>
                    </div>
                    <div class="campo">
                        <label>Observaciones</label>
                        <textarea v-model="agendaObservaciones" rows="3" placeholder="Notas para el artista o el cliente"></textarea>
                    </div>
                    <div class="campo">
                        <label>Vincular datos del simulador</label>
                        <small class="nota-cotizacion">Tamaño: {{ tamanoCm }} cm · Zona simulada: {{ zonaCuerpo }} · Notas simulador: {{ notas || 'Sin notas' }}</small>
                    </div>
                    <button type="submit">Guardar Cita</button>
                </form>
            </section>
        </div>

        <section v-if="esAdmin" class="panel-listado panel-admin-lista">
            <h2>Lista de Espera</h2>
            <div v-for="item in citas" :key="item.id" class="tarjeta-cita-item">
                <h3>{{ item.cliente }}</h3>
                <p>{{ item.estilo }} | {{ item.artista }}</p>
                <router-link :to="'/detalle/' + item.id" class="btn-detalle-enlace">
                    Inspeccionar →
                </router-link>
            </div>
        </section>
    </div>
</template>
<style scoped>
@import "../styles/dashboard.css";
</style>