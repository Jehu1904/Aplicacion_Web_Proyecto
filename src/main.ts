/**
 * @file main.ts
 * @description Orquestador central de la aplicación. Aplica delegación de eventos y mutación estricta del DOM.
 */

import { calcularPresupuesto } from "./lib/calculos";
import { validarDimension, validarEmail } from "./lib/validadores";
import { guardarInteresado, ClienteInteresado } from "./lib/persistencia";

// Asegurar que el árbol del DOM esté completamente estructurado en el navegador
document.addEventListener("DOMContentLoaded", (): void => {

    // Captura del contenedor global que agrupa las secciones de todo el equipo
    const contenedorApp = document.querySelector<HTMLElement>("#contenedor-aplicacion");

    if (contenedorApp !== null) {
        
        // --- CENTRALIZACIÓN MEDIANTE DELEGACIÓN DE EVENTOS (CLICK) ---
        contenedorApp.addEventListener("click", (evento: MouseEvent): void => {
            const objetivo = evento.target as HTMLElement;

            // [MÓDULO 1] Acción del botón: Calcular Presupuesto (Jehu Villamar)
            if (objetivo.id === "btn-calcular") {
                const inputCm = document.querySelector<HTMLInputElement>("#input-cm");
                const selectZona = document.querySelector<HTMLSelectElement>("#select-zona");
                const txtResultado = document.querySelector<HTMLElement>("#resultado-costo");
                const errorCm = document.querySelector<HTMLElement>("#error-cm");

                if (inputCm !== null && selectZona !== null && txtResultado !== null && errorCm !== null) {
                    const cm: number = parseFloat(inputCm.value);
                    const zona: string = selectZona.value;

                    // Limpiar advertencias previas
                    errorCm.textContent = "";

                    if (!zona) {
                        txtResultado.textContent = "Por favor, elija una zona del cuerpo.";
                        return;
                    }

                    if (validarDimension(cm)) {
                        const costoFinal: number = calcularPresupuesto(cm, zona);
                        txtResultado.textContent = `Total Estimado: $${costoFinal.toFixed(2)}`;
                    } else {
                        errorCm.textContent = "El tamaño debe estar comprendido entre 2 y 45 cm.";
                        txtResultado.textContent = "Total Estimado: $0.00";
                    }
                }
            }

            // [MÓDULO 2] Acción de Acordeón: Desplegar/Ocultar respuestas de FAQ (Jordan Solórzano)
            if (objetivo.classList.contains("faq-pregunta")) {
                const panelRespuesta = objetivo.nextElementSibling as HTMLElement | null;
                
                if (panelRespuesta !== null) {
                    const estaOculto: boolean = panelRespuesta.style.display === "none" || panelRespuesta.style.display === "";
                    panelRespuesta.style.display = estaOculto ? "block" : "none";
                }
            }

            // [MÓDULO 3] Acción del botón: Unirse a la Lista de Citas (Jesús Macías)
            if (objetivo.id === "btn-registrar") {
                const inputNombre = document.querySelector<HTMLInputElement>("#input-nombre");
                const inputEmail = document.querySelector<HTMLInputElement>("#input-email");
                const errorEmail = document.querySelector<HTMLElement>("#error-email");
                const msgExito = document.querySelector<HTMLElement>("#msg-registro-exito");

                if (inputNombre !== null && inputEmail !== null && errorEmail !== null && msgExito !== null) {
                    const nombre: string = inputNombre.value.trim();
                    const email: string = inputEmail.value.trim();

                    // Limpiar estados visuales de error
                    errorEmail.textContent = "";
                    msgExito.textContent = "";

                    if (nombre === "" || email === "") {
                        msgExito.textContent = "Por favor, complete todos los campos requeridos.";
                        return;
                    }

                    if (validarEmail(email)) {
                        // Crear el registro estructurado bajo la interfaz de TypeScript
                        const nuevoInteresado: ClienteInteresado = {
                            nombre: nombre,
                            email: email,
                            fechaRegistro: new Date().toISOString()
                        };

                        // Persistir los datos de manera permanente en LocalStorage vía JSON
                        guardarInteresado(nuevoInteresado);

                        // Retroalimentación positiva en pantalla e inicialización de inputs
                        msgExito.textContent = `¡Registro exitoso! Gracias por unirte, ${nombre}.`;
                        inputNombre.value = "";
                        inputEmail.value = "";
                    } else {
                        errorEmail.textContent = "El formato de correo electrónico no es válido.";
                    }
                }
            }
        });
    }
});