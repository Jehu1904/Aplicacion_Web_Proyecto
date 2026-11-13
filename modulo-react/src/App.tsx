import React, { useEffect, useMemo, useState } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import './styles/App.css';
import {
  addCatalogDesign,
  deleteCatalogDesign,
  getCatalogDesigns,
  updateCatalogDesign,
  type CatalogDesign
} from '../../lib/tattoo-catalog';

// CREACIÓN DEL ESTADO GLOBAL
const EstadoGlobalContext = React.createContext({ nombreEstudio: "" });
const LEGACY_STORAGE_KEY = 'react_catalogo_proximos_tatuajes';

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return fallback;
}

function getLegacyCatalog(): CatalogDesign[] {
  const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!raw) return [];

  try {
    const items = JSON.parse(raw) as Array<{
      id?: string;
      nombre?: string;
      artista?: string;
      estilo?: string;
      imagen?: string;
    }>;
    if (!Array.isArray(items)) return [];

    return items
      .filter((item) => item.id && item.nombre && item.artista && item.estilo && item.imagen)
      .map((item) => ({
        id: item.id as string,
        name: item.nombre as string,
        artist: item.artista as string,
        style: item.estilo as string,
        image_url: item.imagen as string,
        stage: 'proximo' as const
      }));
  } catch {
    return [];
  }
}

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

function quoteSimulatorUrl(id: string): string {
  const url = new URL('/vue/', window.location.origin);
  if (window.location.port === '5174') url.port = '5176';
  for (const key of ['token', 'email', 'role', 'started']) {
    const value = localStorage.getItem(key === 'email' ? 'user_email' : key === 'role' ? 'user_role' : key === 'started' ? 'session_start' : key);
    if (value) url.searchParams.set(key, value);
  }
  url.hash = `/?designId=${encodeURIComponent(id)}`;
  return url.toString();
}

function CatalogCard({ item }: { item: CatalogDesign }) {
  return (
    <article style={{ border: '1px solid #2b2b33', borderRadius: '10px', overflow: 'hidden', background: '#1b1b24' }}>
      <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }} />
      <div style={{ padding: '12px' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: '18px' }}>{item.name}</h3>
        <p style={{ margin: '0 0 4px' }}><strong>Artista:</strong> {item.artist}</p>
        <p style={{ margin: '0 0 8px' }}><strong>Estilo:</strong> {item.style}</p>
        <p style={{ margin: '0 0 8px', color: '#fbbf24' }}><strong>ID:</strong> {item.id}</p>
        <span style={{ display: 'inline-block', fontSize: '12px', padding: '4px 8px', borderRadius: '999px', background: item.stage === 'hecho' ? '#154734' : '#4a3415', color: '#fff' }}>
          {item.stage === 'hecho' ? 'Trabajo realizado' : 'Proximo tatuaje'}
        </span>
        <a href={quoteSimulatorUrl(item.id)} style={{ display: 'block', marginTop: '12px', color: '#fbbf24', fontWeight: 700 }}>Cotizar este diseño</a>
      </div>
    </article>
  );
}

