import React, { useState } from 'react';

const RegistroProducto = () => {
  const [producto, setProducto] = useState({
    codigo: '',
    nombre: '',
    stock: '',
    preciosPorCantidad: [
      { cantidadMinima: 1, precio: '' },
      { cantidadMinima: 10, precio: '' },
      { cantidadMinima: 30, precio: '' }
    ]
  });

  const handleChange = (e) => {
    setProducto({
      ...producto,
      [e.target.name]: e.target.value
    });
  };

  const handlePrecioChange = (index, value) => {
    const nuevosPrecios = [...producto.preciosPorCantidad];
    nuevosPrecios[index].precio = value;

    setProducto({
      ...producto,
      preciosPorCantidad: nuevosPrecios
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Producto registrado:', producto);
  };

  return (
    <div className="registro-producto">
      <h2>Registrar Producto</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Código:</label>
          <input
            name="codigo"
            value={producto.codigo}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Nombre:</label>
          <input
            name="nombre"
            value={producto.nombre}
            onChange={handleChange}
          />
        </div>

        <h4>Precios por Cantidad:</h4>
        {producto.preciosPorCantidad.map((item, index) => (
          <div key={index}>
            <label>Cant. ≥ {item.cantidadMinima}:</label>
            <input
              type="number"
              value={item.precio}
              onChange={(e) => handlePrecioChange(index, e.target.value)}
              
            />
          </div>
        ))}

        <div>
          <label>Stock actual:</label>
          <input
            type="number"
            name="stock"
            value={producto.stock}
            onChange={handleChange}
          />
        </div>

        <button type="submit">Confirmar</button>
      </form>
    </div>
  );
};

export default RegistroProducto;
