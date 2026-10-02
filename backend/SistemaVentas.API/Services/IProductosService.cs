using SistemaVentas.API.DTOs;

namespace SistemaVentas.API.Services
{
    public interface IProductosService
    {
        Task<IEnumerable<ProductoDto>> GetAllAsync(string? query = null, int? categoriaId = null);
        Task<ProductoDto?> GetByIdAsync(int id);
        Task<ProductoDto?> GetByCodigoAsync(string codigo);
        Task<ProductoDto> CreateAsync(CrearProductoDto dto);
        Task<ProductoDto?> UpdateAsync(int id, ActualizarProductoDto dto);
        Task<bool> DeleteOrDeactivateAsync(int id);
    }
}
