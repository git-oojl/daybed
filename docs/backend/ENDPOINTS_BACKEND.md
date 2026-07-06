# Endpoints backend

Base local:

```text
http://localhost:8000/api
```

Autenticación protegida:

```http
Authorization: Bearer <ACCESS_TOKEN>
```

## Salud, auth y documentación

| Método | Endpoint | Acceso | Descripción |
| --- | --- | --- | --- |
| GET | `/api/health/` | Público | Health check. |
| POST | `/api/auth/token/` | Público | Login JWT. |
| POST | `/api/auth/token/refresh/` | Público | Refresh JWT. |
| GET | `/api/schema/` | Público | OpenAPI schema. |
| GET | `/api/docs/` | Público | Swagger UI. |

## Accounts

| Método | Endpoint | Acceso | Descripción |
| --- | --- | --- | --- |
| POST | `/api/accounts/register/` | Público | Crear cliente. |
| GET | `/api/accounts/me/` | Autenticado | Ver perfil propio. |
| PATCH/PUT | `/api/accounts/me/` | Autenticado | Actualizar perfil propio. |
| GET/POST | `/api/accounts/users/` | Admin | Listar/crear usuarios. |
| GET/PATCH/PUT | `/api/accounts/users/{id}/` | Admin | Ver/editar usuario. |

La gestión interna no expone DELETE.

## Catalog

| Método | Endpoint | Acceso | Descripción |
| --- | --- | --- | --- |
| GET | `/api/catalog/categories/` | Público | Lista categorías activas. |
| GET | `/api/catalog/categories/{slug}/` | Público | Detalle categoría activa. |
| GET | `/api/catalog/products/` | Público | Lista productos activos. |
| GET | `/api/catalog/products/{id}/` | Público | Detalle producto activo. |
| CRUD | `/api/catalog/manage/categories/` | Empleado/Admin | Gestión de categorías. |
| CRUD | `/api/catalog/manage/products/` | Empleado/Admin | Gestión de productos. |

En productos, `DELETE` realiza desactivación lógica (`active=false`).

Filtros disponibles en productos públicos:

- `category`
- `category__slug`
- `material`
- `color`
- `style`
- `search`
- `ordering`

Ejemplo:

```text
/api/catalog/products/?search=sillon&ordering=price
```

## Cart

| Método | Endpoint | Acceso | Descripción |
| --- | --- | --- | --- |
| GET | `/api/cart/` | Cliente | Ver carrito. |
| DELETE | `/api/cart/` | Cliente | Vaciar carrito. |
| GET | `/api/cart/items/` | Cliente | Listar items. |
| POST | `/api/cart/items/` | Cliente | Agregar producto. |
| GET | `/api/cart/items/{id}/` | Cliente | Ver item. |
| PATCH/PUT | `/api/cart/items/{id}/` | Cliente | Actualizar cantidad. |
| DELETE | `/api/cart/items/{id}/` | Cliente | Eliminar item. |

Agregar item:

```json
{
  "product_id": 1,
  "quantity": 2
}
```

Actualizar cantidad:

```json
{
  "quantity": 3
}
```

## Delivery

| Método | Endpoint | Acceso | Descripción |
| --- | --- | --- | --- |
| POST | `/api/delivery/geocode/` | Cliente | Geocodificar dirección. |
| POST | `/api/delivery/estimate/` | Cliente | Estimar distancia, duración y tarifa. |

Geocode:

```json
{
  "address": "Av. Reforma 123, Tijuana, Baja California, México"
}
```

Estimate con coordenadas:

```json
{
  "latitude": "32.51490000",
  "longitude": "-117.03820000"
}
```

Estimate con dirección:

```json
{
  "address": "Av. Reforma 123, Tijuana, Baja California, México"
}
```

## Checkout y orders

| Método | Endpoint | Acceso | Descripción |
| --- | --- | --- | --- |
| POST | `/api/checkout/` | Cliente | Crear pedido desde carrito. |
| GET | `/api/orders/` | Cliente | Listar pedidos propios. |
| GET | `/api/orders/{id}/` | Cliente | Detalle de pedido propio. |
| GET | `/api/manage/orders/` | Empleado/Admin | Listar pedidos. |
| GET | `/api/manage/orders/{id}/` | Empleado/Admin | Detalle interno. |
| PATCH/PUT | `/api/manage/orders/{id}/` | Empleado/Admin | Actualizar estado. |

Checkout espera datos de entrega ya calculados/validados:

```json
{
  "original_address": "Av. Reforma 123, Tijuana, Baja California, México",
  "formatted_address": "Dirección normalizada",
  "latitude": "32.51490000",
  "longitude": "-117.03820000",
  "distance_km": "12.400",
  "estimated_duration_minutes": "28.0",
  "delivery_fee": "180.00",
  "delivery_zone": "standard",
  "geocoding_provider": "nominatim",
  "distance_provider": "openrouteservice"
}
```

Actualizar estado:

```json
{
  "status": "confirmed"
}
```

Estados válidos:

- `pending`
- `confirmed`
- `preparing`
- `shipped`
- `delivered`
- `cancelled`

## Inventory

| Método | Endpoint | Acceso | Descripción |
| --- | --- | --- | --- |
| GET | `/api/inventory/products/` | Empleado/Admin | Productos con stock. |
| GET | `/api/inventory/low-stock/` | Empleado/Admin | Bajo inventario. |
| PATCH/PUT | `/api/inventory/products/{id}/stock/` | Empleado/Admin | Actualizar stock/mínimo. |
| GET | `/api/inventory/movements/` | Empleado/Admin | Movimientos de inventario. |

Actualizar stock:

```json
{
  "stock": 10,
  "minimum_stock": 2,
  "reason": "Ajuste de conteo físico"
}
```

## Dashboard

| Método | Endpoint | Acceso | Descripción |
| --- | --- | --- | --- |
| GET | `/api/dashboard/metrics/` | Empleado/Admin | Métricas operativas. |

Métricas incluidas:

- Total de pedidos.
- Total de ventas simuladas.
- Pedidos por estado.
- Cantidad de productos bajo inventario.
- Pedidos recientes.
- Promedio de tarifa de entrega.
- Promedio de distancia de entrega.
