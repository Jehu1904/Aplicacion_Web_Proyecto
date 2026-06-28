/**
 * @file calculos.ts
 * @description Módulo de operaciones matemáticas puras para el cálculo de presupuestos de tatuajes.
 */

/**
 * Diccionario estricto de multiplicadores según la complejidad y sensibilidad de la zona del cuerpo.
 * Las zonas de mayor dolor o dificultad técnica incrementan el valor base.
 */
export const multiplicadoresZona: Record<string, number> = {
    brazo: 1.0,
    antebrazo: 1.1,
    pierna: 1.2,
    costillas: 1.5 // Zona altamente compleja por el dolor y movimiento respiratorio
};

/**
 * Calcula el presupuesto estimado de una pieza artística lineal.
 * @param {number} centimetros - La longitud en centímetros solicitada por el cliente.
 * @param {string} zona - La región del cuerpo seleccionada en la interfaz.
 * @returns {number} El costo monetario final estimado de la sesión.
 */
export function calcularPresupuesto(centimetros: number, zona: string): number {
    // Tarifa base por cada centímetro lineal de tatuaje en dólares americanos
    const TARIFA_BASE_CM: number = 7.50;
    
    // Obtener el multiplicador correspondiente mapeando la cadena en minúsculas
    const multiplicador: number = multiplicadoresZona[zona.toLowerCase()] || 1.0;
    
    // Operación matemática pura: Tamaño x Precio Base x Factor de Zona
    return centimetros * TARIFA_BASE_CM * multiplicador;
}