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
- El backend genera `username` si el cliente no lo envía.
- Público: catálogo activo.
- Cliente: perfil propio, carrito, checkout y pedidos propios.
- Empleado: operación interna de productos, inventario y pedidos.
- Administrador: gestión de usuarios y roles además de permisos operativos.

## Inventario

- El stock no baja al agregar productos al carrito.
- El stock no baja al crear pedido `pending`.
- El stock baja al confirmar pedido.
- Los movimientos de inventario son append-only.
- Los productos deben desactivarse en lugar de borrarse físicamente.

## APIs externas

- El frontend no llama APIs externas de geocodificación o rutas.
- Backend encapsula proveedores, errores y normalización de respuestas.
- Las pruebas mockean proveedores externos.

## Infraestructura

La carpeta `infra/` queda reservada. No se documenta Docker, Nginx, Caddy o despliegue como terminado mientras no esté implementado y probado.
