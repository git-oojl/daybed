# Alcance del MVP

Daybed es una aplicación web full-stack para una tienda de muebles. El MVP busca demostrar un flujo realista de tienda pequeña: catálogo público, cuentas de cliente, carrito, checkout simulado, estimación de entrega, pedidos, inventario y panel interno.

## Incluido en el MVP

- Catálogo público de productos activos.
- Categorías de productos.
- SKUs, dimensiones estructuradas y especificaciones flexibles simples para productos.
- Registro de clientes.
- Login con JWT.
- Roles básicos: `cliente`, `empleado`, `administrador`.
- Perfil de usuario autenticado.
- Gestión interna de usuarios por administrador.
- Carrito de compras autenticado.
- Checkout simulado sin pagos reales.
- Geocodificación de dirección desde backend.
- Estimación de distancia, duración y tarifa de entrega desde backend.
- Creación de pedidos con snapshot de entrega.
- Historial de pedidos del cliente.
- Gestión interna de pedidos y estados.
- Gestión de productos para empleados/administradores.
- Gestión operativa de inventario.
- Movimientos de inventario append-only.
- Métricas básicas del dashboard interno.
- Pruebas backend prácticas.
- Documentación local para desarrollo.

## Fuera del MVP

No se implementa en esta versión:

- Pagos reales.
- Stripe en producción.
- Integración real con transportistas.
- Tracking real de envíos.
- Asignación real de rutas.
- Aplicación móvil nativa.
- Notificaciones push.
- Correos automáticos reales.
- Chat en vivo.
- Portal de proveedores.
- Gestión contable avanzada.
- Sistema completo de auditoría.
- Multi-sucursal o multi-almacén.
- Variantes configurables de producto con precio/stock independiente.
- Sistema EAV completo para atributos de catálogo.
- Exportaciones avanzadas PDF/Excel.
