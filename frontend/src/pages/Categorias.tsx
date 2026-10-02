import React, { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  activa: boolean;
}

const Categorias = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form state
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const fetchCategorias = async () => {
    try {
      const response = await apiClient.get('/categorias');
      setCategorias(response.data);
    } catch (error) {
      console.error("Error fetching categorias", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const openModal = (cat?: Categoria) => {
    if (cat) {
      setEditingId(cat.id);
      setNombre(cat.nombre);
      setDescripcion(cat.descripcion || '');
    } else {
      setEditingId(null);
      setNombre('');
      setDescripcion('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiClient.put(`/categorias/${editingId}`, { nombre, descripcion });
      } else {
        await apiClient.post('/categorias', { nombre, descripcion });
      }
      closeModal();
      fetchCategorias();
    } catch (error) {
      console.error("Error saving categoria", error);
      alert("Error al guardar la categoría");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Seguro que deseas eliminar/desactivar esta categoría?")) {
      try {
        await apiClient.delete(`/categorias/${id}`);
        fetchCategorias();
      } catch (error) {
        console.error("Error deleting categoria", error);
        alert("Error al eliminar la categoría");
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Categorías</h1>
          <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Gestiona las categorías de tus productos</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} style={{ marginRight: '0.5rem' }} /> Nueva categoría
        </button>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', textAlign: 'left' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#374151', fontSize: '0.85rem' }}>NOMBRE</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#374151', fontSize: '0.85rem' }}>DESCRIPCIÓN</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#374151', fontSize: '0.85rem' }}>ESTADO</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#374151', fontSize: '0.85rem', textAlign: 'right' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map(cat => (
                <tr key={cat.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{cat.nombre}</td>
                  <td style={{ padding: '1rem 1.5rem', color: '#6B7280' }}>{cat.descripcion || '-'}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '9999px', 
                      fontSize: '0.75rem', 
                      fontWeight: 500,
                      backgroundColor: cat.activa ? '#D1FAE5' : '#FEE2E2',
                      color: cat.activa ? '#065F46' : '#991B1B'
                    }}>
                      {cat.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4F46E5', marginRight: '1rem' }} onClick={() => openModal(cat)}>
                      <Edit2 size={16} />
                    </button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }} onClick={() => handleDelete(cat.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {categorias.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>No hay categorías registradas.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{editingId ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem' }}>Nombre</label>
                <input type="text" className="input" value={nombre} onChange={e => setNombre(e.target.value)} required />
              </div>
              
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem' }}>Descripción (Opcional)</label>
                <textarea className="input" value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={3} />
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
export default Categorias;
