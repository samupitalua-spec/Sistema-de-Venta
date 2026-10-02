import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ShoppingCart, Package, Tags, ClipboardList, Clock, LogOut, Store } from 'lucide-react';
import './Layout.css';

const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="app-sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <Store size={20} color="#FFFFFF" />
        </div>
        <div>
          <span className="sidebar-brand-text">Sistema de Ventas</span>
          <span className="sidebar-brand-sub">Panel del dueño</span>
        </div>
      </div>
      
      <div className="sidebar-menu-title">MENÚ</div>
      <nav className="sidebar-nav">
        <NavLink to="/" className={({isActive}) => isActive ? "nav-link active" : "nav-link"} end>
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>
        <NavLink to="/venta" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <ShoppingCart size={18} /> Nueva venta
        </NavLink>
        <NavLink to="/productos" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <Package size={18} /> Productos
        </NavLink>
        <NavLink to="/categorias" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <Tags size={18} /> Categorías
        </NavLink>
        <NavLink to="/inventario" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <ClipboardList size={18} /> Inventario
        </NavLink>
        <NavLink to="/historial" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <Clock size={18} /> Historial de ventas
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">{user?.charAt(0).toUpperCase()}</div>
          <div className="user-info">
            <span className="user-name">{user}</span>
            <span className="user-role">Administrador</span>
          </div>
        </div>
        <button className="logout-btn" onClick={logout}>
          <LogOut size={18} /> Cerrar sesión
        </button>
      </div>
    </div>
  );
};
export default Sidebar;
