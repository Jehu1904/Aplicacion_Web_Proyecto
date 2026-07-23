import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.tsx'

function hydrateSessionFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const email = params.get('email');
  const role = params.get('role');
  const started = params.get('started');

  if (token && email) {
    localStorage.setItem('token', token);
    localStorage.setItem('user_email', email);
    localStorage.setItem('user_role', role === 'admin' ? 'admin' : 'cliente');
    localStorage.setItem('session_start', started || new Date().toISOString());

    const clean = `${window.location.origin}${window.location.pathname}${window.location.hash}`;
    window.history.replaceState({}, document.title, clean);
  }
}

hydrateSessionFromQuery();

// Verificar autenticación antes de cargar
const token = localStorage.getItem('token');
if (!token) {
  // Si no hay token, redirigir a la contenedora
  window.location.href = '/';
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}