import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/app.css';

function Ventas() {
  const location = useLocation();
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState('');
  const [productos, setProductos] = useState([]);
  const [idCliente, setIdCliente] = useState(location.state?.cliente?.id || '');

  // 🔹 Función para calcular el precio unitario según cantidad
  const calcularPrecioUnitario = (prod, cantidad) => {
    if (cantidad >= 30) return prod.precio3;
    if (cantidad >= 10) return prod.precio2;
    return prod.precio1;
  };

  // 🔹 Agregar producto manualmente por código de barras
  const agregarProductoManual = async () => {
    try {
      const res = await fetch(`http://localhost:4000/productos?codigo=${codigo}`);
      const data = await res.json();

      if (data.length > 0) {
        const nuevoProducto = {
          ...data[0],
          cantidad: 1, // por defecto 1
        };
        setProductos([...productos, nuevoProducto]);
        setCodigo('');
      } else {
        alert('Producto no encontrado');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // 🔹 Actualizar cantidad
  const actualizarCantidad = (index, nuevaCantidad) => {
    const nuevaLista = [...productos];
    nuevaLista[index].cantidad = parseInt(nuevaCantidad, 10) || 1;
    setProductos(nuevaLista);
  };

  // 🔹 Eliminar producto (frontend + backend)
  const eliminarProducto = async (id, index) => {
    try {
      // Eliminar en backend
      const res = await fetch(`http://localhost:4000/productos/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Eliminar en frontend
        const nuevaLista = [...productos];
        nuevaLista.splice(index, 1);
        setProductos(nuevaLista);
      } else {
        alert('Error al eliminar producto en la base de datos');
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
  };

  // 🔹 Calcular total
  const total = productos.reduce((acc, prod) => {
    const precioUnit = calcularPrecioUnitario(prod, prod.cantidad);
    return acc + precioUnit * prod.cantidad;
  }, 0);

  // 🔹 Registrar venta
  const registrarVenta = async () => {
    if (!idCliente) {
      alert('Debe ingresar un DNI de cliente');
      return;
    }

    try {
      const resCliente = await fetch(`http://localhost:4000/clientes?id=${idCliente}`);
      const dataCliente = await resCliente.json();

      if (dataCliente.length === 0) {
        navigate('/registrar-cliente', { state: { idCliente, productos } });
        return;
      }

      const fechaHora = new Date().toISOString().slice(0, 19).replace("T", " ");

      const ventaRes = await fetch('http://localhost:4000/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_cliente: idCliente,
          fecha: fechaHora,
          total,
          productos: productos.map(p => ({
            id: p.id,
            cantidad: p.cantidad,
            precio_unitario: calcularPrecioUnitario(p, p.cantidad),
          })),
        }),
      });

      if (ventaRes.ok) {
        alert('Venta registrada exitosamente');
        setProductos([]);
        setIdCliente('');
      } else {
        alert('Error al registrar la venta');
      }
    } catch (error) {
      console.error('Error al registrar venta:', error);
    }
  };

  return (
    <div className="container">
      <h1>Ventas</h1>

      <div className="section">
        <h2>Productos:</h2>
        <table className="tabla-productos">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Cantidad</th>
              <th>Precio Unit.</th>
              <th>Subtotal</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((prod, i) => {
              const precioUnit = calcularPrecioUnitario(prod, prod.cantidad);
              return (
                <tr key={i}>
                  <td>{prod.nombre}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={prod.cantidad}
                      onChange={(e) => actualizarCantidad(i, e.target.value)}
                    />
                  </td>
                  <td>${precioUnit}</td>
                  <td>${precioUnit * prod.cantidad}</td>
                  <td>
                    <button
                      className="btn-eliminar"
                      onClick={() => eliminarProducto(prod.id, i)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="section">
        <h3>Agregar producto manual:</h3>
        <input
          type="text"
          placeholder="Código de barras"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
        />
        <button onClick={agregarProductoManual}>Agregar producto</button>
      </div>

      <div className="section">
        <h3>Total: ${total}</h3>

        <label>DNI Cliente:</label>
        <input
          type="text"
          placeholder="DNI CLIENTE"
          value={idCliente}
          onChange={(e) => setIdCliente(e.target.value)}
        />

        <button onClick={registrarVenta}>Registrar Venta</button>
      </div>
    </div>
  );
}

export default Ventas;
