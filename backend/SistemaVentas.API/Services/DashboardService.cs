using Microsoft.EntityFrameworkCore;
using SistemaVentas.API.Data;
using SistemaVentas.API.DTOs;

namespace SistemaVentas.API.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly ApplicationDbContext _context;

        public DashboardService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardResumenDto> GetResumenAsync()
        {
            var hoy = DateTime.UtcNow.Date;
            var inicioMes = new DateTime(hoy.Year, hoy.Month, 1);
            var hace7Dias = hoy.AddDays(-6);

            // Ventas Hoy
            var ventasHoy = await _context.Ventas
                .Where(v => v.Fecha >= hoy && v.Estado == "Completada")
                .SumAsync(v => v.Total);

            // Ventas Mes
            var ventasMes = await _context.Ventas
                .Where(v => v.Fecha >= inicioMes && v.Estado == "Completada")
                .SumAsync(v => v.Total);

            // Total Productos
            var totalProductos = await _context.Productos.CountAsync();

            // Productos Bajo Stock
            var productosBajoStock = await _context.Productos
                .Where(p => p.StockActual <= p.StockMinimo)
                .CountAsync();

            // Top Productos
            var topProductos = await _context.DetallesVenta
                .Include(d => d.Producto)
                .Include(d => d.Venta)
                .Where(d => d.Venta.Estado == "Completada")
                .GroupBy(d => new { d.ProductoId, d.Producto.Nombre })
                .Select(g => new TopProductoDto
                {
                    Nombre = g.Key.Nombre,
                    CantidadVendida = g.Sum(d => d.Cantidad),
                    TotalRecaudado = g.Sum(d => d.Subtotal)
                })
                .OrderByDescending(p => p.CantidadVendida)
                .Take(5)
                .ToListAsync();

            // Ventas Últimos 7 Días
            var ventasUltimos7Dias = await _context.Ventas
                .Where(v => v.Fecha >= hace7Dias && v.Estado == "Completada")
                .GroupBy(v => v.Fecha.Date)
                .Select(g => new VentasDiariasDto
                {
                    Fecha = g.Key.ToString("yyyy-MM-dd"),
                    Total = g.Sum(v => v.Total)
                })
                .ToListAsync();

            // Fill missing days with 0
            var ultimos7Dias = Enumerable.Range(0, 7)
                .Select(i => hace7Dias.AddDays(i).ToString("yyyy-MM-dd"))
                .Select(fecha => new VentasDiariasDto
                {
                    Fecha = fecha,
                    Total = ventasUltimos7Dias.FirstOrDefault(v => v.Fecha == fecha)?.Total ?? 0
                })
                .ToList();

            return new DashboardResumenDto
            {
                VentasHoy = ventasHoy,
                VentasMes = ventasMes,
                TotalProductos = totalProductos,
                ProductosBajoStock = productosBajoStock,
                TopProductos = topProductos,
                VentasUltimos7Dias = ultimos7Dias
            };
        }
    }
}
