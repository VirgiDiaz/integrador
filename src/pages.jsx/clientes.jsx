import React, { useEffect, useState } from 'react';
import '../styles/app.css';

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [vista, setVista] = useState('historial'); // "historial" o "ranking"

  useEffect(() => {
    fetch('http://localhost:4000/clientes/todos')
      .then(res => res.json())
      .then(data => setClientes(data))
      .catch(err => console.error('Error al obtener clientes:', err));
  }, []);

  const verHistorial = async (cliente) => {
    setSeleccionado(cliente);
    setVista('historial');
    try {
      const res = await fetch(`http://localhost:4000/clientes/historial?id=${cliente.id}`);
      const data = await res.json();
      
      // Ordenar por fecha descendente
      const historialOrdenado = Array.isArray(data)
        ? data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        : [];

      setHistorial(historialOrdenado);
    } catch (error) {
      console.error('Error al obtener historial:', error);
    }
  };

  // Construir ranking de productos más comprados
  const generarRanking = () => {
    const conteo = {};

    historial.forEach((compra) => {
      const nombre = compra.nombre;
      conteo[nombre] = (conteo[nombre] || 0) + compra.cantidad;
    });

    const ranking = Object.entries(conteo)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);

    return ranking;
  };

  // Mensaje simulado de oferta personalizada
  const generarOferta = (producto) => {
    return `¡Hola ${seleccionado.nombre}! Tenemos una oferta especial en ${producto.nombre}, que es uno de tus favoritos (lo compraste ${producto.cantidad} veces).`;
  };

  return (
    <div className="container">
      <h2>Clientes registrados</h2>

      <ul>
        {clientes.map((c) => (
          <li key={c.id} className="card">
            <strong>{c.nombre}</strong> (DNI: {c.id})<br />
            <button onClick={() => verHistorial(c)}>Ver historial</button>
          </li>
        ))}
      </ul>

      {seleccionado && (
        <div className="section">
          <h3>Historial de {seleccionado.nombre}</h3>

          <div style={{ marginBottom: '10px' }}>
            <button onClick={() => setVista('historial')}>Ver historial cronológico</button>
            <button onClick={() => setVista('ranking')} style={{ marginLeft: '8px' }}>
              Ver ranking de productos
            </button>
          </div>

          {vista === 'historial' ? (
            <ul>
              {historial.map((item, i) => (
                <li key={i}>
                  <strong>{item.fecha}</strong> - {item.nombre} (x{item.cantidad})
                </li>
              ))}
            </ul>
          ) : (
            <ul>
              {generarRanking().map((item, i) => (
                <li key={i}>
                  {item.nombre} - comprado {item.cantidad} veces
                  <div className="card" style={{ marginTop: '5px' }}>
                    <strong>Oferta simulada:</strong>
                    <p>{generarOferta(item)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default Clientes;
