
export default function Sidebar({ cambiarVista }) {
  return (
    <div>
      <div>☰</div>
      <ul>
        <li>
          <button onClick={() => cambiarVista('home')}>Home</button>
        </li>
        <li>
          <button onClick={() => cambiarVista('registro')}>Registrar Producto</button>
        </li>
        <li>
          <button onClick={() => cambiarVista('ventas')}>Ventas</button>
        </li>
        <li>
          <button onClick={() => alert('Configuración no implementado')}>Configuración</button>
        </li>
      </ul>
    </div>
  );
}
