import { Injectable, signal } from '@angular/core';
import { CitaTatuaje } from '../models/cita.model';

const STORAGE_KEY = 'moduloAngularCitas';

@Injectable({
  providedIn: 'root'
})
export class CitasService {
  private defaultCitas: CitaTatuaje[] = [
    {
      id: '1',
      cliente: 'Jandry Sanchez',
      fecha: '2026-07-05',
      estilo: 'Blackwork',
      tatuador: 'Jehu Villamar',
      zonaCuerpo: 'Antebrazo',
      estado: 'Confirmada',
      precio: 180,
      observaciones: 'Requiere diseño geométrico de referencia.'
    },
    {
      id: '2',
      cliente: 'Jordan Solorzano',
      fecha: '2026-07-06',
      estilo: 'Tradicional',
      tatuador: 'Jesus Macias',
      zonaCuerpo: 'Pecho',
      estado: 'Pendiente',
      precio: 140,
      observaciones: 'Pendiente de confirmar abono.'
    },
    {
      id: '3',
      cliente: 'Carlos Mendoza',
      fecha: '2026-07-08',
      estilo: 'Realismo',
      tatuador: 'Jehu Villamar',
      zonaCuerpo: 'Espalda',
      estado: 'En diseño',
      precio: 260,
      observaciones: 'Sesión en dos jornadas.'
    },
    {
      id: '4',
      cliente: 'Valeria Paredes',
      fecha: '2026-07-09',
      estilo: 'Minimalista',
      tatuador: 'Jesus Macias',
      zonaCuerpo: 'Muneca',
      estado: 'Pendiente',
      precio: 95,
      observaciones: 'Primera cita del cliente.'
    },
    {
      id: '5',
      cliente: 'Andres Zambrano',
      fecha: '2026-07-10',
      estilo: 'Tribal',
      tatuador: 'Jehu Villamar',
      zonaCuerpo: 'Hombro',
      estado: 'Confirmada',
      precio: 185,
      observaciones: 'Diseno aprobado por WhatsApp.'
    },
    {
      id: '6',
      cliente: 'Melissa Alcivar',
      fecha: '2026-07-11',
      estilo: 'Blackwork',
      tatuador: 'Jordan Solorzano',
      zonaCuerpo: 'Antebrazo',
      estado: 'En diseño',
      precio: 210,
      observaciones: 'Falta definir detalles de sombras.'
    },
    {
      id: '7',
      cliente: 'Luis Intriago',
      fecha: '2026-07-12',
      estilo: 'Realismo',
      tatuador: 'Jesus Macias',
      zonaCuerpo: 'Pecho',
      estado: 'Cancelada',
      precio: 300,
      observaciones: 'Cliente reagendara en agosto.'
    },
    {
      id: '8',
      cliente: 'Karen Vera',
      fecha: '2026-07-13',
      estilo: 'Lettering',
      tatuador: 'Jehu Villamar',
      zonaCuerpo: 'Costillas',
      estado: 'Pendiente',
      precio: 120,
      observaciones: 'Pendiente pago de reserva.'
    },
    {
      id: '9',
      cliente: 'Diego Cevallos',
      fecha: '2026-07-14',
      estilo: 'Neo tradicional',
      tatuador: 'Jordan Solorzano',
      zonaCuerpo: 'Pierna',
      estado: 'Confirmada',
      precio: 240,
      observaciones: 'Sesion de 4 horas.'
    },
    {
      id: '10',
      cliente: 'Fernanda Pincay',
      fecha: '2026-07-15',
      estilo: 'Acuarela',
      tatuador: 'Jesus Macias',
      zonaCuerpo: 'Tobillo',
      estado: 'En diseño',
      precio: 160,
      observaciones: 'Cliente envio referencias nuevas.'
    },
    {
      id: '11',
      cliente: 'Ruben Cardenas',
      fecha: '2026-07-16',
      estilo: 'Black and grey',
      tatuador: 'Jehu Villamar',
      zonaCuerpo: 'Espalda',
      estado: 'Confirmada',
      precio: 380,
      observaciones: 'Proyecto grande por sesiones.'
    },
    {
      id: '12',
      cliente: 'Camila Loor',
      fecha: '2026-07-17',
      estilo: 'Minimalista',
      tatuador: 'Jordan Solorzano',
      zonaCuerpo: 'Cuello',
      estado: 'Pendiente',
      precio: 110,
      observaciones: 'Solo linea fina.'
    },
    {
      id: '13',
      cliente: 'Esteban Mero',
      fecha: '2026-07-18',
      estilo: 'Biomecanico',
      tatuador: 'Jesus Macias',
      zonaCuerpo: 'Brazo',
      estado: 'Cancelada',
      precio: 290,
      observaciones: 'Sin respuesta del cliente.'
    },
    {
      id: '14',
      cliente: 'Sofia Choez',
      fecha: '2026-07-19',
      estilo: 'Dotwork',
      tatuador: 'Jehu Villamar',
      zonaCuerpo: 'Clavicula',
      estado: 'Confirmada',
      precio: 175,
      observaciones: 'Llega con referencia impresa.'
    },
    {
      id: '15',
      cliente: 'Martin Delgado',
      fecha: '2026-07-20',
      estilo: 'Tradicional',
      tatuador: 'Jordan Solorzano',
      zonaCuerpo: 'Pantorrilla',
      estado: 'Pendiente',
      precio: 200,
      observaciones: 'Cotizacion aceptada, falta abono.'
    },
    {
      id: '16',
      cliente: 'Paola Santana',
      fecha: '2026-07-21',
      estilo: 'Fineline',
      tatuador: 'Jesus Macias',
      zonaCuerpo: 'Costillas',
      estado: 'En diseño',
      precio: 150,
      observaciones: 'Diseno floral en progreso.'
    },
    {
      id: '17',
      cliente: 'Javier Quijije',
      fecha: '2026-07-22',
      estilo: 'Old school',
      tatuador: 'Jehu Villamar',
      zonaCuerpo: 'Antebrazo',
      estado: 'Confirmada',
      precio: 230,
      observaciones: 'Sesion agendada por la tarde.'
    },
    {
      id: '18',
      cliente: 'Nicole Solis',
      fecha: '2026-07-23',
      estilo: 'Acuarela',
      tatuador: 'Jordan Solorzano',
      zonaCuerpo: 'Espalda',
      estado: 'Cancelada',
      precio: 275,
      observaciones: 'Cliente viaja fuera de la ciudad.'
    },
    {
      id: '19',
      cliente: 'Daniel Bravo',
      fecha: '2026-07-24',
      estilo: 'Blackwork',
      tatuador: 'Jesus Macias',
      zonaCuerpo: 'Brazo',
      estado: 'Pendiente',
      precio: 205,
      observaciones: 'Pendiente confirmacion final.'
    },
    {
      id: '20',
      cliente: 'Lucia Anchundia',
      fecha: '2026-07-25',
      estilo: 'Realismo',
      tatuador: 'Jehu Villamar',
      zonaCuerpo: 'Muslo',
      estado: 'Confirmada',
      precio: 340,
      observaciones: 'Proyecto con sombreado completo.'
    },
    {
      id: '21',
      cliente: 'Bruno Zamora',
      fecha: '2026-07-26',
      estilo: 'Geometrico',
      tatuador: 'Jordan Solorzano',
      zonaCuerpo: 'Hombro',
      estado: 'En diseño',
      precio: 220,
      observaciones: 'Diseno pendiente de ajustes.'
    },
    {
      id: '22',
      cliente: 'Alejandra Moreira',
      fecha: '2026-07-27',
      estilo: 'Minimalista',
      tatuador: 'Jesus Macias',
      zonaCuerpo: 'Tobillo',
      estado: 'Pendiente',
      precio: 98,
      observaciones: 'Cliente solicita cita matutina.'
    },
    {
      id: '23',
      cliente: 'Gustavo Pino',
      fecha: '2026-07-28',
      estilo: 'Tribal',
      tatuador: 'Jehu Villamar',
      zonaCuerpo: 'Pecho',
      estado: 'Confirmada',
      precio: 260,
      observaciones: 'Abono registrado en caja.'
    }
  ];

