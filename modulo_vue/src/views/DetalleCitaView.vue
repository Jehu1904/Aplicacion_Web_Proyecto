<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCitasGlobales, CitaTattoo } from '../models/mockData';

// Inicialización de herramientas de enrutamiento nativas de vue-router
const route = useRoute();
const router = useRouter();

// Extracción del estado global compartido (Criterio 5)
const { citas } = useCitasGlobales();

// Obtención del parámetro "id" desde la URL (Criterio 7)
const idCitaQuery = String(route.params.id);

/**
 * Propiedad computada (Computed) que busca de forma reactiva la cita coincidente.
 * @returns {CitaTattoo | undefined} La cita encontrada o undefined si no existe.
 */
const cita = computed((): CitaTattoo | undefined => {
    return citas.value.find((c: CitaTattoo) => c.id === idCitaQuery);
});

/**
 * Método para navegar programáticamente de vuelta al Dashboard (Criterio 6).
 */
const volverAlDashboard = (): void => {
    router.push('/');
};
</script>

<template>
    <div class="contenedor-detalle">
        <header class="encabezado-ficha">
            <button class="boton-regresar" @click="volverAlDashboard">
                ← Volver al Panel
            </button>
            <h2>Ficha Técnica del Cliente</h2>
        </header>

        <!-- Renderizado condicional v-if validando la existencia de la cita -->
        <main v-if="cita" class="tarjeta-ficha">
            <section class="bloque-informacion">
                <h3>Información General</h3>
                <p><strong>Código de Registro:</strong> #{{ cita.id }}</p>
                <p><strong>Cliente:</strong> {{ cita.cliente }}</p>
                <p><strong>Artista:</strong> {{ cita.artista }}</p>
            </section>

            <section class="bloque-informacion">
                <h3>Especificaciones del Tatuaje</h3>
                <p><strong>Estilo:</strong> {{ cita.estilo }}</p>
                <p><strong>Fecha:</strong> {{ cita.fecha }}</p>
                <p><strong>Precio:</strong> ${{ cita.precio.toFixed(2) }}</p>
                <p><strong>Estado Actual:</strong>
                    <span :class="['etiqueta-estado', 'estado-' + cita.estado]">
                        {{ cita.estado.toUpperCase() }}
                    </span>
                </p>
            </section>

            <!-- Bloque opcional de notas diseñado en el contrato -->
            <section class="bloque-informacion" v-if="cita.notasDiseno">
                <h3>Notas e Ideas del Diseño</h3>
                <p class="caja-notas">{{ cita.notasDiseno }}</p>
            </section>
        </main>

        <!-- Fallback para rutas inválidas -->
        <div v-else class="alerta-error">
            <p>Error: No se ha localizado ninguna ficha técnica asociada al identificador ingresado.</p>
        </div>
    </div>
</template>

<style scoped>
@import "../styles/detalle.css";
</style>