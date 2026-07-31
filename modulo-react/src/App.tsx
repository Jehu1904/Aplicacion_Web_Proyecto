import React, { useEffect, useMemo, useState } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import './styles/App.css';

// CREACIÓN DEL ESTADO GLOBAL
const EstadoGlobalContext = React.createContext({ nombreEstudio: "" });
const STORAGE_KEY = 'react_catalogo_proximos_tatuajes';

type EtapaCatalogo = 'hecho' | 'proximo';

interface TattooCatalogItem {
  id: string;
  nombre: string;
  artista: string;
  estilo: string;
  imagen: string;
  etapa: EtapaCatalogo;
}

const CATALOGO_HECHOS: TattooCatalogItem[] = [
  {
    id: 'h-1',
    nombre: 'Dragon de Sombras',
    artista: 'Carlos Ink',
    estilo: 'Realismo',
    imagen: 'https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?auto=format&fit=crop&w=900&q=80',
    etapa: 'hecho'
  },
  {
    id: 'h-2',
    nombre: 'Rosa en Tinta Negra',
    artista: 'Ana Tattoo',
    estilo: 'Blackwork',
    imagen: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=900&q=80',
    etapa: 'hecho'
  },
  {
    id: 'h-3',
    nombre: 'Linea Geometrica',
    artista: 'Jordan Solorzano',
    estilo: 'Minimalista',
    imagen: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=900&q=80',
    etapa: 'hecho'
  }
];

// NAVBAR COMPARTIDA
function Navbar() {
  const global = React.useContext(EstadoGlobalContext); 
  return (
    <nav style={{ padding: '10px', background: '#222', color: '#fff', display: 'flex', gap: '15px' }}>
      <strong style={{ marginRight: '20px' }}>{global.nombreEstudio}</strong>
      <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Listado de Catalogo</Link>
    </nav>
  );
}

function CatalogCard({ item }: { item: TattooCatalogItem }) {
  return (
    <article style={{ border: '1px solid #2b2b33', borderRadius: '10px', overflow: 'hidden', background: '#1b1b24' }}>
      <img src={item.imagen} alt={item.nombre} style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }} />
      <div style={{ padding: '12px' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: '18px' }}>{item.nombre}</h3>
        <p style={{ margin: '0 0 4px' }}><strong>Artista:</strong> {item.artista}</p>
        <p style={{ margin: '0 0 8px' }}><strong>Estilo:</strong> {item.estilo}</p>
        <span style={{ display: 'inline-block', fontSize: '12px', padding: '4px 8px', borderRadius: '999px', background: item.etapa === 'hecho' ? '#154734' : '#4a3415', color: '#fff' }}>
          {item.etapa === 'hecho' ? 'Trabajo realizado' : 'Proximo tatuaje'}
        </span>
      </div>
    </article>
  );
}

