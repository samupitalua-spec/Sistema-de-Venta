import React, { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';
import { DollarSign, ShoppingBag, AlertCircle, PackageSearch } from 'lucide-react';
import './Dashboard.css';

interface Resumen {
  ventasHoy: number;
  ventasMes: number;
  totalProductos: number;
  productosBajoStock: number;
  topProductos: { nombre: string, cantidadVendida: number, totalRecaudado: number }[];
  ventasUltimos7Dias: { fecha: string, total: number }[];
}

const Dashboard = () => {
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await apiClient.get('/dashboard/resumen');
        setResumen(response.data);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading || !resumen) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando estadísticas...</div>;
  }

  const formatCOP = (val: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

  // Calcular máximo de ventas para el gráfico de barras
  const maxVentaDia = Math.max(...resumen.ventasUltimos7Dias.map(v => v.total), 1); // Evitar división por cero

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard General</h1>
        <p className="dashboard-subtitle">Resumen y analítica de tu negocio</p>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-icon bg-indigo">
            <DollarSign size={24} />
          </div>
          <div className="metric-info">
            <p className="metric-label">Ventas Hoy</p>
            <h3 className="metric-value text-indigo">{formatCOP(resumen.ventasHoy)}</h3>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon bg-emerald">
            <ShoppingBag size={24} />
          </div>
          <div className="metric-info">
            <p className="metric-label">Ventas del Mes</p>
            <h3 className="metric-value text-emerald">{formatCOP(resumen.ventasMes)}</h3>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon bg-blue">
            <PackageSearch size={24} />
          </div>
          <div className="metric-info">
            <p className="metric-label">Total Productos</p>
            <h3 className="metric-value text-blue">{resumen.totalProductos}</h3>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon bg-rose">
            <AlertCircle size={24} />
          </div>
          <div className="metric-info">
            <p className="metric-label">Alertas de Stock</p>
            <h3 className="metric-value text-rose">{resumen.productosBajoStock}</h3>
          </div>
        </div>
      </div>

      <div className="dashboard-charts-grid">
        {/* Gráfico de Ventas últimos 7 días */}
        <div className="chart-card">
          <h3 className="chart-title">Ventas (Últimos 7 Días)</h3>
          <div className="bar-chart-container">
            {resumen.ventasUltimos7Dias.map((v, idx) => {
              const heightPct = (v.total / maxVentaDia) * 100;
              const dateObj = new Date(v.fecha + "T00:00:00");
              const dayName = dateObj.toLocaleDateString('es-CO', { weekday: 'short' });
              
              return (
                <div key={idx} className="bar-column">
                  <div className="bar-tooltip">{formatCOP(v.total)}</div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ height: `${heightPct}%` }}></div>
                  </div>
                  <span className="bar-label">{dayName}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 5 Productos */}
        <div className="chart-card">
          <h3 className="chart-title">Top Productos Más Vendidos</h3>
          <div className="top-products-list">
            {resumen.topProductos.length === 0 ? (
              <p style={{ color: '#6B7280', textAlign: 'center', marginTop: '2rem' }}>Aún no hay ventas registradas.</p>
            ) : (
              resumen.topProductos.map((p, idx) => (
                <div key={idx} className="top-product-item">
                  <div className="top-product-rank">{idx + 1}</div>
                  <div className="top-product-details">
                    <h4 className="top-product-name">{p.nombre}</h4>
                    <span className="top-product-revenue">{formatCOP(p.totalRecaudado)}</span>
                  </div>
                  <div className="top-product-qty">
                    <span>{p.cantidadVendida}</span>
                    <small>unds</small>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
