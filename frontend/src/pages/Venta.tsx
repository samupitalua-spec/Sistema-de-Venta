import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import { Search, ShoppingCart, Trash2, CreditCard, Banknote, Landmark, X, Printer, PlusCircle } from 'lucide-react';
import TicketVenta from '../components/TicketVenta';

interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  precioVenta: number;
  stockActual: number;
}

interface ItemCarrito {
  producto: Producto;
  cantidad: number;
  descuento: number;
}

interface Pago {
  metodoPago: string;
  monto: number;
}

const Venta = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  
  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [metodoSeleccionado, setMetodoSeleccionado] = useState('Efectivo');
  const [montoPago, setMontoPago] = useState('');

  // Ticket Modal State
  const [ventaExitosaId, setVentaExitosaId] = useState<number | null>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length >= 2) {
        apiClient.get('/productos', { params: { query: searchQuery } })
          .then(res => setProductos(res.data))
          .catch(err => console.error(err));
      } else {
        setProductos([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const agregarAlCarrito = (producto: Producto) => {
    if (producto.stockActual <= 0) {
      alert("No hay stock disponible para este producto");
      return;
    }
    
    setCarrito(prev => {
      const existe = prev.find(item => item.producto.id === producto.id);
      if (existe) {
        if (existe.cantidad >= producto.stockActual) {
          alert("No puedes agregar más del stock disponible");
          return prev;
        }
        return prev.map(item => item.producto.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item);
      }
      return [...prev, { producto, cantidad: 1, descuento: 0 }];
    });
    setSearchQuery('');
    setProductos([]);
  };

  const modificarCantidad = (id: number, delta: number) => {
    setCarrito(prev => prev.map(item => {
      if (item.producto.id === id) {
        const nuevaCant = item.cantidad + delta;
        if (nuevaCant <= 0) return item;
        if (nuevaCant > item.producto.stockActual) {
          alert("No hay más stock disponible");
          return item;
        }
        return { ...item, cantidad: nuevaCant };
      }
      return item;
    }));
  };

  const eliminarDelCarrito = (id: number) => {
    setCarrito(prev => prev.filter(item => item.producto.id !== id));
  };

  const subtotal = carrito.reduce((acc, item) => acc + (item.producto.precioVenta * item.cantidad), 0);
  const descuentoTotal = carrito.reduce((acc, item) => acc + item.descuento, 0);
  const total = subtotal - descuentoTotal;

  const totalPagado = pagos.reduce((acc, pago) => acc + pago.monto, 0);
  const restante = pagos.length === 0 ? total - (parseFloat(montoPago) || 0) : total - totalPagado;

  const agregarPago = (e: React.FormEvent) => {
    e.preventDefault();
    const monto = parseFloat(montoPago);
    if (isNaN(monto) || monto <= 0) return;
    
    setPagos([...pagos, { metodoPago: metodoSeleccionado, monto }]);
    setMontoPago('');
  };

  const confirmarVenta = async () => {
    let pagosFinales = [...pagos];
    
    // Si no han agregado ningún pago manualmente, tomamos el que está en el input
    if (pagosFinales.length === 0) {
      const monto = parseFloat(montoPago);
      if (!isNaN(monto) && monto > 0) {
        pagosFinales.push({ metodoPago: metodoSeleccionado, monto });
      }
    }

    const totalPagadoFinal = pagosFinales.reduce((acc, p) => acc + p.monto, 0);

    if (totalPagadoFinal < total) {
      alert("El pago no cubre el total de la venta.");
      return;
    }

    try {
      const payload = {
        descuentoTotal,
        detalles: carrito.map(item => ({
          productoId: item.producto.id,
          cantidad: item.cantidad,
          descuento: item.descuento
        })),
        pagos: pagosFinales
      };

      const response = await apiClient.post('/ventas', payload);
      setVentaExitosaId(response.data.id);
      setCarrito([]);
      setPagos([]);
      setIsCheckoutOpen(false);
    } catch (error: any) {
      alert(error.response?.data?.message || "Error al registrar la venta");
    }
  };

  const formatCOP = (val: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

  return (
    <div style={{ display: 'flex', height: '100%', gap: '1.5rem' }}>
      {/* Left side: Products and Cart */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input 
            type="text" 
            className="input" 
            placeholder="Buscar producto por nombre o código (Ej: Arroz, 001)..." 
            style={{ paddingLeft: '3rem', height: '3.5rem', fontSize: '1.1rem', backgroundColor: '#FFFFFF', border: '1px solid #D1D5DB' }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {productos.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 10, maxHeight: '300px', overflowY: 'auto', marginTop: '0.5rem', border: '1px solid #E5E7EB' }}>
              {productos.map(p => (
                <div 
                  key={p.id} 
                  style={{ padding: '1rem', borderBottom: '1px solid #F3F4F6', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  onClick={() => agregarAlCarrito(p)}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{p.nombre}</div>
                    <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>Código: {p.codigo} | Stock: {p.stockActual}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{formatCOP(p.precioVenta)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 }}>
          <div style={{ padding: '1rem 1.5rem', backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', fontWeight: 600, color: '#374151' }}>
            Lista de Productos
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {carrito.length === 0 ? (
              <div style={{ padding: '4rem', textAlign: 'center', color: '#9CA3AF' }}>
                <ShoppingCart size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p>El carrito está vacío</p>
                <p style={{ fontSize: '0.85rem' }}>Busca un producto y agrégalo para comenzar la venta</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {carrito.map(item => (
                    <tr key={item.producto.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ fontWeight: 600 }}>{item.producto.nombre}</div>
                        <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>{formatCOP(item.producto.precioVenta)} c/u</div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: '8px', padding: '0.25rem' }}>
                          <button style={{ border: 'none', background: 'white', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }} onClick={() => modificarCantidad(item.producto.id, -1)}>-</button>
                          <span style={{ width: '40px', textAlign: 'center', fontWeight: 600 }}>{item.cantidad}</span>
                          <button style={{ border: 'none', background: 'white', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }} onClick={() => modificarCantidad(item.producto.id, 1)}>+</button>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>
                        {formatCOP(item.producto.precioVenta * item.cantidad)}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                        <button style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer' }} onClick={() => eliminarDelCarrito(item.producto.id)}>
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Summary and Checkout */}
      <div style={{ width: '350px', display: 'flex', flexDirection: 'column' }}>
        <div className="card" style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Resumen de Venta</h2>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#6B7280' }}>
            <span>Subtotal</span>
            <span>{formatCOP(subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#6B7280' }}>
            <span>Descuento</span>
            <span>{formatCOP(descuentoTotal)}</span>
          </div>
          
          <div style={{ height: '1px', backgroundColor: '#E5E7EB', margin: '1rem 0' }}></div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 700 }}>
            <span>Total</span>
            <span style={{ color: 'var(--color-primary)' }}>{formatCOP(total)}</span>
          </div>

          <div style={{ marginTop: 'auto' }}>
            <button 
              className="btn btn-primary w-full" 
              style={{ padding: '1rem', fontSize: '1.1rem' }}
              disabled={carrito.length === 0}
              onClick={() => {
                setPagos([]);
                setMontoPago(total.toString());
                setIsCheckoutOpen(true);
              }}
            >
              Cobrar
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Cobrar Venta</h2>
              <button onClick={() => setIsCheckoutOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <div style={{ backgroundColor: '#F3F4F6', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '0.5rem' }}>Total a Pagar</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>{formatCOP(total)}</div>
            </div>

            <form onSubmit={agregarPago} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <select className="input" style={{ flex: 1 }} value={metodoSeleccionado} onChange={e => setMetodoSeleccionado(e.target.value)}>
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Transferencia">Transferencia</option>
              </select>
              <input type="number" className="input" style={{ flex: 1 }} value={montoPago} onChange={e => setMontoPago(e.target.value)} placeholder="Monto" />
              <button type="submit" className="btn" style={{ backgroundColor: '#10B981', color: 'white' }}>Agregar</button>
            </form>

            {pagos.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Pagos Registrados</h3>
                {pagos.map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {p.metodoPago === 'Efectivo' ? <Banknote size={16} /> : (p.metodoPago === 'Tarjeta' ? <CreditCard size={16} /> : <Landmark size={16} />)}
                      <span style={{ fontWeight: 500 }}>{p.metodoPago}</span>
                    </div>
                    <span style={{ fontWeight: 600 }}>{formatCOP(p.monto)}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #E5E7EB' }}>
              <span style={{ fontWeight: 600, color: restante > 0 ? '#EF4444' : '#10B981' }}>
                {restante > 0 ? `Falta: ${formatCOP(restante)}` : `Cambio: ${formatCOP(Math.abs(restante))}`}
              </span>
            </div>

            <button 
              className="btn btn-primary w-full" 
              style={{ padding: '1rem', fontSize: '1.1rem' }}
              onClick={confirmarVenta}
              disabled={restante > 0}
            >
              Confirmar Venta
            </button>
          </div>
        </div>
      )}

      {/* Ticket Success Modal */}
      {ventaExitosaId && (
        <div className="no-print" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#D1FAE5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Banknote size={32} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>¡Venta Exitosa!</h2>
            <p style={{ color: '#6B7280', marginBottom: '2rem' }}>La venta se ha registrado correctamente en el sistema.</p>
            
            {/* The Ticket Component is rendered but hidden mostly, we'll show it nicely or just use window.print */}
            <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', padding: '1rem', marginBottom: '2rem', maxHeight: '300px', overflowY: 'auto' }}>
              <TicketVenta ventaId={ventaExitosaId} />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                onClick={() => window.print()}
              >
                <Printer size={18} /> Imprimir Ticket
              </button>
              <button 
                className="btn" 
                style={{ flex: 1, backgroundColor: '#F3F4F6', color: '#374151', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                onClick={() => setVentaExitosaId(null)}
              >
                <PlusCircle size={18} /> Nueva Venta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Venta;
