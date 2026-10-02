using Microsoft.EntityFrameworkCore;
using SistemaVentas.API.Data;
using SistemaVentas.API.DTOs;
using SistemaVentas.API.Entities;

namespace SistemaVentas.API.Services
{
    public class VentasService : IVentasService
    {
        private readonly ApplicationDbContext _context;

        public VentasService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<VentaResponseDto> RegistrarVentaAsync(RegistrarVentaDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var venta = new Venta
                {
                    Numero = "V-" + DateTime.Now.Ticks.ToString().Substring(8),
                    Fecha = DateTime.UtcNow,
                    DescuentoTotal = dto.DescuentoTotal,
                    Estado = "Completada"
                };

                decimal subtotalAcumulado = 0;

                foreach (var det in dto.Detalles)
                {
                    var producto = await _context.Productos.FindAsync(det.ProductoId);
                    if (producto == null) throw new Exception($"Producto con ID {det.ProductoId} no encontrado.");
                    if (producto.StockActual < det.Cantidad) throw new Exception($"Stock insuficiente para {producto.Nombre}.");

                    producto.StockActual -= det.Cantidad;

                    // Registro de movimiento (salida por venta)
                    _context.MovimientosInventario.Add(new MovimientoInventario
                    {
                        ProductoId = producto.Id,
                        Tipo = "Salida",
                        Cantidad = det.Cantidad,
                        Fecha = DateTime.UtcNow,
                        Motivo = "Venta",
                        Venta = venta
                    });

                    var precioFinal = producto.PrecioVenta;
                    var totalLinea = (precioFinal * det.Cantidad) - det.Descuento;

                    subtotalAcumulado += totalLinea + det.Descuento;

                    venta.Detalles.Add(new DetalleVenta
                    {
                        ProductoId = producto.Id,
                        Cantidad = det.Cantidad,
                        PrecioUnitario = precioFinal,
                        CostoUnitario = producto.PrecioCompra,
                        Descuento = det.Descuento,
                        Subtotal = totalLinea
                    });
                }

                venta.Subtotal = subtotalAcumulado;
                venta.Total = subtotalAcumulado - venta.DescuentoTotal;

                var totalPagado = dto.Pagos.Sum(p => p.Monto);
                if (totalPagado < venta.Total)
                    throw new Exception("El monto pagado es menor al total de la venta.");

                foreach (var pago in dto.Pagos)
                {
                    venta.Pagos.Add(new PagoVenta
                    {
                        MetodoPago = pago.MetodoPago,
                        Monto = pago.Monto
                    });
                }

                _context.Ventas.Add(venta);
                await _context.SaveChangesAsync();

                // Asociar la venta a los movimientos de inventario recién creados (opcional pero recomendado si se requiere trazabilidad)
                // We do it by saving changes first so we get the Venta ID, then updating the movements
                // But MovimientoInventario is already tracked, wait, we need VentaId.
                
                await transaction.CommitAsync();

                return new VentaResponseDto
                {
                    Id = venta.Id,
                    Numero = venta.Numero,
                    Total = venta.Total
                };
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<VentaDetalleDto?> GetVentaByIdAsync(int id)
        {
            var venta = await _context.Ventas
                .Include(v => v.Detalles)
                    .ThenInclude(d => d.Producto)
                .Include(v => v.Pagos)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (venta == null) return null;

            return new VentaDetalleDto
            {
                Id = venta.Id,
                Numero = venta.Numero,
                Fecha = venta.Fecha,
                Subtotal = venta.Subtotal,
                DescuentoTotal = venta.DescuentoTotal,
                Total = venta.Total,
                Estado = venta.Estado,
                Detalles = venta.Detalles.Select(d => new ItemDetalleDto
                {
                    ProductoNombre = d.Producto.Nombre,
                    Cantidad = d.Cantidad,
                    PrecioUnitario = d.PrecioUnitario,
                    Subtotal = d.Subtotal
                }).ToList(),
                Pagos = venta.Pagos.Select(p => new ItemPagoDto
                {
                    MetodoPago = p.MetodoPago,
                    Monto = p.Monto
                }).ToList()
            };
        }

        public async Task<List<VentaHistorialDto>> GetHistorialAsync()
        {
            return await _context.Ventas
                .OrderByDescending(v => v.Fecha)
                .Select(v => new VentaHistorialDto
                {
                    Id = v.Id,
                    Numero = v.Numero,
                    Fecha = v.Fecha,
                    Total = v.Total,
                    Estado = v.Estado
                })
                .ToListAsync();
        }
    }
}
