namespace SistemaVentas.API.Entities
{
    public class Producto
    {
        public int Id { get; set; }
        public string Codigo { get; set; } = string.Empty; // SKU
        public string Nombre { get; set; } = string.Empty;
        public int CategoriaId { get; set; }
        public decimal PrecioCompra { get; set; }
        public decimal PrecioVenta { get; set; }
        public int StockActual { get; set; }
        public int StockMinimo { get; set; }
        public bool Activo { get; set; } = true;

        public Categoria Categoria { get; set; } = null!;
        public ICollection<DetalleVenta> DetallesVenta { get; set; } = new List<DetalleVenta>();
        public ICollection<MovimientoInventario> Movimientos { get; set; } = new List<MovimientoInventario>();
    }
}
