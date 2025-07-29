import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components.jsx/sidebar';
import Home from './pages.jsx/home';
import RegistroProducto from './pages.jsx/registroProducto';
import Ventas from './pages.jsx/ventas';
import SeleccionarCliente from './pages.jsx/seleccionarCliente';
import RegistroCliente from './pages.jsx/registrarCliente';

function App() {
  return (
    <div>
      <Sidebar />
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/registro" element={<RegistroProducto />} />
          <Route path="/ventas" element={<Ventas />} />
          <Route path="/seleccionar-cliente" element={<SeleccionarCliente />} />
          <Route path="/registro-cliente" element={<RegistroCliente />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
