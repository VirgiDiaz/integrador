import React from 'react';
import { useNavigate } from 'react-router-dom';
import Camara from '../components.jsx/Camara';


export default function Home() {
  const navigate = useNavigate();

  const simularReconocimiento = async (base64) => {
    const res = await fetch('http://localhost:4000/productos?nombre=martillo');
    const productos = await res.json();

    const reconocidos = productos.length ? productos : [];
    const noReconocidos = productos.length ? [] : [{ nombre: 'Producto desconocido' }];

    navigate('/ventas', {
      state: { reconocidos, noReconocidos }
    });
  };

  return (
    <div className="home-container">
      <h2 className="titulo">Bienvenido al Home</h2>
      <Camara onCapturar={simularReconocimiento} />
    </div>
  );
}
