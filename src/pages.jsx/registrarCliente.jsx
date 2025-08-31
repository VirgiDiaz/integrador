import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/app.css';

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
    <div className="container">
      <h2>Registrar Cliente</h2>
      <form onSubmit={handleSubmit}>
        <div className="section">
          <label>ID (DNI):</label>
          <input
            type="text"
            name="id"
            value={cliente.id}
            onChange={handleChange}
            required
            placeholder="Ingrese DNI"
          />
        </div>

        <div className="section">
          <label>Nombre:</label>
          <input
            type="text"
            name="nombre"
            value={cliente.nombre}
            onChange={handleChange}
            required
            placeholder="Ingrese nombre completo"
          />
        </div>

        <div className="section">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={cliente.email}
            onChange={handleChange}
            required
            placeholder="correo@ejemplo.com"
          />
        </div>

        <button type="submit">Registrar Cliente</button>
      </form>
    </div>
  );
};

export default RegistrarCliente;
