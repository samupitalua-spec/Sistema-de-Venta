namespace SistemaVentas.API.DTOs
{
    public class DashboardResumenDto
    {
        public decimal VentasHoy { get; set; }
        public decimal VentasMes { get; set; }
        public int TotalProductos { get; set; }
        public int ProductosBajoStock { get; set; }
        public List<TopProductoDto> TopProductos { get; set; } = new List<TopProductoDto>();
        public List<VentasDiariasDto> VentasUltimos7Dias { get; set; } = new List<VentasDiariasDto>();
    }

    public class TopProductoDto
    {
        public string Nombre { get; set; } = string.Empty;
        public int CantidadVendida { get; set; }
        public decimal TotalRecaudado { get; set; }
    }

    public class VentasDiariasDto
    {
        public string Fecha { get; set; } = string.Empty;
        public decimal Total { get; set; }
    }
}
