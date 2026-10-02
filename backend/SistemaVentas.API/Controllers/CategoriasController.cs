using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SistemaVentas.API.DTOs;
using SistemaVentas.API.Services;

namespace SistemaVentas.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CategoriasController : ControllerBase
    {
        private readonly ICategoriasService _categoriasService;

        public CategoriasController(ICategoriasService categoriasService)
        {
            _categoriasService = categoriasService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoriaDto>>> Get()
        {
            var categorias = await _categoriasService.GetAllAsync();
            return Ok(categorias);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CategoriaDto>> Get(int id)
        {
            var categoria = await _categoriasService.GetByIdAsync(id);
            if (categoria == null) return NotFound();
            return Ok(categoria);
        }

        [HttpPost]
        public async Task<ActionResult<CategoriaDto>> Post([FromBody] CrearCategoriaDto dto)
        {
            var categoria = await _categoriasService.CreateAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = categoria.Id }, categoria);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<CategoriaDto>> Put(int id, [FromBody] CrearCategoriaDto dto)
        {
            var categoria = await _categoriasService.UpdateAsync(id, dto);
            if (categoria == null) return NotFound();
            return Ok(categoria);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _categoriasService.DeleteOrDeactivateAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
