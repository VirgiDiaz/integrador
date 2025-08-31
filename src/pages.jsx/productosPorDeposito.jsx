import React, { useState, useEffect } from 'react';
import '../styles/app.css';

const ProductosPorDeposito = () => {
  const [deposito, setDeposito] = useState('A');
  const [busqueda, setBusqueda] = useState('');
  const [productos, setProductos] = useState([]);     // lista que se muestra en la tabla
  const [productosAll, setProductosAll] = useState([]); // lista completa del depósito (fuente para sugerencias)
  const [editandoId, setEditandoId] = useState(null);
  const [formEdicion, setFormEdicion] = useState({});
  const [sugerencias, setSugerencias] = useState([]);

  // Cargar productos del depósito (llena productosAll y productos)
  useEffect(() => {
    cargarProductosPorDeposito();
  }, [deposito]);

  const cargarProductosPorDeposito = async () => {
    try {
      const res = await fetch(`http://localhost:4000/productos?deposito=${deposito}`);
      if (!res.ok) throw new Error('Error al obtener productos');

      const data = await res.json();
      const arr = Array.isArray(data) ? data : [];
      setProductosAll(arr);
      setProductos(arr); // inicialmente mostramos todos
    } catch (error) {
      console.error('Error al cargar productos por depósito:', error);
      setProductosAll([]);
      setProductos([]);
    }
  };

  // Normaliza el campo "codigo" del producto (maneja variantes de nombres)
  const getCodigo = (p) => {
    const c = p?.codigo ?? p?.codigoBarras ?? p?.codigo_barra ?? p?.barcode ?? '';
    return String(c ?? '').trim();
  };

  // Buscar producto exacto o por prefijo (localmente)
  const buscarProducto = async (codigoOpt) => {
    const code = (codigoOpt ?? busqueda ?? '').trim();
    if (code === '') {
      // si no hay texto -> recargar todos del depósito
      setProductos(productosAll);
      setSugerencias([]);
      return;
    }

    // filtrado exacto primero
    const exactos = productosAll.filter((p) => getCodigo(p) === code);
    if (exactos.length > 0) {
      setProductos(exactos);
      setSugerencias([]);
      return;
    }

    // si no hay exactos, mostramos coincidencias por prefijo
    const prefijo = productosAll.filter((p) =>
      getCodigo(p).toLowerCase().startsWith(code.toLowerCase())
    );
    setProductos(prefijo);
    setSugerencias([]);
  };

  // Obtener sugerencias mientras se escribe (filtrado local)
  const obtenerSugerencias = (texto) => {
    setBusqueda(texto);

    const t = texto.trim();
    if (t.length === 0) {
      setSugerencias([]);
      return;
    }

    // Filtramos productosAll por código que empiece con lo escrito (case-insensitive)
    const matches = productosAll.filter((p) =>
      getCodigo(p).toLowerCase().startsWith(t.toLowerCase())
    );

    // limitar a 10 sugerencias y mapear
    setSugerencias(matches.slice(0, 10));
  };

  // Al seleccionar una sugerencia: completar input y buscar automáticamente
  const seleccionarSugerencia = (producto) => {
    const codigoSeleccionado = getCodigo(producto);
    setBusqueda(codigoSeleccionado);
    setSugerencias([]);
    // mostrar ese/estos productos en la tabla
    buscarProducto(codigoSeleccionado);
  };

  // Eliminar producto (ya tenías ruta /api/productos/:id)
  const eliminarProducto = async (id) => {
    try {
      const res = await fetch(`http://localhost:4000/api/productos/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error en el servidor');
      }
      // recargo desde el backend para mantener consistencia
      cargarProductosPorDeposito();
    } catch (err) {
      console.error('Error al eliminar', err);
      alert(err.message || 'Error al eliminar producto');
    }
  };

  // Editar producto (activar inputs)
  const activarEdicion = (producto) => {
    setEditandoId(producto.id);
    setFormEdicion({ ...producto });
  };

  // Manejar cambios en inputs de edición
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormEdicion({
      ...formEdicion,
      [name]: value,
    });
  };

  // Guardar edición (PUT)
  const guardarEdicion = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/productos/${editandoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formEdicion),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error en el servidor');
      }

      setEditandoId(null);
      cargarProductosPorDeposito();
    } catch (err) {
      console.error('Error al guardar edición:', err);
      alert('Error al guardar cambios');
    }
  };

  // Manejar Enter en el input -> buscar
  const handleKeyDownBusqueda = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      buscarProducto();
    }
  };

  return (
    <div className="container">
      <h2>Productos por Depósito</h2>

      <div className="section">
        <label>Depósito:</label>
        <select value={deposito} onChange={(e) => setDeposito(e.target.value)}>
          <option value="A">A</option>
          <option value="B">B</option>
        </select>
      </div>

      <div className="section" style={{ position: 'relative' }}>
        <label>Buscar producto:</label>
        <input
          type="text"
          placeholder="Código de barras del producto"
          value={busqueda}
          onChange={(e) => obtenerSugerencias(e.target.value)}
          onKeyDown={handleKeyDownBusqueda}
          aria-autocomplete="list"
        />
        <button onClick={() => buscarProducto()}>Buscar</button>

        {/* Dropdown de sugerencias (solo muestra nombre y código) */}
        {sugerencias.length > 0 && (
          <ul
            role="listbox"
            style={{
              position: 'absolute',
              top: '62px',
              left: 0,
              right: 0,
              background: '#fff',
              border: '1px solid #ccc',
              borderRadius: 4,
              maxHeight: 220,
              overflowY: 'auto',
              listStyle: 'none',
              padding: 0,
              margin: 0,
              zIndex: 1200,
              boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
            }}
          >
            {sugerencias.map((sug) => (
              <li
                key={sug.id}
                role="option"
                onClick={() => seleccionarSugerencia(sug)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <span style={{ fontWeight: 500 }}>{sug.nombre}</span>
                <small style={{ color: '#666' }}>{getCodigo(sug)}</small>
              </li>
            ))}
          </ul>
        )}
      </div>

      <table className="tabla-productos">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Stock</th>
            <th>Precio 1</th>
            <th>Precio 2</th>
            <th>Precio 3</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.length > 0 ? (
            productos.map((p) => (
              <tr key={p.id}>
                <td>{p.nombre}</td>
                <td>
                  {editandoId === p.id ? (
                    <input name="descripcion" value={formEdicion.descripcion || ''} onChange={handleChange} />
                  ) : (
                    p.descripcion
                  )}
                </td>
                <td>
                  {editandoId === p.id ? (
                    <input type="number" name="stock" value={formEdicion.stock || ''} onChange={handleChange} />
                  ) : (
                    p.stock
                  )}
                </td>
                <td>
                  {editandoId === p.id ? (
                    <input type="number" step="0.01" name="precio1" value={formEdicion.precio1 || ''} onChange={handleChange} />
                  ) : (
                    p.precio1
                  )}
                </td>
                <td>
                  {editandoId === p.id ? (
                    <input type="number" step="0.01" name="precio2" value={formEdicion.precio2 || ''} onChange={handleChange} />
                  ) : (
                    p.precio2
                  )}
                </td>
                <td>
                  {editandoId === p.id ? (
                    <input type="number" step="0.01" name="precio3" value={formEdicion.precio3 || ''} onChange={handleChange} />
                  ) : (
                    p.precio3
                  )}
                </td>
                <td>
                  {editandoId === p.id ? (
                    <>
                      <button onClick={guardarEdicion} style={{ backgroundColor: 'green', color: 'white' }}>
                        Guardar
                      </button>
                      <button onClick={() => setEditandoId(null)} style={{ marginLeft: '5px' }}>
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => activarEdicion(p)} style={{ backgroundColor: '#007bff', color: 'white', marginRight: '5px' }}>
                        Editar
                      </button>
                      <button onClick={() => eliminarProducto(p.id)} style={{ backgroundColor: '#cc0000', color: 'white' }}>
                        Eliminar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No se encontraron productos</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductosPorDeposito;
