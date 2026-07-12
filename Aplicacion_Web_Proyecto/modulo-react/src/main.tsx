import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css' // Único import correcto apuntando a la subcarpeta styles
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)