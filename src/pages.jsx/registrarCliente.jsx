import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const RegistrarCliente = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const idInicial = location.state?.idCliente || '';
  const productos = location.state?.productos || [];

  const [cliente, setCliente] = useState({
    id: idInicial,
    nombre: '',
    email: '',
  });

  const handleChange = (e) => {
    setCliente({
      ...cliente,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log('Cliente registrado:', cliente);

    // Redirigir a /ventas con el cliente registrado y productos
    navigate('/ventas', {
      state: { cliente, productos }
    });
  };

  return (
    <div className="registro-cliente">
      <h2>Registrar Cliente</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>ID (DNI):</label>
          <input
            type="text"
            name="id"
            value={cliente.id}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Nombre:</label>
          <input
            type="text"
            name="nombre"
            value={cliente.nombre}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={cliente.email}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Registrar Cliente</button>
      </form>
    </div>
  );
};

export default RegistrarCliente;
