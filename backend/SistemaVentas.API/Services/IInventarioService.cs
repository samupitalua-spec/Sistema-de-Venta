using SistemaVentas.API.DTOs;

namespace SistemaVentas.API.Services
{
    public interface IInventarioService
    {
        Task<IEnumerable<MovimientoInventarioDto>> GetMovimientosAsync(int? productoId = null);
        Task<MovimientoInventarioDto> RegistrarMovimientoAsync(RegistrarMovimientoDto dto);
    }
}
