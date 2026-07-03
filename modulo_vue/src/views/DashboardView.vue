<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCitasGlobales } from '../models/mockData';

const { citas, agregarCitaGlobal } = useCitasGlobales();

// Campos del contrato obligatorio
const cliente = ref<string>('');
const artista = ref<string>('Gerson Barber');
const estilo = ref<string>('Blackwork');
const fecha = ref<string>(new Date().toISOString().split('T')[0]);
const precio = computed(() => {
    return 50 + (tamanoCm.value * 5);
});
const estado = 'pendiente';

// Campos funcionales mantenidos
const emailCliente = ref<string>('');
const tamanoCm = ref<number>(10);
const zonaCuerpo = ref<string>('Brazo');
const notas = ref<string>('');

const registrarCita = (): void => {
    if (cliente.value.trim() === '') return;

    agregarCitaGlobal({
        cliente: cliente.value,
        artista: artista.value,
        estilo: estilo.value,
        fecha: fecha.value,
        precio: precio.value,
        estado: estado,
        emailCliente: emailCliente.value,
        tamanoCm: tamanoCm.value,
        zonaCuerpo: zonaCuerpo.value,
        notasDiseno: notas.value
    });

    // Limpieza de campos
    cliente.value = '';
    emailCliente.value = '';
    notas.value = '';
};
</script>

<template>
    <div class="dashboard-container">
        <!-- navbar se mantiene igual -->
        <div class="grid-contenido">
            <section class="panel-formulario">
                <h2>Simulador de Cotización</h2>
                <form @submit.prevent="registrarCita">
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
                        <label>Precio Estimado</label>
                        <input type="number" v-model.number="precio" />
                    </div>
                    <button type="submit">Agendar Solicitud</button>
                </form>
            </section>

            <section class="panel-listado">
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
    </div>
</template>
<style scoped>
@import "../styles/dashboard.css";
</style>