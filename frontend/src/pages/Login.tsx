import React, { useState } from 'react';
import { Store, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';
import './Login.css';

const Login: React.FC = () => {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await apiClient.post('/auth/login', { usuario, contrasena });
      if (response.data.token) {
        login(response.data.token, response.data.usuario);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    }
  };

  return (
    <div className="login-layout">
      {/* Left side */}
      <div className="login-sidebar">
        <div className="login-sidebar-content">
          <div className="login-brand">
            <div className="login-logo">
              <Store size={24} color="#FFFFFF" />
            </div>
            <span className="login-brand-text">Sistema de Ventas</span>
          </div>

          <div className="login-hero">
            <h1>Vende más y controla<br/>mejor tu negocio.</h1>
            <p className="login-subtitle">
              Ventas, inventario y reportes en un solo lugar, simple y rápido de usar.
            </p>

            <ul className="login-features">
              <li>
                <CheckCircle2 size={20} className="feature-icon" />
                Registra ventas con descuentos y pago mixto
              </li>
              <li>
                <CheckCircle2 size={20} className="feature-icon" />
                El inventario se actualiza solo con cada venta
              </li>
              <li>
                <CheckCircle2 size={20} className="feature-icon" />
                Dashboard con ganancias y productos más vendidos
              </li>
            </ul>
          </div>
        </div>
        <div className="login-blob"></div>
        <div className="login-footer-text">© 2026 Sistema de Ventas</div>
      </div>

      {/* Right side */}
      <div className="login-main">
        <div className="login-card">
          <h2>Iniciar sesión</h2>
          <p className="login-card-subtitle">Ingresa tus credenciales para acceder al panel.</p>
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Usuario</label>
              <input 
                type="text" 
                className="input" 
                placeholder="Ingresa tu usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Contraseña</label>
              <input 
                type="password" 
                className="input" 
                placeholder="••••••••"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required 
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn btn-primary w-full login-btn">
              Ingresar
            </button>
          </form>

          <div className="login-card-footer">
            Acceso exclusivo para el dueño del negocio
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
