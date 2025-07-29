import { useNavigate } from 'react-router-dom';

function Sidebar() {
  const navigate = useNavigate();

  return (
    <div>
      <button onClick={() => navigate('/')}>Inicio</button>
      <button onClick={() => navigate('/registro')}>Registrar producto</button>
    </div>
  );
}

export default Sidebar;

