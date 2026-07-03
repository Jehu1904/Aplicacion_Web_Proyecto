<!-- 
  @file App.vue
  @description Componente contenedor raíz de la aplicación.
-->
<script setup lang="ts">
// El contenedor se mantiene libre de lógica pesada
</script>

<template>
    <div id="contenedor-global-app">
        <!-- Espejo dinámico donde el enrutador insertará e intercambiará las vistas según la URL -->
        <router-view />
    </div>
</template>

<style>
/* Vinculación explícita del archivo de diseño global externo */
@import "./styles/app.css";
</style>