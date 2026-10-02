namespace SistemaVentas.API.DTOs
{
    public class RegistrarVentaDto
    {
        public decimal DescuentoTotal { get; set; }
        public List<CrearDetalleVentaDto> Detalles { get; set; } = new List<CrearDetalleVentaDto>();
        public List<CrearPagoVentaDto> Pagos { get; set; } = new List<CrearPagoVentaDto>();
    }

    public class CrearDetalleVentaDto
    {
        public int ProductoId { get; set; }
        public int Cantidad { get; set; }
        public decimal Descuento { get; set; }
    }

    public class CrearPagoVentaDto
    {
        public string MetodoPago { get; set; } = string.Empty;
        public decimal Monto { get; set; }
    }

    public class VentaResponseDto
    {
        public int Id { get; set; }
        public string Numero { get; set; } = string.Empty;
        public decimal Total { get; set; }
    }

    public class VentaDetalleDto
    {
        public int Id { get; set; }
        public string Numero { get; set; } = string.Empty;
        public DateTime Fecha { get; set; }
        public decimal Subtotal { get; set; }
        public decimal DescuentoTotal { get; set; }
        public decimal Total { get; set; }
        public string Estado { get; set; } = string.Empty;

        public List<ItemDetalleDto> Detalles { get; set; } = new List<ItemDetalleDto>();
        public List<ItemPagoDto> Pagos { get; set; } = new List<ItemPagoDto>();
    }

    public class ItemDetalleDto
    {
        public string ProductoNombre { get; set; } = string.Empty;
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        public decimal Subtotal { get; set; }
    }

    public class ItemPagoDto
    {
        public string MetodoPago { get; set; } = string.Empty;
        public decimal Monto { get; set; }
    }

    public class VentaHistorialDto
    {
        public int Id { get; set; }
        public string Numero { get; set; } = string.Empty;
        public DateTime Fecha { get; set; }
        public decimal Total { get; set; }
        public string Estado { get; set; } = string.Empty;
    }
}
