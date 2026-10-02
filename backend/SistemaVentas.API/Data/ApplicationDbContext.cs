using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SistemaVentas.API.Entities;

namespace SistemaVentas.API.Data
{
    public class ApplicationDbContext : IdentityDbContext<IdentityUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Categoria> Categorias { get; set; }
        public DbSet<Producto> Productos { get; set; }
        public DbSet<Venta> Ventas { get; set; }
        public DbSet<DetalleVenta> DetallesVenta { get; set; }
        public DbSet<PagoVenta> PagosVenta { get; set; }
        public DbSet<MovimientoInventario> MovimientosInventario { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Producto
            builder.Entity<Producto>()
                .HasIndex(p => p.Codigo)
                .IsUnique();
                
            builder.Entity<Producto>()
                .Property(p => p.PrecioCompra)
                .HasColumnType("decimal(18,2)");
                
            builder.Entity<Producto>()
                .Property(p => p.PrecioVenta)
                .HasColumnType("decimal(18,2)");

            // Venta
            builder.Entity<Venta>()
                .HasIndex(v => v.Fecha);

            builder.Entity<Venta>()
                .Property(v => v.Subtotal)
                .HasColumnType("decimal(18,2)");

            builder.Entity<Venta>()
                .Property(v => v.DescuentoTotal)
                .HasColumnType("decimal(18,2)");

            builder.Entity<Venta>()
                .Property(v => v.Total)
                .HasColumnType("decimal(18,2)");

            // DetalleVenta
            builder.Entity<DetalleVenta>()
                .Property(d => d.PrecioUnitario)
                .HasColumnType("decimal(18,2)");

            builder.Entity<DetalleVenta>()
                .Property(d => d.CostoUnitario)
                .HasColumnType("decimal(18,2)");

            builder.Entity<DetalleVenta>()
                .Property(d => d.Descuento)
                .HasColumnType("decimal(18,2)");

            builder.Entity<DetalleVenta>()
                .Property(d => d.Subtotal)
                .HasColumnType("decimal(18,2)");

            // PagoVenta
            builder.Entity<PagoVenta>()
                .Property(p => p.Monto)
                .HasColumnType("decimal(18,2)");

            // Relaciones
            builder.Entity<Producto>()
                .HasOne(p => p.Categoria)
                .WithMany(c => c.Productos)
                .HasForeignKey(p => p.CategoriaId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<DetalleVenta>()
                .HasOne(d => d.Venta)
                .WithMany(v => v.Detalles)
                .HasForeignKey(d => d.VentaId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<DetalleVenta>()
                .HasOne(d => d.Producto)
                .WithMany(p => p.DetallesVenta)
                .HasForeignKey(d => d.ProductoId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<PagoVenta>()
                .HasOne(p => p.Venta)
                .WithMany(v => v.Pagos)
                .HasForeignKey(p => p.VentaId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<MovimientoInventario>()
                .HasOne(m => m.Producto)
                .WithMany(p => p.Movimientos)
                .HasForeignKey(m => m.ProductoId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
