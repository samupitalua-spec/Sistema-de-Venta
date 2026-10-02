import React, { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';
import { Clock, Printer, Search } from 'lucide-react';
import TicketVenta from '../components/TicketVenta';

interface VentaHistorial {
  id: number;
  numero: string;
  fecha: string;
  total: number;
  estado: string;
}

const Historial = () => {
  const [ventas, setVentas] = useState<VentaHistorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Para reimprimir
  const [ventaReimprimir, setVentaReimprimir] = useState<number | null>(null);

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const response = await apiClient.get('/ventas');
        setVentas(response.data);
      } catch (error) {
        console.error("Error fetching historial", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistorial();
  }, []);

  const formatCOP = (val: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString('es-CO');

  const filteredVentas = ventas.filter(v => v.numero.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>Historial de Ventas</h1>
        <p style={{ color: '#6B7280' }}>Consulta todas las ventas registradas y reimprime tickets.</p>
      </div>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input 
            type="text" 
            className="input" 
            placeholder="Buscar por número de ticket (Ej: TKT-0001)..." 
            style={{ paddingLeft: '2.5rem' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>Cargando historial...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Ticket</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Fecha</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontWeight: 600, color: '#374151' }}>Estado</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 600, color: '#374151' }}>Total</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontWeight: 600, color: '#374151' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredVentas.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>
                    <Clock size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    No se encontraron ventas.
                  </td>
                </tr>
              ) : (
                filteredVentas.map(venta => (
                  <tr key={venta.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{venta.numero}</td>
                    <td style={{ padding: '1rem 1.5rem', color: '#4B5563' }}>{formatDate(venta.fecha)}</td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                      <span style={{ 
                        backgroundColor: venta.estado === 'Completada' ? '#D1FAE5' : '#FEF2F2', 
                        color: venta.estado === 'Completada' ? '#065F46' : '#991B1B', 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '9999px', 
                        fontSize: '0.85rem', 
                        fontWeight: 500 
                      }}>
                        {venta.estado}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 700 }}>
                      {formatCOP(venta.total)}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                      <button 
                        className="btn" 
                        style={{ backgroundColor: '#F3F4F6', color: '#374151', padding: '0.5rem', borderRadius: '8px' }}
                        onClick={() => setVentaReimprimir(venta.id)}
                        title="Reimprimir Ticket"
                      >
                        <Printer size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal para Reimprimir Ticket */}
      {ventaReimprimir && (
        <div className="no-print" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Reimprimir Ticket</h2>
              <button onClick={() => setVentaReimprimir(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
            </div>
            
            <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', padding: '1rem', marginBottom: '2rem', maxHeight: '300px', overflowY: 'auto' }}>
              <TicketVenta ventaId={ventaReimprimir} />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className="btn btn-primary w-full" 
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                onClick={() => window.print()}
              >
                <Printer size={18} /> Imprimir Ahora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Historial;
