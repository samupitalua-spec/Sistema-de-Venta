using Microsoft.EntityFrameworkCore;
using SistemaVentas.API.Data;
using SistemaVentas.API.DTOs;
using SistemaVentas.API.Entities;

namespace SistemaVentas.API.Services
{
    public class InventarioService : IInventarioService
    {
        private readonly ApplicationDbContext _context;

        public InventarioService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MovimientoInventarioDto>> GetMovimientosAsync(int? productoId = null)
        {
            var query = _context.MovimientosInventario.Include(m => m.Producto).AsQueryable();

            if (productoId.HasValue && productoId.Value > 0)
            {
                query = query.Where(m => m.ProductoId == productoId.Value);
            }

            return await query
                .OrderByDescending(m => m.Fecha)
                .Select(m => new MovimientoInventarioDto
                {
                    Id = m.Id,
                    ProductoId = m.ProductoId,
                    ProductoNombre = m.Producto.Nombre,
                    TipoMovimiento = m.Tipo,
                    Cantidad = m.Cantidad,
                    Fecha = m.Fecha,
                    Observacion = m.Motivo
                }).ToListAsync();
        }

        public async Task<MovimientoInventarioDto> RegistrarMovimientoAsync(RegistrarMovimientoDto dto)
        {
            var producto = await _context.Productos.FindAsync(dto.ProductoId);
            if (producto == null)
                throw new Exception("Producto no encontrado");

            if (dto.Cantidad == 0)
                throw new Exception("La cantidad no puede ser cero");

            if (dto.TipoMovimiento != "Entrada" && dto.TipoMovimiento != "Salida" && dto.TipoMovimiento != "Ajuste")
                throw new Exception("Tipo de movimiento inválido");

            if (dto.TipoMovimiento == "Entrada" && dto.Cantidad < 0)
                throw new Exception("La cantidad para una entrada debe ser positiva");

            if (dto.TipoMovimiento == "Salida" && dto.Cantidad < 0)
                throw new Exception("La cantidad para una salida debe ser positiva");

            // Update Stock
            if (dto.TipoMovimiento == "Entrada")
            {
                producto.StockActual += dto.Cantidad;
            }
            else if (dto.TipoMovimiento == "Salida")
            {
                producto.StockActual -= dto.Cantidad;
            }
            else if (dto.TipoMovimiento == "Ajuste")
            {
                producto.StockActual += dto.Cantidad;
            }

            if (producto.StockActual < 0)
                throw new Exception("El stock no puede ser negativo");

            var movimiento = new MovimientoInventario
            {
                ProductoId = dto.ProductoId,
                Tipo = dto.TipoMovimiento,
                Cantidad = dto.Cantidad,
                Fecha = DateTime.UtcNow,
                Motivo = dto.Observacion ?? string.Empty
            };

            _context.MovimientosInventario.Add(movimiento);
            await _context.SaveChangesAsync();

            return new MovimientoInventarioDto
            {
                Id = movimiento.Id,
                ProductoId = movimiento.ProductoId,
                ProductoNombre = producto.Nombre,
                TipoMovimiento = movimiento.Tipo,
                Cantidad = movimiento.Cantidad,
                Fecha = movimiento.Fecha,
                Observacion = movimiento.Motivo
            };
        }
    }
}