// PANTALLA PRINCIPAL: CATALOGO + BUSCADOR + CARGA ADMIN
function PanelCatalogo() {
  const global = React.useContext(EstadoGlobalContext); 
  const [filtroEstilo, setFiltroEstilo] = useState('');
  const [disenos, setDisenos] = useState<CatalogDesign[]>([]);
  const [cargandoCatalogo, setCargandoCatalogo] = useState(true);
  const [errorCatalogo, setErrorCatalogo] = useState('');

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
    const cargarCatalogo = async () => {
      try {
        let items = await getCatalogDesigns();
        if (isAdmin) {
          const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY);
          if (legacyData) {
            const legacyItems = JSON.parse(legacyData) as Array<{
              id: string;
              nombre: string;
              artista: string;
              estilo: string;
              imagen: string;
            }>;
            for (const legacy of legacyItems) {
              if (items.some(item => item.id === legacy.id)) continue;
              const blob = await fetch(legacy.imagen).then(async response => {
                if (!response.ok) throw new Error('No se pudo recuperar una imagen antigua del catálogo.');
                return await response.blob();
              });
              const file = new File([blob], `${legacy.id}.jpg`, { type: blob.type || 'image/jpeg' });
              const item = await addCatalogDesign(file, {
                name: legacy.nombre,
                artist: legacy.artista,
                style: legacy.estilo,
                stage: 'proximo'
              }, legacy.id);
              items = [...items, item];
            }
            localStorage.removeItem(LEGACY_STORAGE_KEY);
          }
        } else {
          const legacyItems = getLegacyCatalog();
          const existingIds = new Set(items.map(item => item.id));
          const pendingLegacyItems = legacyItems.filter(item => !existingIds.has(item.id));
          if (pendingLegacyItems.length) {
            items = [...items, ...pendingLegacyItems];
            setErrorCatalogo('Algunos diseños siguen guardados en este navegador y se mostrarán hasta que el administrador los sincronice.');
          }
        }
        setDisenos(items);
      } catch (error) {
        const legacyItems = getLegacyCatalog();
        if (legacyItems.length) {
          setDisenos(legacyItems);
          setErrorCatalogo('Mostrando los diseños guardados en este navegador. Conecta Supabase y abre el catálogo como administrador para sincronizarlos.');
        } else {
          setErrorCatalogo(getErrorMessage(error, 'No se pudo cargar el catálogo.'));
        }
      } finally {
        setCargandoCatalogo(false);
      }
    };
    void cargarCatalogo();
  }, []);

  const normalizar = (valor: string) => valor.toLowerCase().trim();
  const capitalizarPrimeraLetra = (valor: string) => {
    const texto = valor.trim();
    return texto ? texto.charAt(0).toLocaleUpperCase('es-EC') + texto.slice(1) : '';
  };

  const catalogoFiltradoHechos = useMemo(() => {
    const filtro = normalizar(filtroEstilo);
    return disenos.filter((item) => item.stage === 'hecho' && (!filtro || normalizar(item.style).includes(filtro)));
  }, [filtroEstilo, disenos]);

  const catalogoFiltradoProximos = useMemo(() => {
    const filtro = normalizar(filtroEstilo);
    return disenos.filter((item) => item.stage === 'proximo' && (!filtro || normalizar(item.style).includes(filtro)));
  }, [filtroEstilo, disenos]);

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
      const nuevo = await addCatalogDesign(archivoNuevo, {
        name: capitalizarPrimeraLetra(nombreNuevo),
        artist: capitalizarPrimeraLetra(artistaNuevo),
        style: capitalizarPrimeraLetra(estiloNuevo),
        stage: 'proximo'
      });

      setDisenos((prev) => [nuevo, ...prev]);
      setNombreNuevo('');
      setArtistaNuevo('');
      setEstiloNuevo('');
      setArchivoNuevo(null);
      alert('Imagen subida al catalogo de proximos tatuajes.');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'No fue posible guardar el diseño en el catálogo.');
    }
  };

  const eliminarProximoTatuaje = async (item: CatalogDesign) => {
    const confirmar = window.confirm('¿Eliminar este proximo tatuaje del catalogo?');
    if (!confirmar) return;
    try {
      await deleteCatalogDesign(item);
      setDisenos((prev) => prev.filter((design) => design.id !== item.id));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'No se pudo eliminar el diseño.');
    }
  };

  const iniciarEdicion = (item: CatalogDesign) => {
    setEditandoId(item.id);
    setNombreEditado(item.name);
    setArtistaEditado(item.artist);
    setEstiloEditado(item.style);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setNombreEditado('');
    setArtistaEditado('');
    setEstiloEditado('');
  };

  const guardarEdicion = async () => {
    if (!editandoId) return;
    if (!nombreEditado.trim() || !artistaEditado.trim() || !estiloEditado.trim()) {
      alert('Completa nombre, artista y estilo para guardar cambios.');
      return;
    }

    try {
      const changes = {
        name: capitalizarPrimeraLetra(nombreEditado),
        artist: capitalizarPrimeraLetra(artistaEditado),
        style: capitalizarPrimeraLetra(estiloEditado)
      };
      await updateCatalogDesign(editandoId, changes);
      setDisenos((prev) => prev.map((item) => item.id === editandoId ? { ...item, ...changes } : item));
      cancelarEdicion();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'No se pudo actualizar el diseño.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Catalogo de Tatuajes — {global.nombreEstudio}</h2>
      {cargandoCatalogo && <p>Cargando catálogo...</p>}
      {errorCatalogo && <p role="alert">{errorCatalogo}</p>}

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
          {cargandoCatalogo ? null : catalogoFiltradoHechos.length === 0 ? (
            <p>No hay tatuajes realizados con ese estilo.</p>
          ) : (
            catalogoFiltradoHechos.map((item) => <CatalogCard key={item.id} item={item} />)
          )}
        </div>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h3 style={{ marginBottom: '12px' }}>Proximos tatuajes</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
          {cargandoCatalogo ? null : catalogoFiltradoProximos.length === 0 ? (
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
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setArchivoNuevo(e.target.files?.[0] ?? null)} required style={{ padding: '9px' }} />
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
  item: CatalogDesign;
  onEliminar: (item: CatalogDesign) => void;
  onEditar: (item: CatalogDesign) => void;
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
        onClick={() => onEliminar(item)}
        style={{ flex: 1, padding: '8px', background: '#c62828', color: '#fff', border: 'none', cursor: 'pointer' }}
      >
        Eliminar
      </button>
    </div>
  );
}