import { Link } from 'react-router-dom';
import type { CitaTatuaje } from '../data/citasMock';

interface TattooCardProps {
  cita: CitaTatuaje;
}

export default function TattooCard({ cita }: TattooCardProps) {
  return (
    <tr>
      <td>{cita.cliente}</td>
      <td>{cita.artista}</td>
      <td><strong>{cita.estilo}</strong></td>
      <td>{cita.fecha}</td>
      <td>
        <Link to={`/cita/${cita.id}`}>Ver Detalles</Link>
      </td>
    </tr>
  );
}