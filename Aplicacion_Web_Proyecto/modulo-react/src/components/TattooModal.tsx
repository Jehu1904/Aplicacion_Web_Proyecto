import { useParams, useNavigate } from 'react-router-dom';
import { CITAS_MOCK } from '../data/citasMock';

export default function TattooModal() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const cita = CITAS_MOCK.find(c => c.id === id);

  if (!cita) {
    return <div style={{ padding: '20px' }}><h3> La cita no existe.</h3></div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '20px auto', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2> Detalle de la Cita N° {id}</h2>
      <hr />
      <p><strong> Cliente:</strong> {cita.cliente}</p>
      <p><strong> Artista Asignado:</strong> {cita.artista}</p>
      <p><strong> Estilo de Tatuaje:</strong> {cita.estilo}</p>
      <p><strong> Fecha de la Sesión:</strong> {cita.fecha}</p>
      <p><strong> Valor Unitario:</strong> ${cita.precio}</p>
      <p><strong> Estado actual:</strong> <span style={{ padding: '3px 8px', background: '#ddd', borderRadius: '4px' }}>{cita.estado.toUpperCase()}</span></p>
      
      <button onClick={() => navigate('/')} style={{ marginTop: '15px', padding: '8px 15px', cursor: 'pointer' }}>
        Volver al Listado
      </button>
    </div>
  );
}