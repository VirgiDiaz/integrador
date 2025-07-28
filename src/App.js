import React, { useState } from 'react';
import Sidebar from './components.jsx/sidebar';
import Home from './pages/home';
import RegistroProducto from './pages/registroProducto';
import Ventas from './pages/ventas';

function App() {
  const [vista, setVista] = useState('home');

  return (
    <div>
      <Sidebar cambiarVista={setVista} />
      <div>
        {vista === 'home' && <Home />}
        {vista === 'registro' && <RegistroProducto />}
        {vista === 'ventas' && <Ventas />}
      </div>
    </div>
  );
}

export default App;
