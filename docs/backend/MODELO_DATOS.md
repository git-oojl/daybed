# Modelo de datos

Resumen de las entidades principales del backend Daybed.

## Accounts

### User

Extiende `AbstractUser`.

Campos relevantes:

- `username`
- `email` único
- `first_name`
- `last_name`
- `phone`
- `state`
- `city`
- `role`

Roles:

- `cliente`
- `empleado`
- `administrador`

Reglas:

- `email` es único y se normaliza a minúsculas en registro y gestión interna.
- El login público usa `email` + `password`.
- `username` se conserva por compatibilidad con Django/Admin y se genera desde el correo cuando el registro de cliente no lo envía.
- `state` y `city` guardan los campos de ubicación básica que ya capturan las vistas actuales de registro.

## Catalog

### Category

Representa una categoría de muebles.

Campos:

- `name`
- `slug`
- `description`
- `specification_schema`
- `active`
- `created_at`
- `updated_at`

Reglas:

- El catálogo público solo muestra categorías activas.
- `specification_schema` documenta especificaciones esperadas por categoría. Es una lista JSON ligera, no un sistema EAV. Cada item puede declarar `key`, `label`, `type` y `filterable`.
- Los filtros `spec.<key>` requieren filtrar por categoría y solo aceptan specs escalares (`text`, `number`, `boolean`) marcadas con `filterable=true`.

### Product

Representa un producto vendible.

Campos:

- `sku`
- `name`
- `description`
- `price`
- `category`
- `material`
- `color`
- `style`
- `width_cm`
- `height_cm`
- `depth_cm`
- `length_cm`
- `diameter_cm`
- `weight_kg`
- `specifications`
- `main_image`
- `stock`
- `minimum_stock`
- `active`
- `created_at`
- `updated_at`

Propiedad:

```text
low_stock = stock <= minimum_stock
```

Reglas:

- `Product` sigue siendo el item comprable/SKU del MVP. Si una configuración tiene precio, stock, imágenes o dimensiones distintas, se registra como otro producto.
- `sku` se genera automáticamente si no se envía.
- No borrar físicamente productos; usar `active=false`.
- `price` no puede ser negativo.
- Las dimensiones estructuradas son numéricas, opcionales y no negativas. Las dimensiones que no aplican quedan en `null`.
- No hay campo textual libre `dimensions` en el modelo activo. Las migraciones preservan valores antiguos no vacíos en `specifications._legacy_dimensions_text` solo para evitar pérdida silenciosa de datos locales.
- `specifications` guarda datos flexibles de display por producto como JSON simple: textos, números, booleanos, `null` o listas simples.
- No se usa un modelo de variantes ni un sistema EAV en el MVP.

### ProductImage

Imágenes adicionales del producto.

Campos:

- `product`
- `image`
- `alt_text`
- `sort_order`
- `active`
- `created_at`

## Cart

### Cart

Carrito único por usuario.

Campos:

- `user`
- `created_at`
- `updated_at`

Subtotal calculado desde items.

### CartItem

Producto dentro del carrito.

Campos:

- `cart`
- `product`
- `quantity`
- `created_at`
- `updated_at`

Restricciones:

- Un producto no se repite dentro del mismo carrito.
- `quantity >= 1`.

Reglas:

- Agregar o actualizar carrito no descuenta inventario.
- Checkout rechaza items cuyo producto o categoría haya sido desactivado después de agregarse al carrito.

## Orders

### Order

Pedido creado desde checkout.

Campos principales:

- `user`
- `status`
- `stock_decremented_at`
- `products_subtotal`
- `delivery_fee`
- `total`
- `created_at`
- `updated_at`

Snapshot de entrega:

- `original_address`
- `formatted_address`
- `latitude`
- `longitude`
- `distance_km`
- `estimated_duration_minutes`
- `delivery_zone`
- `geocoding_provider`
- `distance_provider`

Estados:

- `pending`
- `confirmed`
- `preparing`
- `shipped`
- `delivered`
- `cancelled`

Transiciones permitidas:

```text
pending -> confirmed | cancelled
confirmed -> preparing | cancelled
preparing -> shipped | cancelled
shipped -> delivered
delivered -> sin transición
cancelled -> sin transición
```

Reglas:

- El stock se descuenta una sola vez al pasar a `confirmed`.
- Los datos de entrega guardados desde checkout no aceptan coordenadas, distancia, duración o tarifa fuera de rango válido.

### OrderItem

Snapshot de cada producto comprado.

Campos:

- `order`
- `product`
- `product_sku`
- `product_name`
- `unit_price`
- `quantity`
- `line_total`
- `product_snapshot`

El SKU, nombre, precio y snapshot de producto se guardan para conservar el historial aunque el producto cambie después. `product_snapshot` captura datos de catálogo relevantes al momento de compra: SKU, material, color, estilo, dimensiones estructuradas y especificaciones flexibles.

## Inventory

### InventoryMovement

Movimiento append-only de inventario.

Tipos:

- `manual_adjustment`
- `order_confirmed`

Campos:

- `product`
- `movement_type`
- `quantity_delta`
- `previous_stock`
- `new_stock`
- `reason`
- `order`
- `created_by`
- `created_at`

Restricciones:

- `quantity_delta` no puede ser cero.
- `new_stock = previous_stock + quantity_delta`.
- No debe editarse ni eliminarse un movimiento existente.

## Delivery

No hay modelos propios en `delivery` para el MVP. La app contiene servicios y serializers para:

- Geocodificar dirección.
- Estimar distancia/duración.
- Calcular tarifa.

Los datos finales de entrega se guardan en `Order`.

## Dashboard

No hay modelos propios en `dashboard` para el MVP. Las métricas se calculan desde `Order` y `Product`.

## Datos demo locales

El comando `seed_demo` crea un dataset repetible para desarrollo local con SQLite:

```bash
cd backend
uv run python manage.py migrate
uv run python manage.py seed_demo
```

Para recrear solo los datos demo conocidos:

```bash
uv run python manage.py seed_demo --reset
```

Usuarios:

| Rol | Email | Password |
| --- | --- | --- |
| `cliente` | `cliente@example.com` | `DemoPassword123!` |
| `empleado` | `empleado@example.com` | `DemoPassword123!` |
| `administrador` | `admin@example.com` | `DemoPassword123!` |

Contenido incluido:

- Categorías activas para catálogo y una categoría inactiva para validar filtros internos.
- Productos activos, un producto inactivo, SKUs, dimensiones estructuradas, especificaciones flexibles, stock bajo y stock agotado.
- Carrito prellenado para `cliente@example.com`.
- Pedidos del cliente en `pending`, `confirmed`, `preparing`, `shipped`, `delivered` y `cancelled`.
- Movimientos de inventario por pedidos confirmados y un ajuste manual demo.

Regla de equipo: no compartir ni versionar `db.sqlite3`. El estado inicial compartido debe vivir en migraciones, fixtures/semillas y documentación.
