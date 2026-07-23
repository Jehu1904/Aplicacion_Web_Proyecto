

interface FilterGroupProps {
  setFiltro: (estilo: string) => void;
}

export default function FilterGroup({ setFiltro }: FilterGroupProps) {
  const estilos = ['Todos', 'Realismo', 'Minimalista', 'Tradicional', 'Tribal'];

  return (
    <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
      {estilos.map(estilo => (
        <button 
          key={estilo}
          onClick={() => setFiltro(estilo === 'Todos' ? '' : estilo)}
          style={{ padding: '5px 10px', cursor: 'pointer', background: '#89c7f0', border: '1px solid #8cf0e2', borderRadius: '4px' }}
        >
          {estilo}
        </button>
      ))}
    </div>
  );
}