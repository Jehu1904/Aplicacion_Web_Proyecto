<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getProfile, saveProfile, uploadAvatar } from '../services/clientPortal';

const email = ref(localStorage.getItem('user_email') ?? '');
const fullName = ref('');
const phone = ref('');
const avatarUrl = ref('');
const avatarScale = ref(1);
const avatarPositionX = ref(50);
const avatarPositionY = ref(50);
const loading = ref(true);
const saving = ref(false);
const message = ref('');
const error = ref('');
const role = localStorage.getItem('user_role') === 'admin' ? 'Administrador' : 'Cliente';

function capitalizarPrimeraLetra(valor: string): string {
  const texto = valor.trim();
  return texto ? texto.charAt(0).toLocaleUpperCase('es-EC') + texto.slice(1) : '';
}

onMounted(async () => {
  try {
    const profile = await getProfile();
    email.value = profile.email;
    fullName.value = profile.full_name ?? '';
    phone.value = profile.phone ?? '';
    avatarUrl.value = profile.avatar_url ?? '';
    avatarScale.value = Number(profile.avatar_scale) || 1;
    avatarPositionX.value = Number(profile.avatar_position_x) || 50;
    avatarPositionY.value = Number(profile.avatar_position_y) || 50;
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'No se pudo cargar el perfil.';
  } finally {
    loading.value = false;
  }
});

async function changePhoto(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  error.value = '';
  try {
    avatarUrl.value = await uploadAvatar(file);
    avatarScale.value = 1;
    avatarPositionX.value = 50;
    avatarPositionY.value = 50;
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : '';
    error.value = detail.toLowerCase().includes('failed to fetch')
      ? 'No se pudo conectar con el almacenamiento de fotos. Intenta de nuevo en unos segundos.'
      : detail || 'No se pudo subir la foto.';
  }
}

async function save() {
  saving.value = true;
  error.value = '';
  message.value = '';
  try {
    await saveProfile({
      full_name: fullName.value.trim() || null,
      phone: phone.value.trim() || null,
      avatar_url: avatarUrl.value || null,
      avatar_scale: avatarScale.value,
      avatar_position_x: avatarPositionX.value,
      avatar_position_y: avatarPositionY.value
    });
    message.value = 'Perfil actualizado correctamente.';
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'No se pudo guardar el perfil.';
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <main class="portal-page">
    <header class="portal-header">
      <div>
        <p class="eyebrow">{{ role }}</p>
        <h1>Mi perfil</h1>
        <p>Administra los datos que usas para tus reservas y comunicaciones.</p>
      </div>
    </header>

    <section v-if="loading" class="panel">Cargando perfil...</section>
    <form v-else class="panel profile-layout" @submit.prevent="save">
      <div class="avatar-area">
        <div v-if="avatarUrl" class="avatar avatar-photo"><img :src="avatarUrl" alt="Foto de perfil" :style="{ transform: `scale(${avatarScale})`, transformOrigin: `${avatarPositionX}% ${avatarPositionY}%` }" /></div>
        <div v-else class="avatar avatar-fallback">{{ (fullName || email || 'U').charAt(0).toUpperCase() }}</div>
        <label class="photo-button">Cambiar foto<input type="file" accept="image/*" @change="changePhoto" /></label>
        <small>JPG, PNG o WebP. Máximo 2 MB.</small>
        <div v-if="avatarUrl" class="photo-controls">
          <label>Zoom <input v-model.number="avatarScale" type="range" min="1" max="2.5" step="0.05" /></label>
          <label>Horizontal <input v-model.number="avatarPositionX" type="range" min="0" max="100" /></label>
          <label>Vertical <input v-model.number="avatarPositionY" type="range" min="0" max="100" /></label>
        </div>
      </div>
      <div class="fields">
        <label>Correo electrónico<input :value="email" type="email" disabled /></label>
        <label>Nombre completo<input v-model="fullName" @blur="fullName = capitalizarPrimeraLetra(fullName)" type="text" placeholder="Tu nombre" /></label>
        <label>Teléfono<input v-model="phone" type="tel" placeholder="Ej. 099 123 4567" /></label>
        <p v-if="error" class="feedback error">{{ error }}</p>
        <p v-if="message" class="feedback success">{{ message }}</p>
        <button type="submit" :disabled="saving">{{ saving ? 'Guardando...' : 'Guardar cambios' }}</button>
      </div>
    </form>
  </main>
</template>

<style scoped>
.portal-page { min-height: 100vh; padding: 2rem; background: #0f0f0f; color: #f3f4f6; font-family: Raleway, Arial, sans-serif; }.portal-header { max-width: 960px; margin: 0 auto 1.5rem; display: flex; justify-content: space-between; align-items: start; gap: 1rem; }.portal-header h1 { margin: .2rem 0; font-family: 'Playfair Display', serif; }.portal-header p { margin: 0; color: #9ca3af; }.eyebrow { color: #fbbf24 !important; text-transform: uppercase; font-size: .75rem; font-weight: 700; letter-spacing: .08em; }.back-link { color: #fbbf24; font-weight: 700; text-decoration: none; }.panel { max-width: 960px; margin: 0 auto; background: #1a1a1a; border: 1px solid rgba(255,255,255,.12); border-radius: 8px; padding: 1.5rem; }.profile-layout { display: grid; grid-template-columns: 220px 1fr; gap: 2rem; }.avatar-area { display: flex; align-items: center; flex-direction: column; gap: .75rem; text-align: center; color: #9ca3af; }.avatar { width: 128px; height: 128px; border-radius: 50%; background: #27272a; }.avatar-photo { overflow: hidden; }.avatar-photo img { width: 100%; height: 100%; object-fit: cover; transform-origin: center; }.avatar-fallback { display: grid; place-items: center; font-size: 3rem; color: #111827; background: #f59e0b; }.photo-button, button { background: #f59e0b; color: #111827; border: 0; border-radius: 6px; padding: .7rem 1rem; cursor: pointer; font-weight: 700; }.photo-button input { display: none; }.photo-controls { width: 100%; display: grid; gap: .4rem; text-align: left; font-size: .75rem; font-weight: 700; }.photo-controls label { display: grid; grid-template-columns: 74px 1fr; align-items: center; gap: .35rem; }.photo-controls input { accent-color: #f59e0b; }.fields { display: grid; gap: 1rem; }.fields label { display: grid; gap: .4rem; font-weight: 700; }.fields input { padding: .75rem; color: #f3f4f6; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.15); border-radius: 6px; font: inherit; }.fields input:disabled { background: rgba(255,255,255,.08); color: #9ca3af; }.fields button { justify-self: start; }.feedback { margin: 0; padding: .75rem; border-radius: 6px; }.error { color: #fca5a5; background: rgba(239,68,68,.12); }.success { color: #86efac; background: rgba(34,197,94,.12); } @media (max-width: 620px) { .portal-page { padding: 1rem; }.portal-header, .profile-layout { grid-template-columns: 1fr; flex-direction: column; }.back-link { margin-top: .5rem; } }
</style>