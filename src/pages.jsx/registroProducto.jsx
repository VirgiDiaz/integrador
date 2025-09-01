import React, { useState } from 'react';
import '../styles/app.css';

const RegistroProducto = () => {
  const [producto, setProducto] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    stock: '',
    deposito: 'A',
    preciosPorCantidad: [
      { cantidadMinima: 1, precio: '' },
      { cantidadMinima: 10, precio: '' },
      { cantidadMinima: 30, precio: '' }
    ]
  });

  const [imagenes, setImagenes] = useState([]);

  const handleChange = (e) => {
    setProducto({
      ...producto,
      [e.target.name]: e.target.value
    });
  };

  const handlePrecioChange = (index, value) => {
    const nuevosPrecios = [...producto.preciosPorCantidad];
    nuevosPrecios[index].precio = value;
    setProducto({ ...producto, preciosPorCantidad: nuevosPrecios });
  };

  const handleImagenChange = (e) => {
    setImagenes([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!producto.codigo || !producto.nombre || !producto.deposito) {
      alert('Complete todos los campos obligatorios');
      return;
    }

    try {
      // 1. Registrar producto
      const res = await fetch('http://localhost:4000/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo: producto.codigo,
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          deposito: producto.deposito,
          stock: producto.stock,
          precio1: producto.preciosPorCantidad[0]?.precio || 0,
          precio2: producto.preciosPorCantidad[1]?.precio || 0,
          precio3: producto.preciosPorCantidad[2]?.precio || 0
        })
      });

      if (!res.ok) throw new Error('Error al registrar producto');

      const data = await res.json();
      const productoId = data.id;

      // 2. Subir imágenes si existen
      if (imagenes.length > 0) {
        const formData = new FormData();
        imagenes.forEach(img => formData.append("imagenes", img));
        const imgRes = await fetch(`http://localhost:4000/productos/${productoId}/imagenes`, {
          method: "POST",
          body: formData
        });
        if (!imgRes.ok) {
          const errData = await imgRes.json();
          throw new Error(errData.error || "Error al subir imágenes");
        }
      }

      alert('Producto registrado con éxito');

      // Reset formulario
      setProducto({
        codigo: '',
        nombre: '',
        descripcion: '',
        stock: '',
        deposito: 'A',
        preciosPorCantidad: [
          { cantidadMinima: 1, precio: '' },
          { cantidadMinima: 10, precio: '' },
          { cantidadMinima: 30, precio: '' }
        ]
      });
      setImagenes([]);
    } catch (error) {
      console.error(error);
      alert('Error al registrar el producto');
    }
  };

  return (
    <div className="container">
      <h2>Registrar Producto</h2>
      <form onSubmit={handleSubmit}>

        <div className="section">
          <label>Código:</label>
          <input
            name="codigo"
            value={producto.codigo}
            onChange={handleChange}
            placeholder="Ingrese código"
            required
          />
        </div>

        <div className="section">
          <label>Nombre:</label>
          <input
            name="nombre"
            value={producto.nombre}
            onChange={handleChange}
            placeholder="Ingrese nombre del producto"
            required
          />
        </div>

        <div className="section">
          <label>Descripción:</label>
          <input
            name="descripcion"
            value={producto.descripcion}
            onChange={handleChange}
            placeholder="Marca / Detalle del producto"
          />
        </div>

        <div className="section">
          <label>Depósito:</label>
          <select
            name="deposito"
            value={producto.deposito}
            onChange={handleChange}
          >
            <option value="A">A</option>
            <option value="B">B</option>
          </select>
        </div>

        <div className="section">
          <h3>Precios por Cantidad:</h3>
          {producto.preciosPorCantidad.map((item, index) => (
            <div key={index} className="card">
              <label>Cant. ≥ {item.cantidadMinima}:</label>
              <input
                type="number"
                value={item.precio}
                placeholder="Precio"
                onChange={(e) => handlePrecioChange(index, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="section">
          <label>Stock actual:</label>
          <input
            type="number"
            name="stock"
            value={producto.stock}
            placeholder="Cantidad en stock"
            onChange={handleChange}
            required
          />
        </div>

        <div className="section">
          <label>Imágenes del producto:</label>
          <input
            type="file"
            multiple
            accept="image/png, image/jpeg"
            onChange={handleImagenChange}
          />
          {imagenes.length > 0 && (
            <p>{imagenes.length} archivo(s) seleccionado(s)</p>
          )}
        </div>

        <button type="submit">Confirmar</button>
      </form>
    </div>
  );
};

export default RegistroProducto;
