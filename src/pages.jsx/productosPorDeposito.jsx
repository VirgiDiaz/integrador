import React, { useState } from 'react';

const ProductosPorDeposito = () => {
  const [deposito, setDeposito] = useState('Deposito A');
  const [busqueda, setBusqueda] = useState('');
  const [productos, setProductos] = useState([
    { nombre: 'A', precio: 4000, cantidad: 1, stock: 5 },
    { nombre: 'A', precio: 920, cantidad: '≥10', stock: 0 },
    { nombre: 'A', precio: 870, cantidad: '≥30', stock: 0 },
    { nombre: 'B', precio: '', cantidad: '', stock: '' }
  ]);

  const agregarProducto = () => {
    if (busqueda.trim() !== '') {
      setProductos([
        ...productos,
        { nombre: busqueda, precio: '', cantidad: '', stock: '' }
      ]);
      setBusqueda('');
    }
  };

  const eliminarProducto = (index) => {
    const nuevaLista = productos.filter((_, i) => i !== index);
    setProductos(nuevaLista);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Productos</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label>Depósito: </label>
        <select value={deposito} onChange={(e) => setDeposito(e.target.value)}>
          <option>Deposito A</option>
          <option>Deposito B</option>
        </select>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Buscar producto"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button onClick={agregarProducto}>+</button>
      </div>

      <table border="1" cellPadding="5" cellSpacing="0">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Cantidad (≥)</th>
            <th>Stock</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p, i) => (
            <tr key={i}>
              <td>{p.nombre}</td>
              <td>{p.precio}</td>
              <td>{p.cantidad}</td>
              <td>{p.stock}</td>
              <td>
                <button onClick={() => eliminarProducto(i)}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductosPorDeposito;
