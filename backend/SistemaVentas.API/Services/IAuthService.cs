using SistemaVentas.API.DTOs;

namespace SistemaVentas.API.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto?> LoginAsync(LoginDto loginDto);
    }
}
