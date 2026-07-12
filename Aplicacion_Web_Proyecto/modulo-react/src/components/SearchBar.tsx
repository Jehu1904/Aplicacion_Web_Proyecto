

interface SearchBarProps {
  filtro: string;
  setFiltro: (valor: string) => void;
  totalResultados: number;
}

export default function SearchBar({ filtro, setFiltro, totalResultados }: SearchBarProps) {
  return (
    <div style={{ marginBottom: '15px' }}>
      <label>Buscar por Estilo: </label>
      <input 
        type="text" 
        value={filtro} 
        onChange={(e) => setFiltro(e.target.value)} 
        placeholder="Ej: Realismo, Tradicional..."
        style={{ padding: '5px', width: '250px' }}
      />
      <p><small>Resultados encontrados: <strong>{totalResultados}</strong></small></p>
    </div>
  );
}