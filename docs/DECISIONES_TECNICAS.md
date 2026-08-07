# Decisiones técnicas

Este archivo registra decisiones importantes del proyecto Daybed.

## Monorepo

El proyecto vive en un solo repositorio con carpetas principales:

```text
backend/
frontend/
docs/
infra/
```

Esto facilita que backend, frontend y documentación evolucionen juntos.

## Backend

- Django y Django REST Framework para construir API REST.
- Usuario personalizado desde el inicio para soportar roles.
- JWT con SimpleJWT para autenticación entre frontend y backend.
- Login público con `email` y `password`; `username` se conserva para compatibilidad con Django Admin y scripts.
- Refresh tokens con rotación y blacklist para permitir logout real.
- SQLite como base oficial del MVP local por baja fricción de instalación.
- `uv` para entorno y dependencias Python.
- `django-environ` para configuración por variables de entorno.
- `django-cors-headers` para permitir comunicación local con Vite.
- `django-filter` para filtros, búsqueda y ordenamiento en endpoints.
- `drf-spectacular` para schema OpenAPI y Swagger UI.
- `httpx` para llamadas HTTP a proveedores externos.

## Frontend

- React con Vite.
- npm como gestor de dependencias frontend.
- React Router para navegación.
- MUI como librería visual propuesta.
- Las vistas actuales son base estructural; la integración visual y de estado puede crecer por feature.

## Autenticación y permisos

Roles:

- `cliente`
- `empleado`
- `administrador`

Reglas principales:

- El registro de cliente acepta los nombres de campos usados por las vistas actuales: `nombre`, `apellido`, `telefono`, `estado`, `ciudad`, `password` y `confirmPassword`.
- El registro publico siempre crea cuentas `cliente`; no se permite crear empleados o administradores desde el formulario publico.
- Las cuentas `empleado` y `administrador` se crean por administradores desde gestion interna o desde Django Admin en desarrollo.
- El backend genera `username` si el cliente no lo envía.
- Público: catálogo activo.
- Cliente: perfil propio, carrito, checkout y pedidos propios.
- Empleado: operación interna solo si su grupo tiene el permiso operativo concreto.
- Administrador: gestión de usuarios, permisos y store settings, además de bypass operativo completo.
- Solo el rol `empleado` tiene paquete configurable. No hay roles `editor` ni `invitado`, ni permisos por usuario.
- Los permisos operativos son Django `Group`/`Permission` y se evalúan contra la base actual; no se confía en claims permanentes dentro del JWT.

## Inventario

- El stock no baja al agregar productos al carrito.
- El stock no baja al crear pedido `pending`.
- El stock baja al confirmar pedido.
- Los movimientos de inventario son append-only.
- Los productos deben desactivarse en lugar de borrarse físicamente.

## Modelo de catálogo de muebles

- `Product` es el item comprable/SKU del MVP. Precio, stock, mínimo de stock, color, material, estilo, dimensiones e imágenes siguen viviendo en producto.
- Se agrega `sku` a producto para identificar claramente el item comprado e inventariado.
- Se usan dimensiones estructuradas opcionales (`width_cm`, `height_cm`, `depth_cm`, `length_cm`, `diameter_cm`, `weight_kg`) como única fuente activa de dimensiones.
- Se elimina el campo textual libre `dimensions` para evitar datos duplicados o contradictorios. La migración preserva valores antiguos no vacíos en `Product.specifications._legacy_dimensions_text` solo como respaldo local.
- Se usa `Product.specifications` como JSON simple para especificaciones de categoría que no justifican columnas permanentes.
- Se usa `Category.specification_schema` como JSON ligero para documentar specs esperadas y marcar cuáles pueden filtrarse.
- Se evita EAV porque aumenta complejidad de modelos, serializers, consultas, admin y pruebas sin necesidad concreta para el catálogo pequeño del MVP.
- Se difiere `ProductVariant`. Si una configuración tiene precio, stock, dimensiones, imágenes o inventario distinto, se registra como otro `Product` por ahora.
- `OrderItem` guarda `product_sku` y `product_snapshot` para conservar historial aunque el producto cambie después.

## Checkout y pagos

- El checkout es simulado: no hay Stripe, pasarela real, webhooks ni cobros externos.
- El backend soporta `card`, `transfer` y `cash` como metodos de pago simulados.
- Los datos de tarjeta son write-only, se validan para la simulacion y no se guardan crudos; solo se conserva metadata enmascarada.
- Tarjetas terminadas en `0000` simulan rechazo para probar errores.
- Transferencia y efectivo quedan en estado pendiente hasta que staff/admin marque el pago simulado como recibido o fallido desde la gestion interna.
- El frontend no guarda credenciales de proveedores ni datos persistentes de tarjeta.

## APIs externas

- El frontend no llama APIs externas de geocodificación o rutas.
- Backend encapsula proveedores, errores y normalización de respuestas.
- La key de OpenRouteService se configura solo en `backend/.env` como `OPENROUTESERVICE_API_KEY`.
- Las pruebas mockean proveedores externos.

## Infraestructura

La carpeta `infra/` queda reservada. No se documenta Docker, Nginx, Caddy o despliegue como terminado mientras no esté implementado y probado.
