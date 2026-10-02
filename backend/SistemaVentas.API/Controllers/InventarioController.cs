using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SistemaVentas.API.DTOs;
using SistemaVentas.API.Services;

namespace SistemaVentas.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class InventarioController : ControllerBase
    {
        private readonly IInventarioService _inventarioService;

        public InventarioController(IInventarioService inventarioService)
        {
            _inventarioService = inventarioService;
        }

        [HttpGet("movimientos")]
        public async Task<ActionResult<IEnumerable<MovimientoInventarioDto>>> GetMovimientos([FromQuery] int? productoId)
        {
            var movimientos = await _inventarioService.GetMovimientosAsync(productoId);
            return Ok(movimientos);
        }

        [HttpPost("movimientos")]
        public async Task<ActionResult<MovimientoInventarioDto>> RegistrarMovimiento([FromBody] RegistrarMovimientoDto dto)
        {
            try
            {
                var movimiento = await _inventarioService.RegistrarMovimientoAsync(dto);
                return Ok(movimiento);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
