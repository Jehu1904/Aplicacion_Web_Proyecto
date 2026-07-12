// modulo-react/src/citasMock.ts

export interface CitaTatuaje {
  id: string;
  cliente: string;
  artista: string;
  estilo: string; // Ej: Realismo, Tradicional, Fine Line
  fecha: string;
  precio: number;
  estado: 'pendiente' | 'confirmada' | 'completada';
}

export const CITAS_MOCK: CitaTatuaje[] = [
  {
    id: "1",
    cliente: "Jordan Solorzano",
    artista: "Carlos Ink",
    estilo: "Realismo",
    fecha: "2026-07-10",
    precio: 150,
    estado: "confirmada"
  },
  {
    id: "2",
    cliente: "Jehu Villamar",
    artista: "Ana Tattoo",
    estilo: "Tradicional",
    fecha: "2026-07-12",
    precio: 90,
    estado: "pendiente"
  },
  {
    id: "3",
    cliente: "Jesus Macias",
    artista: "Carlos Ink",
    estilo: "Fine Line",
    fecha: "2026-07-15",
    precio: 70,
    estado: "completada"
  }
];