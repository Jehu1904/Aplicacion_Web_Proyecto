import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.tsx'

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