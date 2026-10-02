namespace SistemaVentas.API.DTOs
{
    public class MovimientoInventarioDto
    {
        public int Id { get; set; }
        public int ProductoId { get; set; }
        public string ProductoNombre { get; set; } = string.Empty;
        public string TipoMovimiento { get; set; } = string.Empty;
        public int Cantidad { get; set; }
        public DateTime Fecha { get; set; }
        public string? Observacion { get; set; }
    }

    public class RegistrarMovimientoDto
    {
        public int ProductoId { get; set; }
        public string TipoMovimiento { get; set; } = string.Empty; // "Entrada", "Salida", "Ajuste"
        public int Cantidad { get; set; }
        public string? Observacion { get; set; }
    }
}
