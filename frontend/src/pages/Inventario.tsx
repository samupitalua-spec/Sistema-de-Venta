import React, { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';
import { Search, History, ArrowRightLeft, X } from 'lucide-react';

interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  categoriaNombre: string;
  stockActual: number;
  stockMinimo: number;
}

interface Movimiento {
  id: number;
  productoNombre: string;
  tipoMovimiento: string;
  cantidad: number;
  fecha: string;
  observacion: string;
}

const Inventario = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'stock' | 'historial'>('stock');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    tipoMovimiento: 'Entrada', cantidad: '', observacion: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'stock') {
        const res = await apiClient.get('/productos', { params: { query: searchQuery } });
        setProductos(res.data);
      } else {
        const res = await apiClient.get('/inventario/movimientos');
        setMovimientos(res.data);
      }
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery, activeTab]);

  const openModal = (prod: Producto) => {
    setSelectedProduct(prod);
    setFormData({ tipoMovimiento: 'Entrada', cantidad: '', observacion: '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      await apiClient.post('/inventario/movimientos', {
        productoId: selectedProduct.id,
        tipoMovimiento: formData.tipoMovimiento,
        cantidad: parseInt(formData.cantidad),
        observacion: formData.observacion
      });
      closeModal();
      fetchData();
    } catch (error: any) {
      console.error("Error registering movement", error);
      alert(error.response?.data?.message || "Error al registrar el movimiento");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Inventario</h1>
          <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Controla el stock y registra entradas de mercancía</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className={`btn ${activeTab === 'stock' ? 'btn-primary' : ''}`}
            style={activeTab === 'stock' ? {} : { backgroundColor: '#F3F4F6', color: '#374151' }}
            onClick={() => setActiveTab('stock')}
          >
            Estado de Stock
          </button>
          <button 
            className={`btn ${activeTab === 'historial' ? 'btn-primary' : ''}`}
            style={activeTab === 'historial' ? {} : { backgroundColor: '#F3F4F6', color: '#374151' }}
            onClick={() => setActiveTab('historial')}
          >
            <History size={16} style={{ marginRight: '0.5rem' }} /> Historial Movimientos
          </button>
        </div>
      </div>

      {activeTab === 'stock' && (
        <>
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input 
                type="text" 
                className="input" 
                placeholder="Buscar producto por nombre o código..." 
                style={{ paddingLeft: '2.5rem' }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', textAlign: 'left' }}>
                  <tr>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#374151', fontSize: '0.85rem' }}>CÓDIGO</th>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#374151', fontSize: '0.85rem' }}>PRODUCTO</th>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#374151', fontSize: '0.85rem' }}>CATEGORÍA</th>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#374151', fontSize: '0.85rem' }}>STOCK MÍNIMO</th>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#374151', fontSize: '0.85rem' }}>STOCK ACTUAL</th>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#374151', fontSize: '0.85rem', textAlign: 'right' }}>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map(prod => {
                    const isLowStock = prod.stockActual <= prod.stockMinimo;
                    return (
                      <tr key={prod.id} style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: isLowStock ? '#FEF2F2' : 'transparent' }}>
                        <td style={{ padding: '1rem 1.5rem', color: '#6B7280', fontSize: '0.9rem' }}>{prod.codigo}</td>
                        <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{prod.nombre}</td>
                        <td style={{ padding: '1rem 1.5rem', color: '#6B7280', fontSize: '0.9rem' }}>{prod.categoriaNombre}</td>
                        <td style={{ padding: '1rem 1.5rem' }}>{prod.stockMinimo}</td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <span style={{ 
                            color: isLowStock ? '#DC2626' : '#059669', 
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            {prod.stockActual}
                            {isLowStock && <span style={{ fontSize: '0.75rem', backgroundColor: '#FEE2E2', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Bajo</span>}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} 
                            onClick={() => openModal(prod)}
                          >
                            <ArrowRightLeft size={14} style={{ marginRight: '0.4rem' }} /> Ajustar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {productos.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>No se encontraron productos.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {activeTab === 'historial' && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', textAlign: 'left' }}>
                <tr>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#374151', fontSize: '0.85rem' }}>FECHA</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#374151', fontSize: '0.85rem' }}>PRODUCTO</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#374151', fontSize: '0.85rem' }}>TIPO</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#374151', fontSize: '0.85rem' }}>CANTIDAD</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#374151', fontSize: '0.85rem' }}>OBSERVACIÓN</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map(mov => (
                  <tr key={mov.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '1rem 1.5rem', color: '#6B7280', fontSize: '0.9rem' }}>{new Date(mov.fecha).toLocaleString()}</td>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{mov.productoNombre}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '9999px', 
                        fontSize: '0.75rem', 
                        fontWeight: 500,
                        backgroundColor: mov.tipoMovimiento === 'Entrada' ? '#D1FAE5' : (mov.tipoMovimiento === 'Salida' ? '#FEE2E2' : '#FEF3C7'),
                        color: mov.tipoMovimiento === 'Entrada' ? '#065F46' : (mov.tipoMovimiento === 'Salida' ? '#991B1B' : '#92400E')
                      }}>
                        {mov.tipoMovimiento}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>
                      {mov.tipoMovimiento === 'Salida' ? '-' : (mov.tipoMovimiento === 'Entrada' ? '+' : '')}{mov.cantidad}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: '#6B7280', fontSize: '0.9rem' }}>{mov.observacion || '-'}</td>
                  </tr>
                ))}
                {movimientos.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>No hay movimientos registrados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {isModalOpen && selectedProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Ajustar Stock</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151', fontWeight: 600 }}>{selectedProduct.nombre}</p>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#6B7280' }}>Stock Actual: {selectedProduct.stockActual}</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem' }}>Tipo de Movimiento</label>
                <select className="input" value={formData.tipoMovimiento} onChange={e => setFormData({...formData, tipoMovimiento: e.target.value})} required>
                  <option value="Entrada">Entrada (Añadir)</option>
                  <option value="Salida">Salida (Mermas / Pérdidas)</option>
                  <option value="Ajuste">Ajuste Libre (+ o -)</option>
                </select>
              </div>
              
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem' }}>Cantidad</label>
                <input type="number" className="input" value={formData.cantidad} onChange={e => setFormData({...formData, cantidad: e.target.value})} required />
              </div>
              
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem' }}>Observación (Opcional)</label>
                <textarea className="input" value={formData.observacion} onChange={e => setFormData({...formData, observacion: e.target.value})} rows={2} placeholder="Ej: Mercancía recibida del proveedor..." />
              </div>

              <div className="flex justify-between">
                <button type="button" className="btn" style={{ backgroundColor: '#F3F4F6', color: '#374151' }} onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Inventario;
