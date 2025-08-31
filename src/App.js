import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components.jsx/sidebar';
import Home from './pages.jsx/home';
import RegistroProducto from './pages.jsx/registroProducto';
import Ventas from './pages.jsx/ventas';
import RegistrarCliente from './pages.jsx/registrarCliente';
import ProductosPorDeposito from './pages.jsx/productosPorDeposito';
import './styles/app.css';
import Clientes from './pages.jsx/clientes';



function App() {
  return (
    <div>
      <Sidebar />
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/registro" element={<RegistroProducto />} />
          <Route path="/ventas" element={<Ventas />} />
          <Route path="/registrar-cliente" element={<RegistrarCliente />} />
          <Route path="/productos-deposito" element={<ProductosPorDeposito />} />
          <Route path="/clientes" element={<Clientes />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
