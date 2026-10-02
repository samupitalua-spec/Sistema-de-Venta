using Microsoft.AspNetCore.Identity;
using SistemaVentas.API.Entities;

namespace SistemaVentas.API.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAdminUserAsync(IServiceProvider serviceProvider)
        {
            var userManager = serviceProvider.GetRequiredService<UserManager<IdentityUser>>();
            var context = serviceProvider.GetRequiredService<ApplicationDbContext>();
            
            if (await userManager.FindByNameAsync("Samuel") == null)
            {
                var adminUser = new IdentityUser
                {
                    UserName = "Samuel",
                    Email = "samuel@sistemaventas.com"
                };

                await userManager.CreateAsync(adminUser, "CambiarEstaContrasena123!");
            }

            // Seed Categories
            if (!context.Categorias.Any())
            {
                var despensa = new Categoria { Nombre = "Despensa", Descripcion = "Productos de alacena y granos" };
                var lacteos = new Categoria { Nombre = "Lácteos", Descripcion = "Leches, quesos y derivados" };
                var aseo = new Categoria { Nombre = "Aseo", Descripcion = "Limpieza del hogar y personal" };
                
                context.Categorias.AddRange(despensa, lacteos, aseo);
                await context.SaveChangesAsync();

                // Seed Products
                if (!context.Productos.Any())
                {
                    context.Productos.AddRange(
                        new Producto { Codigo = "001", Nombre = "Arroz Premium 1 kg", CategoriaId = despensa.Id, PrecioCompra = 4500, PrecioVenta = 5800, StockActual = 48, StockMinimo = 10, Activo = true },
                        new Producto { Codigo = "002", Nombre = "Café Molido 250 g", CategoriaId = despensa.Id, PrecioCompra = 7000, PrecioVenta = 9500, StockActual = 36, StockMinimo = 5, Activo = true },
                        new Producto { Codigo = "003", Nombre = "Azúcar Blanca 1 kg", CategoriaId = despensa.Id, PrecioCompra = 3800, PrecioVenta = 4900, StockActual = 60, StockMinimo = 15, Activo = true },
                        new Producto { Codigo = "004", Nombre = "Leche Entera 1 L", CategoriaId = lacteos.Id, PrecioCompra = 3800, PrecioVenta = 4600, StockActual = 120, StockMinimo = 20, Activo = true },
                        new Producto { Codigo = "005", Nombre = "Queso Doble Crema 250g", CategoriaId = lacteos.Id, PrecioCompra = 6500, PrecioVenta = 8500, StockActual = 25, StockMinimo = 10, Activo = true },
                        new Producto { Codigo = "006", Nombre = "Detergente en Polvo 1 kg", CategoriaId = aseo.Id, PrecioCompra = 9800, PrecioVenta = 12300, StockActual = 3, StockMinimo = 10, Activo = true },
                        new Producto { Codigo = "007", Nombre = "Jabón de Tocador x3", CategoriaId = aseo.Id, PrecioCompra = 6000, PrecioVenta = 7800, StockActual = 2, StockMinimo = 5, Activo = true },
                        new Producto { Codigo = "008", Nombre = "Papel Higiénico x12", CategoriaId = aseo.Id, PrecioCompra = 14500, PrecioVenta = 18900, StockActual = 0, StockMinimo = 5, Activo = true }
                    );
                    await context.SaveChangesAsync();
                }
            }
        }
    }
}
