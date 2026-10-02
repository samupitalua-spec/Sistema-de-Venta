using Microsoft.EntityFrameworkCore;
using SistemaVentas.API.Data;
using SistemaVentas.API.DTOs;
using SistemaVentas.API.Entities;

namespace SistemaVentas.API.Services
{
    public class ProductosService : IProductosService
    {
        private readonly ApplicationDbContext _context;

        public ProductosService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ProductoDto>> GetAllAsync(string? query = null, int? categoriaId = null)
        {
            var q = _context.Productos.Include(p => p.Categoria).AsQueryable();

            if (!string.IsNullOrEmpty(query))
            {
                q = q.Where(p => p.Nombre.Contains(query) || p.Codigo.Contains(query));
            }

            if (categoriaId.HasValue && categoriaId.Value > 0)
            {
                q = q.Where(p => p.CategoriaId == categoriaId.Value);
            }

            return await q.Select(p => new ProductoDto
            {
                Id = p.Id,
                Codigo = p.Codigo,
                Nombre = p.Nombre,
                CategoriaId = p.CategoriaId,
                CategoriaNombre = p.Categoria.Nombre,
                PrecioCompra = p.PrecioCompra,
                PrecioVenta = p.PrecioVenta,
                StockActual = p.StockActual,
                StockMinimo = p.StockMinimo,
                Activo = p.Activo
            }).ToListAsync();
        }

        public async Task<ProductoDto?> GetByIdAsync(int id)
        {
            var p = await _context.Productos.Include(x => x.Categoria).FirstOrDefaultAsync(x => x.Id == id);
            if (p == null) return null;

            return new ProductoDto
            {
                Id = p.Id,
                Codigo = p.Codigo,
                Nombre = p.Nombre,
                CategoriaId = p.CategoriaId,
                CategoriaNombre = p.Categoria.Nombre,
                PrecioCompra = p.PrecioCompra,
                PrecioVenta = p.PrecioVenta,
                StockActual = p.StockActual,
                StockMinimo = p.StockMinimo,
                Activo = p.Activo
            };
        }

        public async Task<ProductoDto?> GetByCodigoAsync(string codigo)
        {
            var p = await _context.Productos.Include(x => x.Categoria).FirstOrDefaultAsync(x => x.Codigo == codigo);
            if (p == null) return null;

            return new ProductoDto
            {
                Id = p.Id,
                Codigo = p.Codigo,
                Nombre = p.Nombre,
                CategoriaId = p.CategoriaId,
                CategoriaNombre = p.Categoria.Nombre,
                PrecioCompra = p.PrecioCompra,
                PrecioVenta = p.PrecioVenta,
                StockActual = p.StockActual,
                StockMinimo = p.StockMinimo,
                Activo = p.Activo
            };
        }

        public async Task<ProductoDto> CreateAsync(CrearProductoDto dto)
        {
            var producto = new Producto
            {
                Codigo = dto.Codigo,
                Nombre = dto.Nombre,
                CategoriaId = dto.CategoriaId,
                PrecioCompra = dto.PrecioCompra,
                PrecioVenta = dto.PrecioVenta,
                StockActual = dto.StockActual,
                StockMinimo = dto.StockMinimo,
                Activo = true
            };

            _context.Productos.Add(producto);
            await _context.SaveChangesAsync();
            
            return await GetByIdAsync(producto.Id) ?? throw new Exception("Error retrieving created product");
        }

        public async Task<ProductoDto?> UpdateAsync(int id, ActualizarProductoDto dto)
        {
            var producto = await _context.Productos.FindAsync(id);
            if (producto == null) return null;

            producto.Codigo = dto.Codigo;
            producto.Nombre = dto.Nombre;
            producto.CategoriaId = dto.CategoriaId;
            producto.PrecioCompra = dto.PrecioCompra;
            producto.PrecioVenta = dto.PrecioVenta;
            producto.StockMinimo = dto.StockMinimo;
            producto.Activo = dto.Activo;

            await _context.SaveChangesAsync();

            return await GetByIdAsync(producto.Id);
        }

        public async Task<bool> DeleteOrDeactivateAsync(int id)
        {
            var producto = await _context.Productos
                .Include(p => p.DetallesVenta)
                .FirstOrDefaultAsync(p => p.Id == id);
                
            if (producto == null) return false;

            if (producto.DetallesVenta.Any())
            {
                producto.Activo = false;
            }
            else
            {
                _context.Productos.Remove(producto);
            }

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
