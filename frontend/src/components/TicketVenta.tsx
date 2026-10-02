import React, { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';

interface TicketVentaProps {
  ventaId: number;
}

const TicketVenta: React.FC<TicketVentaProps> = ({ ventaId }) => {
  const [ticketData, setTicketData] = useState<any>(null);

  useEffect(() => {
    apiClient.get(`/ventas/${ventaId}`).then(res => setTicketData(res.data)).catch(console.error);
  }, [ventaId]);

  if (!ticketData) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando ticket...</div>;

  const formatCOP = (val: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

  return (
    <div id="ticket-printable" style={{ padding: '20px', fontFamily: 'monospace', fontSize: '14px', maxWidth: '320px', margin: '0 auto', color: '#000', backgroundColor: '#fff' }}>
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>SISTEMA DE VENTAS</h2>
        <p style={{ margin: '2px 0' }}>NIT: 123456789-0</p>
        <p style={{ margin: '2px 0' }}>Tel: 300 000 0000</p>
        <p style={{ margin: '10px 0 5px 0' }}>--------------------------------</p>
        <h3 style={{ margin: '5px 0', fontSize: '16px' }}>TICKET DE VENTA</h3>
        <p style={{ margin: '2px 0' }}>N°: {ticketData.numero}</p>
        <p style={{ margin: '2px 0' }}>Fecha: {new Date(ticketData.fecha).toLocaleString()}</p>
        <p style={{ margin: '5px 0 10px 0' }}>--------------------------------</p>
      </div>

      <table style={{ width: '100%', fontSize: '13px', textAlign: 'left', borderCollapse: 'collapse', marginBottom: '10px' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px dashed #000', paddingBottom: '4px', width: '15%' }}>Cant</th>
            <th style={{ borderBottom: '1px dashed #000', paddingBottom: '4px', width: '55%' }}>Descripción</th>
            <th style={{ borderBottom: '1px dashed #000', paddingBottom: '4px', width: '30%', textAlign: 'right' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {ticketData.detalles.map((d: any, idx: number) => (
            <tr key={idx}>
              <td style={{ paddingTop: '6px', verticalAlign: 'top' }}>{d.cantidad}</td>
              <td style={{ paddingTop: '6px', paddingRight: '4px' }}>
                <div style={{ fontWeight: 'bold' }}>{d.productoNombre}</div>
                <div style={{ fontSize: '11px', color: '#555' }}>{formatCOP(d.precioUnitario)} c/u</div>
              </td>
              <td style={{ paddingTop: '6px', textAlign: 'right', verticalAlign: 'top' }}>{formatCOP(d.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #000' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>Subtotal:</span>
          <span>{formatCOP(ticketData.subtotal)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>Descuento:</span>
          <span>{formatCOP(ticketData.descuentoTotal)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', marginTop: '8px' }}>
          <span>TOTAL:</span>
          <span>{formatCOP(ticketData.total)}</span>
        </div>
      </div>

      <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #000' }}>
        <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Formas de Pago:</p>
        {ticketData.pagos.map((p: any, idx: number) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span>{p.metodoPago}</span>
            <span>{formatCOP(p.monto)}</span>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '25px', fontSize: '13px', borderTop: '1px dashed #000', paddingTop: '15px' }}>
        <p style={{ margin: '2px 0', fontWeight: 'bold' }}>¡GRACIAS POR SU COMPRA!</p>
        <p style={{ margin: '2px 0', fontSize: '11px' }}>Vuelva pronto</p>
      </div>
    </div>
  );
};

export default TicketVenta;
