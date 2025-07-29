import React, { useEffect, useState } from 'react';

function SeleccionarCliente() {
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    fetch('http://localhost:4000/clientes')
      .then(res => res.json())
      .then(data => setClientes(data));
  }, []);

  const seleccionar = (cliente) => {
    window.opener.postMessage({ tipo: 'clienteSeleccionado', cliente }, '*');
    window.close();
  };

  const registrarNuevo = () => {
    window.open('/registro-cliente', '_blank');
  };

  return (
    <div>
      <h2>Seleccionar Cliente</h2>
      <ul>
        {clientes.map(c => (
          <li key={c.id}>
            {c.nombre} - <button onClick={() => seleccionar(c)}>Seleccionar</button>
          </li>
        ))}
      </ul>
      <button onClick={registrarNuevo}>Registrar nuevo cliente</button>
    </div>
  );
}

export default SeleccionarCliente;
