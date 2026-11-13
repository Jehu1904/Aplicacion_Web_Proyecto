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

const datosIniciales: CitaTattoo[] = [];

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