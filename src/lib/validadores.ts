/**
 * @file validadores.ts
 * @description Módulo encargado de la validación sintáctica y de rangos lógicos para los inputs del usuario.
 */

/**
 * Evalúa si el tamaño solicitado es realista para una cotización automatizada de una sola sesión.
 * @param {number} cm - Longitud ingresada por el usuario.
 * @returns {boolean} Retorna verdadero si se encuentra en el rango seguro de 2 a 45 centímetros.
 */
export function validarDimension(cm: number): boolean {
    return cm >= 2 && cm <= 45;
}

/**
 * Comprueba mediante una expresión regular si el formato de una cadena corresponde a un email válido.
 * @param {string} correo - El texto capturado desde el campo de entrada de correo.
 * @returns {boolean} Retorna verdadero si cumple con el patrón estándar "usuario@dominio.com".
 */
export function validarEmail(correo: string): boolean {
    const expresionRegular: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return expresionRegular.test(correo);
}