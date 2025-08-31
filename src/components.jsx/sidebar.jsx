import { useNavigate } from 'react-router-dom';
import '../styles/sidebar.css'; // Creamos estilos separados

function Sidebar() {
  const navigate = useNavigate();

  return (
    <div className="navbar">
      <div className="navbar-title">Escáner de productos</div>
      <div className="navbar-buttons">
        <button onClick={() => navigate('/')} className="nav-button">Inicio</button>
        <button onClick={() => navigate('/registro')} className="nav-button">Registrar producto</button>
        <button onClick={() => navigate('/productos-deposito')} className="nav-button">Depósito</button>
        <button onClick={() => navigate('/clientes')} className="nav-button">Clientes</button>
      </div>
    </div>
  );
}

export default Sidebar;
