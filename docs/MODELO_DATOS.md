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
- `role`

Roles:

- `cliente`
- `empleado`
- `administrador`

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

Regla: no borrar físicamente productos; usar `active=false`.

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

Regla: agregar o actualizar carrito no descuenta inventario.

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

Regla: el stock se descuenta una sola vez al pasar a `confirmed`.

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
