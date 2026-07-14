/**
 * @file main.ts
 * @description Punto de entrada de la contenedora Vite vanilla-ts
 * 
 * La lógica principal reside en index.html como scripts inline
 * Este archivo sirve como punto de entrada de Vite
 */

// Estilos globales
import './style/style.css';

// Verificación de compatibilidad del navegador
if (!localStorage) {
    console.error('LocalStorage no está disponible. El sistema requiere localStorage.');
    alert('Tu navegador no soporta localStorage. Por favor, usa un navegador moderno.');
}

console.log('🎨 INK & IRON - Sistema integrado cargado');
console.log('📦 Módulos disponibles: React (Catálogo), Vue (Reservas), Angular (Admin)');

