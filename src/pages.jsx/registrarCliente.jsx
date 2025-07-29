import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function RegistroCliente() {
  const [nombre, setNombre] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const idCliente = location.state?.idCliente || '';
  const productos = location.state?.productos || [];

  const registrar = async () => {
    try {
      const res = await fetch('http://localhost:4000/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: idCliente, nombre }),
      });

      if (res.ok) {
        const cliente = await res.json();
        navigate('/ventas', { state: { cliente, reconocidos: productos, noReconocidos: [] } });
      } else {
        alert('Error al registrar cliente');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h2>Registrar Cliente</h2>
      <p>DNI: {idCliente}</p>
      <input
        type="text"
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <button onClick={registrar}>Registrar</button>
    </div>
  );
}

export default RegistroCliente;
