import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { CITAS_MOCK, type CitaTatuaje } from './data/citasMock'; 
import SearchBar from './components/SearchBar';
import FilterGroup from './components/FilterGroup';
import TattooCard from './components/TattooCard';
import TattooModal from './components/TattooModal';
import './styles/App.css';

// CREACIÓN DEL ESTADO GLOBAL
const EstadoGlobalContext = React.createContext({ nombreEstudio: "" });

// NAVBAR COMPARTIDA
function Navbar() {
  const global = React.useContext(EstadoGlobalContext); 
  return (
    <nav style={{ padding: '10px', background: '#222', color: '#fff', display: 'flex', gap: '15px' }}>
      <strong style={{ marginRight: '20px' }}>{global.nombreEstudio}</strong>
      <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}> Listado de Citas</Link>
      <Link to="/nueva-cita" style={{ color: '#fff', textDecoration: 'none' }}>➕ Agendar Cita</Link>
    </nav>
  );
}

// 1. PANTALLA DE LISTADO DE CITAS
function ListadoCitas() {
  const global = React.useContext(EstadoGlobalContext); 
  const [citas] = useState<CitaTatuaje[]>(CITAS_MOCK);
  const [filtroEstilo, setFiltroEstilo] = useState('');

  const citasFiltradas = citas.filter(cita => 
    cita.estilo.toLowerCase().includes(filtroEstilo.toLowerCase())
  );

  return (
    <div style={{ padding: '20px' }}>
      <h2> Control de Citas — {global.nombreEstudio}</h2>
      
      {/* Componentes modulares agregados */}
      <FilterGroup setFiltro={setFiltroEstilo} />
      <SearchBar filtro={filtroEstilo} setFiltro={setFiltroEstilo} totalResultados={citasFiltradas.length} />

      <table border={1} cellPadding={8} style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f4f4f4' }}>
            <th>Cliente</th>
            <th>Artista</th>
            <th>Estilo</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {citasFiltradas.length === 0 ? (
            <tr><td colSpan={5}>No se encontraron citas con ese estilo.</td></tr>
          ) : (
            citasFiltradas.map((cita) => (
              <TattooCard key={cita.id} cita={cita} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// 2. PANTALLA DE FORMULARIO DE CREACIÓN
function FormularioCita() {
  const navigate = useNavigate();
  const [cliente, setCliente] = useState('');
  const [artista, setArtista] = useState('');
  const [estilo, setEstilo] = useState('');

  const manejarEnvio = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Cita creada con éxito para ${cliente}. (Guardado en memoria)`);
    navigate('/'); 
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <h2>Agendar Nueva Cita</h2>
      <form onSubmit={manejarEnvio} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <label>Nombre del Cliente: </label>
          <input type="text" value={cliente} onChange={(e) => setCliente(e.target.value)} required style={{ width: '100%', padding: '5px' }} />
        </div>
        <div>
          <label>Artista: </label>
          <input type="text" value={artista} onChange={(e) => setArtista(e.target.value)} required style={{ width: '100%', padding: '5px' }} />
        </div>
        <div>
          <label>Estilo: </label>
          <input type="text" value={estilo} onChange={(e) => setEstilo(e.target.value)} required style={{ width: '100%', padding: '5px' }} />
        </div>
        <button type="submit" style={{ padding: '8px', background: '#28a745', color: '#fff', border: 'none', cursor: 'pointer', marginTop: '10px' }}>
          Guardar Cita de Forma Simulada
        </button>
      </form>
    </div>
  );
}

// ENRUTADOR PRINCIPAL 
export default function App() {
  return (
    <HashRouter>
      <EstadoGlobalContext.Provider value={{ nombreEstudio: "Manta Tattoo Studio" }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<ListadoCitas />} />
          <Route path="/nueva-cita" element={<FormularioCita />} />
          <Route path="/cita/:id" element={<TattooModal />} />
        </Routes>
      </EstadoGlobalContext.Provider>
    </HashRouter>
  );
}