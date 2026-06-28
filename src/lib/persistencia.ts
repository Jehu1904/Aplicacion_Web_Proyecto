/**
 * @file persistencia.ts
 * @description Módulo destinado al almacenamiento e interacción persistente de datos locales en formato JSON.
 */

/**
 * Estructura de tipado estricta para definir el objeto que representa a un cliente interesado.
 */
export interface ClienteInteresado {
    nombre: string;
    email: string;
    fechaRegistro: string;
}

/**
 * Guarda un nuevo cliente en el arreglo de la lista de espera dentro de LocalStorage persistido como JSON string.
 * @param {ClienteInteresado} nuevoCliente - Objeto tipado con los datos validados del interesado.
 * @returns {void}
 */
export function guardarInteresado(nuevoCliente: ClienteInteresado): void {
    const CLAVE_STORAGE = "lista_espera_tattoo";
    
    // Obtener la lista existente de LocalStorage
    const datosLocales: string | null = localStorage.getItem(CLAVE_STORAGE);
    let listaClientes: ClienteInteresado[] = [];
    
    if (datosLocales !== null) {
        // Transformar la cadena JSON de vuelta a un arreglo de objetos tipados
        listaClientes = JSON.parse(datosLocales) as ClienteInteresado[];
    }
    
    // Insertar el nuevo registro al listado existente
    listaClientes.push(nuevoCliente);
    
    // Serializar el arreglo actualizado a una cadena JSON y almacenarlo de forma persistente
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(listaClientes));
}