// PANTALLA PRINCIPAL: CATALOGO + BUSCADOR + CARGA ADMIN
function PanelCatalogo() {
  const global = React.useContext(EstadoGlobalContext); 
  const [filtroEstilo, setFiltroEstilo] = useState('');
  const [proximos, setProximos] = useState<TattooCatalogItem[]>([]);

  const [nombreNuevo, setNombreNuevo] = useState('');
  const [artistaNuevo, setArtistaNuevo] = useState('');
  const [estiloNuevo, setEstiloNuevo] = useState('');
  const [archivoNuevo, setArchivoNuevo] = useState<File | null>(null);

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nombreEditado, setNombreEditado] = useState('');
  const [artistaEditado, setArtistaEditado] = useState('');
  const [estiloEditado, setEstiloEditado] = useState('');

  const isAdmin = (localStorage.getItem('user_role') || '').toLowerCase() === 'admin';

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as TattooCatalogItem[];
      if (Array.isArray(parsed)) {
        setProximos(parsed);
      }
    } catch {
      setProximos([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(proximos));
  }, [proximos]);

  const normalizar = (valor: string) => valor.toLowerCase().trim();

  const catalogoFiltradoHechos = useMemo(() => {
    const filtro = normalizar(filtroEstilo);
    if (!filtro) return CATALOGO_HECHOS;
    return CATALOGO_HECHOS.filter((item) => normalizar(item.estilo).includes(filtro));
  }, [filtroEstilo]);

  const catalogoFiltradoProximos = useMemo(() => {
    const filtro = normalizar(filtroEstilo);
    if (!filtro) return proximos;
    return proximos.filter((item) => normalizar(item.estilo).includes(filtro));
  }, [filtroEstilo, proximos]);

  const leerComoDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
    reader.readAsDataURL(file);
  });

  const subirProximoTatuaje = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!archivoNuevo) {
      alert('Selecciona una imagen para el proximo tatuaje.');
      return;
    }
    if (!nombreNuevo.trim() || !artistaNuevo.trim() || !estiloNuevo.trim()) {
      alert('Completa nombre, artista y estilo.');
      return;
    }

    try {
      const imagen = await leerComoDataUrl(archivoNuevo);
      const nuevo: TattooCatalogItem = {
        id: `p-${Date.now()}`,
        nombre: nombreNuevo.trim(),
        artista: artistaNuevo.trim(),
        estilo: estiloNuevo.trim(),
        imagen,
        etapa: 'proximo'
      };

      setProximos((prev) => [nuevo, ...prev]);
      setNombreNuevo('');
      setArtistaNuevo('');
      setEstiloNuevo('');
      setArchivoNuevo(null);
      alert('Imagen subida al catalogo de proximos tatuajes.');
    } catch {
      alert('No fue posible procesar la imagen seleccionada.');
    }
  };

  const eliminarProximoTatuaje = (id: string) => {
    const confirmar = window.confirm('¿Eliminar este proximo tatuaje del catalogo?');
    if (!confirmar) return;
    setProximos((prev) => prev.filter((item) => item.id !== id));
  };

  const iniciarEdicion = (item: TattooCatalogItem) => {
    setEditandoId(item.id);
    setNombreEditado(item.nombre);
    setArtistaEditado(item.artista);
    setEstiloEditado(item.estilo);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setNombreEditado('');
    setArtistaEditado('');
    setEstiloEditado('');
  };

  const guardarEdicion = () => {
    if (!editandoId) return;
    if (!nombreEditado.trim() || !artistaEditado.trim() || !estiloEditado.trim()) {
      alert('Completa nombre, artista y estilo para guardar cambios.');
      return;
    }

    setProximos((prev) => prev.map((item) => (
      item.id === editandoId
        ? {
          ...item,
          nombre: nombreEditado.trim(),
          artista: artistaEditado.trim(),
          estilo: estiloEditado.trim()
        }
        : item
    )));
    cancelarEdicion();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Catalogo de Tatuajes — {global.nombreEstudio}</h2>

      <div style={{ margin: '16px 0 22px' }}>
        <label style={{ marginRight: '10px' }}>Buscar por estilo:</label>
        <input
          type="text"
          value={filtroEstilo}
          onChange={(e) => setFiltroEstilo(e.target.value)}
          placeholder="Ej: Realismo, Blackwork, Minimalista..."
          style={{ padding: '8px 10px', width: '320px', maxWidth: '100%' }}
        />
      </div>

      <section style={{ marginBottom: '28px' }}>
        <h3 style={{ marginBottom: '12px' }}>Trabajos realizados</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
          {catalogoFiltradoHechos.length === 0 ? (
            <p>No hay tatuajes realizados con ese estilo.</p>
          ) : (
            catalogoFiltradoHechos.map((item) => <CatalogCard key={item.id} item={item} />)
          )}
        </div>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h3 style={{ marginBottom: '12px' }}>Proximos tatuajes</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
          {catalogoFiltradoProximos.length === 0 ? (
            <p>No hay proximos tatuajes cargados para este estilo.</p>
          ) : (
            catalogoFiltradoProximos.map((item) => (
              <div key={item.id}>
                <CatalogCard item={item} />
                {isAdmin && <ProximoCardAdmin item={item} onEliminar={eliminarProximoTatuaje} onEditar={iniciarEdicion} />}
              </div>
            ))
          )}
        </div>
      </section>

      {isAdmin && editandoId && (
        <section style={{ border: '1px solid #2b2b33', borderRadius: '10px', padding: '16px', background: '#1b1b24', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 12px' }}>Editar proximo tatuaje</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <input type="text" value={nombreEditado} onChange={(e) => setNombreEditado(e.target.value)} placeholder="Nombre del tatuaje" style={{ padding: '9px' }} />
            <input type="text" value={artistaEditado} onChange={(e) => setArtistaEditado(e.target.value)} placeholder="Nombre del artista" style={{ padding: '9px' }} />
            <input type="text" value={estiloEditado} onChange={(e) => setEstiloEditado(e.target.value)} placeholder="Estilo" style={{ padding: '9px' }} />
            <button type="button" onClick={guardarEdicion} style={{ padding: '10px', cursor: 'pointer', background: '#2d6cdf', color: '#fff', border: 'none' }}>
              Guardar cambios
            </button>
            <button type="button" onClick={cancelarEdicion} style={{ padding: '10px', cursor: 'pointer', background: '#555', color: '#fff', border: 'none' }}>
              Cancelar
            </button>
          </div>
        </section>
      )}

      {isAdmin && (
        <section style={{ border: '1px solid #2b2b33', borderRadius: '10px', padding: '16px', background: '#1b1b24' }}>
          <h3 style={{ margin: '0 0 12px' }}>Panel Admin: subir proximo tatuaje</h3>
          <form onSubmit={subirProximoTatuaje} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <input type="text" value={nombreNuevo} onChange={(e) => setNombreNuevo(e.target.value)} placeholder="Nombre del tatuaje" required style={{ padding: '9px' }} />
            <input type="text" value={artistaNuevo} onChange={(e) => setArtistaNuevo(e.target.value)} placeholder="Nombre del artista" required style={{ padding: '9px' }} />
            <input type="text" value={estiloNuevo} onChange={(e) => setEstiloNuevo(e.target.value)} placeholder="Estilo" required style={{ padding: '9px' }} />
            <input type="file" accept="image/*" onChange={(e) => setArchivoNuevo(e.target.files?.[0] ?? null)} required style={{ padding: '9px' }} />
            <button type="submit" style={{ gridColumn: '1 / -1', padding: '10px', cursor: 'pointer', background: '#28a745', color: '#fff', border: 'none' }}>
              Subir imagen al catalogo
            </button>
          </form>
        </section>
      )}
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
          <Route path="/" element={<PanelCatalogo />} />
          <Route path="/nueva-cita" element={<PanelCatalogo />} />
        </Routes>
      </EstadoGlobalContext.Provider>
    </HashRouter>
  );
}

interface ProximoCardAdminProps {
  item: TattooCatalogItem;
  onEliminar: (id: string) => void;
  onEditar: (item: TattooCatalogItem) => void;
}

function ProximoCardAdmin({ item, onEliminar, onEditar }: ProximoCardAdminProps) {
  return (
    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
      <button
        type="button"
        onClick={() => onEditar(item)}
        style={{ flex: 1, padding: '8px', background: '#2d6cdf', color: '#fff', border: 'none', cursor: 'pointer' }}
      >
        Editar
      </button>
      <button
        type="button"
        onClick={() => onEliminar(item.id)}
        style={{ flex: 1, padding: '8px', background: '#c62828', color: '#fff', border: 'none', cursor: 'pointer' }}
      >
        Eliminar
      </button>
    </div>
  );
}