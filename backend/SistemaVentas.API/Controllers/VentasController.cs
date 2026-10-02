using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SistemaVentas.API.DTOs;
using SistemaVentas.API.Services;

namespace SistemaVentas.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class VentasController : ControllerBase
    {
        private readonly IVentasService _ventasService;

        public VentasController(IVentasService ventasService)
        {
            _ventasService = ventasService;
        }

        [HttpPost]
        public async Task<ActionResult<VentaResponseDto>> Post([FromBody] RegistrarVentaDto dto)
        {
            try
            {
                var venta = await _ventasService.RegistrarVentaAsync(dto);
                return Ok(venta);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<VentaDetalleDto>> Get(int id)
        {
            var venta = await _ventasService.GetVentaByIdAsync(id);
            if (venta == null) return NotFound();
            return Ok(venta);
        }

        [HttpGet]
        public async Task<ActionResult<List<VentaHistorialDto>>> GetHistorial()
        {
            var historial = await _ventasService.GetHistorialAsync();
            return Ok(historial);
        }
    }
}
