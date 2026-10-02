namespace SistemaVentas.API.Entities
{
    public class MovimientoInventario
    {
        public int Id { get; set; }
        public int ProductoId { get; set; }
        public string Tipo { get; set; } = string.Empty; // Entrada, Salida, Ajuste
        public int Cantidad { get; set; }
        public DateTime Fecha { get; set; }
        public string Motivo { get; set; } = string.Empty;
        public int? VentaId { get; set; }

        public Producto Producto { get; set; } = null!;
        public Venta? Venta { get; set; }
    }
}
