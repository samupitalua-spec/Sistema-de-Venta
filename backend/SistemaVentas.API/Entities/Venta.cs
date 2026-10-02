namespace SistemaVentas.API.Entities
{
    public class Venta
    {
        public int Id { get; set; }
        public string Numero { get; set; } = string.Empty;
        public DateTime Fecha { get; set; }
        public decimal Subtotal { get; set; }
        public decimal DescuentoTotal { get; set; }
        public decimal Total { get; set; }
        public string Estado { get; set; } = "Completada";

        public ICollection<DetalleVenta> Detalles { get; set; } = new List<DetalleVenta>();
        public ICollection<PagoVenta> Pagos { get; set; } = new List<PagoVenta>();
    }
}
