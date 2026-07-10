/**
 * @file mockData.ts
 * @description Almacén de estado global ajustado al contrato de dominio obligatorio.
 * Cumple con el criterio de Dominio Compartido del Taller S12_DiaB.
 */
import { ref, Ref } from 'vue';

// Definición estricta del contrato de dominio obligatorio (Criterio: campos iguales en los 3 módulos)
export interface CitaTattoo {
    id: string;
    cliente: string;
    artista: string;
    estilo: string;
    fecha: string;
    precio: number;
    estado: 'pendiente' | 'confirmada' | 'completada';
    emailCliente?: string;
    tamanoCm?: number;
    zonaCuerpo?: string;
    notasDiseno?: string;
}

// Datos iniciales normalizados según la ficha
const datosIniciales: CitaTattoo[] = [
    {
        id: "1", 
        cliente: "Jehu Villamar", 
        artista: "Gerson Barber",
        estilo: "Blackwork", 
        fecha: "2026-07-03", 
        precio: 112.50, 
        estado: "confirmada",
        emailCliente: "jehu@mail.com", 
        tamanoCm: 15, 
        zonaCuerpo: "Brazo"
    },
    {
        id: "2", 
        cliente: "Jordan Solórzano", 
        artista: "Alex Tattoo",
        estilo: "Realismo", 
        fecha: "2026-07-04", 
        precio: 225.00, 
        estado: "pendiente",
        emailCliente: "jordan@mail.com", 
        tamanoCm: 20, 
        zonaCuerpo: "Costillas"
    },
    {
        id: "3", 
        cliente: "Jesús Macías", 
        artista: "Gerson Barber",
        estilo: "Lettering", 
        fecha: "2026-07-05", 
        precio: 66.00, 
        estado: "completada",
        emailCliente: "jesus@mail.com", 
        tamanoCm: 8, 
        zonaCuerpo: "Antebrazo"
    }
];

const listaGlobalCitas = ref<CitaTattoo[]>([...datosIniciales]);

/**
 * Composable global para gestión reactiva (Criterio 5: Estado Global).
 */
export function useCitasGlobales() {
    const citas: Ref<CitaTattoo[]> = listaGlobalCitas;

    const agregarCitaGlobal = (nuevaCita: Omit<CitaTattoo, 'id'>): void => {
        const idAutoincremental = String(citas.value.length + 1);
        citas.value.push({
            id: idAutoincremental,
            ...nuevaCita
        });
    };

    return {
        citas,
        agregarCitaGlobal
    };
}