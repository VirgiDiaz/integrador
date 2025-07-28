import { useState } from 'react';

const Ventas = () => {
  const [cliente, setCliente] = useState('');
  const [fecha, setFecha] = useState('');
  const [ventas, setVentas] = useState([]);
  const [error, setError] = useState(null);

  const buscarVentas = async () => {
    let url = 'http://localhost:4000/ventas';
    const params = [];

    if (cliente) params.push(`id_cliente=${cliente}`);
    if (fecha) params.push(`fecha=${fecha}`);

    if (params.length > 0) url += `?${params.join('&')}`;

    console.log('Consultando a:', url);

    try {
      const res = await fetch(url);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error del servidor (${res.status}): ${errorText}`);
      }

      const data = await res.json();
      console.log('Respuesta del backend:', data); 

      setVentas(data);
      setError(null);
    } catch (err) {
      console.error('Error al buscar ventas:', err.message);
      setError('Hubo un error buscando ventas');
      setVentas([]);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Buscar Ventas</h2>

      <div style={{ marginBottom: '10px' }}>
        <label>Cliente (ID): </label>
        <input
          type="number"
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>Fecha: </label>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
      </div>

      <button onClick={buscarVentas}>Buscar</button>

      <h3>Resultados:</h3>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!error && ventas.length === 0 && <p>No se encontraron ventas</p>}

      <ul>
        {ventas.map((venta) => (
          <li key={venta.id}>
            Fecha: {venta.fecha.slice(0, 10)} - Cliente: {venta.cliente} - Monto: ${venta.total}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Ventas;
