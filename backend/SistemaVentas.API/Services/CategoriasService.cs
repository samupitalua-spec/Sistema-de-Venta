using Microsoft.EntityFrameworkCore;
using SistemaVentas.API.Data;
using SistemaVentas.API.DTOs;
using SistemaVentas.API.Entities;

namespace SistemaVentas.API.Services
{
    public class CategoriasService : ICategoriasService
    {
        private readonly ApplicationDbContext _context;

        public CategoriasService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CategoriaDto>> GetAllAsync()
        {
            return await _context.Categorias
                .Select(c => new CategoriaDto
                {
                    Id = c.Id,
                    Nombre = c.Nombre,
                    Descripcion = c.Descripcion,
                    Activa = c.Activa
                }).ToListAsync();
        }

        public async Task<CategoriaDto?> GetByIdAsync(int id)
        {
            var c = await _context.Categorias.FindAsync(id);
            if (c == null) return null;

            return new CategoriaDto
            {
                Id = c.Id,
                Nombre = c.Nombre,
                Descripcion = c.Descripcion,
                Activa = c.Activa
            };
        }

        public async Task<CategoriaDto> CreateAsync(CrearCategoriaDto dto)
        {
            var categoria = new Categoria
            {
                Nombre = dto.Nombre,
                Descripcion = dto.Descripcion,
                Activa = true
            };

            _context.Categorias.Add(categoria);
            await _context.SaveChangesAsync();

            return new CategoriaDto
            {
                Id = categoria.Id,
                Nombre = categoria.Nombre,
                Descripcion = categoria.Descripcion,
                Activa = categoria.Activa
            };
        }

        public async Task<CategoriaDto?> UpdateAsync(int id, CrearCategoriaDto dto)
        {
            var categoria = await _context.Categorias.FindAsync(id);
            if (categoria == null) return null;

            categoria.Nombre = dto.Nombre;
            categoria.Descripcion = dto.Descripcion;

            await _context.SaveChangesAsync();

            return new CategoriaDto
            {
                Id = categoria.Id,
                Nombre = categoria.Nombre,
                Descripcion = categoria.Descripcion,
                Activa = categoria.Activa
            };
        }

        public async Task<bool> DeleteOrDeactivateAsync(int id)
        {
            var categoria = await _context.Categorias
                .Include(c => c.Productos)
                .FirstOrDefaultAsync(c => c.Id == id);
                
            if (categoria == null) return false;

            if (categoria.Productos.Any())
            {
                categoria.Activa = false;
            }
            else
            {
                _context.Categorias.Remove(categoria);
            }

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
