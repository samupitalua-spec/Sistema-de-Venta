import React, { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';
import { Plus, Edit2, Trash2, X, Search } from 'lucide-react';

interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  categoriaId: number;
  categoriaNombre: string;
  precioCompra: number;
  precioVenta: number;
  stockActual: number;
  stockMinimo: number;
  activo: boolean;
}

interface Categoria {
  id: number;
  nombre: string;
}

const Productos = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    codigo: '', nombre: '', categoriaId: '', precioCompra: '', precioVenta: '', stockActual: '', stockMinimo: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        apiClient.get('/productos', { params: { query: searchQuery, categoriaId: filterCategoria || null } }),
        apiClient.get('/categorias')
      ]);
      setProductos(prodRes.data);
      setCategorias(catRes.data.filter((c: any) => c.activa));
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery, filterCategoria]);

  const openModal = (prod?: Producto) => {
    if (prod) {
      setEditingId(prod.id);
      setFormData({
        codigo: prod.codigo,
        nombre: prod.nombre,
        categoriaId: prod.categoriaId.toString(),
        precioCompra: prod.precioCompra.toString(),
        precioVenta: prod.precioVenta.toString(),
        stockActual: prod.stockActual.toString(),
        stockMinimo: prod.stockMinimo.toString(),
      });
    } else {
      setEditingId(null);
      setFormData({ codigo: '', nombre: '', categoriaId: '', precioCompra: '', precioVenta: '', stockActual: '', stockMinimo: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        categoriaId: parseInt(formData.categoriaId),
        precioCompra: parseFloat(formData.precioCompra),
        precioVenta: parseFloat(formData.precioVenta),
        stockActual: parseInt(formData.stockActual),
        stockMinimo: parseInt(formData.stockMinimo),
        activo: true
      };

      if (editingId) {
        await apiClient.put(`/productos/${editingId}`, payload);
      } else {
        await apiClient.post('/productos', payload);
      }
      closeModal();
      fetchData();
    } catch (error: any) {
      console.error("Error saving product", error);
      alert(error.response?.data?.message || "Error al guardar el producto");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Seguro que deseas eliminar/desactivar este producto?")) {
      try {
        await apiClient.delete(`/productos/${id}`);
        fetchData();
      } catch (error) {
        console.error("Error deleting product", error);
        alert("Error al eliminar el producto");
      }
    }
  };

  // Format currency
  const formatCOP = (value: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Productos</h1>
          <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Gestiona el inventario y precios de tus productos</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} style={{ marginRight: '0.5rem' }} /> Nuevo producto
        </button>
      </div>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="flex gap-4">
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input 
              type="text" 
              className="input" 
              placeholder="Buscar por nombre o código..." 
              style={{ paddingLeft: '2.5rem' }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="input" 
            style={{ width: '250px' }}
            value={filterCategoria}
            onChange={e => setFilterCategoria(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
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
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#374151', fontSize: '0.85rem' }}>PRECIO VENTA</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#374151', fontSize: '0.85rem' }}>STOCK</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#374151', fontSize: '0.85rem' }}>ESTADO</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#374151', fontSize: '0.85rem', textAlign: 'right' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {productos.map(prod => (
                <tr key={prod.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '1rem 1.5rem', color: '#6B7280', fontSize: '0.9rem' }}>{prod.codigo}</td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{prod.nombre}</td>
                  <td style={{ padding: '1rem 1.5rem', color: '#6B7280', fontSize: '0.9rem' }}>{prod.categoriaNombre}</td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{formatCOP(prod.precioVenta)}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ color: prod.stockActual <= prod.stockMinimo ? '#EF4444' : 'inherit', fontWeight: prod.stockActual <= prod.stockMinimo ? 600 : 400 }}>
                      {prod.stockActual}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '9999px', 
                      fontSize: '0.75rem', 
                      fontWeight: 500,
                      backgroundColor: prod.activo ? '#D1FAE5' : '#FEE2E2',
                      color: prod.activo ? '#065F46' : '#991B1B'
                    }}>
                      {prod.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4F46E5', marginRight: '1rem' }} onClick={() => openModal(prod)}>
                      <Edit2 size={16} />
                    </button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }} onClick={() => handleDelete(prod.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {productos.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>No se encontraron productos.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem' }}>Código / SKU</label>
                <input type="text" className="input" value={formData.codigo} onChange={e => setFormData({...formData, codigo: e.target.value})} required />
              </div>
              
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem' }}>Nombre del Producto</label>
                <input type="text" className="input" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem' }}>Categoría</label>
                <select className="input" value={formData.categoriaId} onChange={e => setFormData({...formData, categoriaId: e.target.value})} required>
                  <option value="">Seleccione una categoría</option>
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>

              <div className="flex gap-4" style={{ marginBottom: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem' }}>Costo (Compra)</label>
                  <input type="number" className="input" value={formData.precioCompra} onChange={e => setFormData({...formData, precioCompra: e.target.value})} required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem' }}>Precio de Venta</label>
                  <input type="number" className="input" value={formData.precioVenta} onChange={e => setFormData({...formData, precioVenta: e.target.value})} required />
                </div>
              </div>

              <div className="flex gap-4" style={{ marginBottom: '1.5rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem' }}>Stock Inicial</label>
                  <input type="number" className="input" value={formData.stockActual} onChange={e => setFormData({...formData, stockActual: e.target.value})} required disabled={!!editingId} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem' }}>Stock Mínimo</label>
                  <input type="number" className="input" value={formData.stockMinimo} onChange={e => setFormData({...formData, stockMinimo: e.target.value})} required />
                </div>
              </div>

              <div className="flex justify-between">
                <button type="button" className="btn" style={{ backgroundColor: '#F3F4F6', color: '#374151' }} onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Producto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Productos;
