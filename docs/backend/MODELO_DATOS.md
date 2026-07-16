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
- `active`
- `created_at`
- `updated_at`

Regla: el catálogo público solo muestra categorías activas.

### Product

Representa un producto vendible.

Campos:

- `name`
- `description`
- `price`
- `category`
- `material`
- `color`
- `style`
- `dimensions`
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

- No borrar físicamente productos; usar `active=false`.
- `price` no puede ser negativo.

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
- `product_name`
- `unit_price`
- `quantity`
- `line_total`

El nombre y precio se guardan para conservar el historial aunque el producto cambie después.

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
