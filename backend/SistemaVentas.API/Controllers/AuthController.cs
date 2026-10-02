using Microsoft.AspNetCore.Mvc;
using SistemaVentas.API.DTOs;
using SistemaVentas.API.Services;

namespace SistemaVentas.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            var result = await _authService.LoginAsync(loginDto);
            if (result == null)
            {
                return Unauthorized(new { message = "Usuario o contraseña incorrectos." });
            }

            return Ok(result);
        }
    }
}