  citas = signal<CitaTatuaje[]>(this.loadCitas());

  private saveCitas(citas: CitaTatuaje[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(citas));
  }

  private loadCitas(): CitaTatuaje[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [...this.defaultCitas];
    }
    try {
      const parsed = JSON.parse(raw) as CitaTatuaje[];
      if (!Array.isArray(parsed)) {
        return [...this.defaultCitas];
      }
      // Migración defensiva para datos antiguos guardados sin nuevos campos.
      return parsed.map((cita) => ({
        ...cita,
        precio: Number(cita.precio ?? 0),
        observaciones: cita.observaciones ?? ''
      }));
    } catch {
      return [...this.defaultCitas];
    }
  }

  private updateAndSave(updateFn: (current: CitaTatuaje[]) => CitaTatuaje[]) {
    const next = updateFn(this.citas());
    this.citas.set(next);
    this.saveCitas(next);
  }

  obtenerCitaPorId(id: string): CitaTatuaje | undefined {
    return this.citas().find(c => c.id === id);
  }

  agregarCita(cita: CitaTatuaje) {
    this.updateAndSave(list => [...list, cita]);
  }

  eliminarCita(id: string) {
    this.updateAndSave(list => list.filter(c => c.id !== id));
  }

  actualizarCita(updated: CitaTatuaje) {
    this.updateAndSave(list => list.map(c => c.id === updated.id ? updated : c));
  }

  restaurarCitas() {
    this.citas.set([...this.defaultCitas]);
    this.saveCitas(this.defaultCitas);
  }
}