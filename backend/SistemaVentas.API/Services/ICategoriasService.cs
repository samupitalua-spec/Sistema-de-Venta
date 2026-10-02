using SistemaVentas.API.DTOs;

namespace SistemaVentas.API.Services
{
    public interface ICategoriasService
    {
        Task<IEnumerable<CategoriaDto>> GetAllAsync();
        Task<CategoriaDto?> GetByIdAsync(int id);
        Task<CategoriaDto> CreateAsync(CrearCategoriaDto dto);
        Task<CategoriaDto?> UpdateAsync(int id, CrearCategoriaDto dto);
        Task<bool> DeleteOrDeactivateAsync(int id);
    }
}
