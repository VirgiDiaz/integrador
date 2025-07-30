import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Ventas() {
  const location = useLocation();
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState('');
  const [productos, setProductos] = useState(location.state?.reconocidos || []);
  const [noReconocidos, setNoReconocidos] = useState(location.state?.noReconocidos || []);
  const [idCliente, setIdCliente] = useState(location.state?.cliente?.id || '');
  const [fecha, setFecha] = useState('');

  const agregarProductoManual = async () => {
    try {
      const res = await fetch(`http://localhost:4000/productos?codigo=${codigo}`);
      const data = await res.json();

      if (data.length > 0) {
        setProductos([...productos, data[0]]);
      } else {
        alert('Producto no encontrado');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const registrarVenta = async () => {
    if (!idCliente) {
      alert('Debe ingresar un DNI de cliente');
      return;
    }

    try {
      const resCliente = await fetch(`http://localhost:4000/clientes?id=${idCliente}`);
      const dataCliente = await resCliente.json();

      if (dataCliente.length === 0) {
        // Redirigir a registro de cliente y pasar el DNI
        navigate('/registrar-cliente', { state: { idCliente, productos } });

        return;
      }

      const total = productos.reduce((acc, prod) => acc + prod.precio, 0);

      const ventaRes = await fetch('http://localhost:4000/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_cliente: idCliente,
          fecha,
          total
        }),
      });

      if (ventaRes.ok) {
        alert('Venta registrada exitosamente');
        setProductos([]);
        setNoReconocidos([]);
        setIdCliente('');
        setFecha('');
      } else {
        alert('Error al registrar la venta');
      }
    } catch (error) {
      console.error('Error al registrar venta:', error);
    }
  };

  const total = productos.reduce((acc, prod) => acc + prod.precio, 0);

  return (
    <div>
      <h1>Ventas</h1>

      <h2>Productos Reconocidos:</h2>
      <ul>
        {productos.map((prod, i) => (
          <li key={i}>{prod.nombre} - ${prod.precio}</li>
        ))}
      </ul>

      <h3>Agregar producto manual:</h3>
      <input
        type="text"
        placeholder="Código de barras"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
      />
      <button onClick={agregarProductoManual}>Agregar producto</button>

      <h3>Total: ${total}</h3>

      <input
        type="text"
        placeholder="DNI CLIENTE"
        value={idCliente}
        onChange={(e) => setIdCliente(e.target.value)}
      />
      <br />
      <button onClick={registrarVenta}>Registrar Venta</button>
    </div>
  );
}

export default Ventas;
