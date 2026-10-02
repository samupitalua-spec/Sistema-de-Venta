using SistemaVentas.API.DTOs;

namespace SistemaVentas.API.Services
{
    public interface IDashboardService
    {
        Task<DashboardResumenDto> GetResumenAsync();
    }
}
