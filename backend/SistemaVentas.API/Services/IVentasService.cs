using SistemaVentas.API.DTOs;

namespace SistemaVentas.API.Services
{
    public interface IVentasService
    {
        Task<VentaResponseDto> RegistrarVentaAsync(RegistrarVentaDto dto);
        Task<VentaDetalleDto?> GetVentaByIdAsync(int id);
        Task<List<VentaHistorialDto>> GetHistorialAsync();
    }
}
