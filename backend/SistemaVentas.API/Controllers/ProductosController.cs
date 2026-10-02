using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SistemaVentas.API.DTOs;
using SistemaVentas.API.Services;

namespace SistemaVentas.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProductosController : ControllerBase
    {
        private readonly IProductosService _productosService;

        public ProductosController(IProductosService productosService)
        {
            _productosService = productosService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductoDto>>> Get([FromQuery] string? query, [FromQuery] int? categoriaId)
        {
            var productos = await _productosService.GetAllAsync(query, categoriaId);
            return Ok(productos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProductoDto>> Get(int id)
        {
            var producto = await _productosService.GetByIdAsync(id);
            if (producto == null) return NotFound();
            return Ok(producto);
        }
        
        [HttpGet("codigo/{codigo}")]
        public async Task<ActionResult<ProductoDto>> GetByCodigo(string codigo)
        {
            var producto = await _productosService.GetByCodigoAsync(codigo);
            if (producto == null) return NotFound();
            return Ok(producto);
        }

        [HttpPost]
        public async Task<ActionResult<ProductoDto>> Post([FromBody] CrearProductoDto dto)
        {
            var existing = await _productosService.GetByCodigoAsync(dto.Codigo);
            if (existing != null)
                return BadRequest(new { message = "El código/SKU ya existe" });
                
            var producto = await _productosService.CreateAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = producto.Id }, producto);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ProductoDto>> Put(int id, [FromBody] ActualizarProductoDto dto)
        {
            var existing = await _productosService.GetByCodigoAsync(dto.Codigo);
            if (existing != null && existing.Id != id)
                return BadRequest(new { message = "El código/SKU ya existe" });

            var producto = await _productosService.UpdateAsync(id, dto);
            if (producto == null) return NotFound();
            return Ok(producto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _productosService.DeleteOrDeactivateAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
