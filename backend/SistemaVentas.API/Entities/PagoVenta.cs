namespace SistemaVentas.API.Entities
{
    public class PagoVenta
    {
        public int Id { get; set; }
        public int VentaId { get; set; }
        public string MetodoPago { get; set; } = string.Empty; // Efectivo, Tarjeta, Transferencia
        public decimal Monto { get; set; }

        public Venta Venta { get; set; } = null!;
    }
}
