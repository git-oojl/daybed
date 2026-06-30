# Backend de Daybed

Backend REST para Daybed, una tienda de muebles académica con catálogo, usuarios por rol, carrito, checkout simulado, estimación de entrega, pedidos, inventario y métricas básicas.

## Stack

- Python 3.12
- Django 5
- Django REST Framework
- SimpleJWT
- django-environ
- django-cors-headers
- django-filter
- drf-spectacular
- SQLite para MVP local
- `uv` para entorno y dependencias
- pytest / pytest-django
- ruff / black

## Estructura del backend

```text
backend/
├── apps/
│   ├── accounts/    # usuario, roles, perfil, gestión interna de usuarios
│   ├── catalog/     # categorías, productos e imágenes
│   ├── cart/        # carrito del cliente
│   ├── orders/      # checkout, pedidos, estados y snapshots de entrega
│   ├── inventory/   # stock, bajo inventario y movimientos
│   ├── delivery/    # geocodificación, distancia y tarifa simulada
│   └── dashboard/   # métricas operativas básicas
├── config/          # settings, urls, health endpoint
├── manage.py
├── pyproject.toml
├── uv.lock
└── .env.example
```

## Instalación local

Desde la raíz del repositorio:

```bash
cd backend
uv sync
cp .env.example .env
uv run python manage.py migrate
uv run python manage.py check
uv run python manage.py runserver
```

El backend queda disponible en:

```text
http://localhost:8000
```

Documentación interactiva de la API:

```text
http://localhost:8000/api/docs/
```

Schema OpenAPI:

```text
http://localhost:8000/api/schema/
```

## Variables de entorno

Archivo local esperado:

```bash
backend/.env
```

Crear desde el ejemplo:

```bash
cp .env.example .env
```

Variables principales:

```env
DJANGO_SECRET_KEY=change-me
DJANGO_JWT_SIGNING_KEY=change-me-too
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173

NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org
NOMINATIM_USER_AGENT=daybed-student-project/1.0
OPENROUTESERVICE_BASE_URL=https://api.openrouteservice.org
OPENROUTESERVICE_API_KEY=

STORE_LATITUDE=32.5149
STORE_LONGITUDE=-117.0382
DELIVERY_BASE_FEE=80.00
DELIVERY_PRICE_PER_KM=8.00
```

`OPENROUTESERVICE_API_KEY` puede quedar vacío para instalar y correr pruebas, pero el endpoint real de estimación devolverá error controlado si no está configurado.

## Roles

El backend usa un usuario personalizado con estos roles:

| Rol | Uso |
| --- | --- |
| `cliente` | Compra, carrito, checkout y pedidos propios. |
| `empleado` | Operación interna: productos, inventario y pedidos. |
| `administrador` | Acceso completo, incluyendo usuarios internos y roles. |

Los superusuarios de Django también se consideran administradores para permisos internos.

## Endpoints principales

Todos los endpoints de negocio están bajo `/api/`.

### Salud, auth y documentación

| Método | Endpoint | Acceso | Descripción |
| --- | --- | --- | --- |
| GET | `/api/health/` | Público | Verifica que la API responda. |
| POST | `/api/auth/token/` | Público | Obtiene access/refresh JWT. |
| POST | `/api/auth/token/refresh/` | Público | Refresca access token. |
| GET | `/api/schema/` | Público | Schema OpenAPI. |
| GET | `/api/docs/` | Público | Swagger UI. |

### Cuentas

| Método | Endpoint | Acceso | Descripción |
| --- | --- | --- | --- |
| POST | `/api/accounts/register/` | Público | Registra cliente. |
| GET/PATCH/PUT | `/api/accounts/me/` | Autenticado | Perfil propio. |
| CRUD sin DELETE | `/api/accounts/users/` | Administrador | Gestión de usuarios internos. |

### Catálogo

| Método | Endpoint | Acceso | Descripción |
| --- | --- | --- | --- |
| GET | `/api/catalog/categories/` | Público | Categorías activas. |
| GET | `/api/catalog/products/` | Público | Productos activos. |
| GET | `/api/catalog/products/{id}/` | Público | Detalle de producto activo. |
| CRUD | `/api/catalog/manage/categories/` | Empleado/Admin | Gestión de categorías. |
| CRUD | `/api/catalog/manage/products/` | Empleado/Admin | Gestión de productos. DELETE desactiva producto. |

### Carrito

| Método | Endpoint | Acceso | Descripción |
| --- | --- | --- | --- |
| GET | `/api/cart/` | Cliente | Ver carrito propio. |
| DELETE | `/api/cart/` | Cliente | Vaciar carrito. |
| GET/POST | `/api/cart/items/` | Cliente | Listar/agregar items. |
| GET/PATCH/PUT/DELETE | `/api/cart/items/{id}/` | Cliente | Gestionar item propio. |

### Entrega

| Método | Endpoint | Acceso | Descripción |
| --- | --- | --- | --- |
| POST | `/api/delivery/geocode/` | Cliente | Geocodifica dirección. |
| POST | `/api/delivery/estimate/` | Cliente | Calcula distancia, duración y tarifa. |

### Checkout y pedidos

| Método | Endpoint | Acceso | Descripción |
| --- | --- | --- | --- |
| POST | `/api/checkout/` | Cliente | Crea pedido simulado desde carrito. |
| GET | `/api/orders/` | Cliente | Lista pedidos propios. |
| GET | `/api/orders/{id}/` | Cliente | Detalle de pedido propio. |
| GET | `/api/manage/orders/` | Empleado/Admin | Lista pedidos de clientes. |
| GET/PATCH/PUT | `/api/manage/orders/{id}/` | Empleado/Admin | Consulta o actualiza estado. |

### Inventario y dashboard

| Método | Endpoint | Acceso | Descripción |
| --- | --- | --- | --- |
| GET | `/api/inventory/products/` | Empleado/Admin | Productos con datos de stock. |
| GET | `/api/inventory/low-stock/` | Empleado/Admin | Productos bajo inventario. |
| PATCH/PUT | `/api/inventory/products/{id}/stock/` | Empleado/Admin | Actualiza stock/mínimo. |
| GET | `/api/inventory/movements/` | Empleado/Admin | Historial de movimientos. |
| GET | `/api/dashboard/metrics/` | Empleado/Admin | Métricas básicas. |

## Autenticación para pruebas manuales

Registrar cliente:

```bash
curl -X POST http://localhost:8000/api/accounts/register/ \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "cliente_demo",
    "email": "cliente_demo@example.com",
    "password": "DemoPassword123!",
    "first_name": "Cliente",
    "last_name": "Demo"
  }'
```

Obtener token:

```bash
curl -X POST http://localhost:8000/api/auth/token/ \
  -H 'Content-Type: application/json' \
  -d '{"username": "cliente_demo", "password": "DemoPassword123!"}'
```

Usar token:

```bash
curl http://localhost:8000/api/accounts/me/ \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

## Reglas de negocio importantes

- El catálogo público solo muestra productos y categorías activas.
- El carrito requiere usuario con rol `cliente`.
- No hay carrito de invitado en el MVP.
- Agregar productos al carrito no descuenta stock.
- El checkout crea un pedido `pending` y vacía el carrito.
- El stock se descuenta al confirmar el pedido, no al crearlo.
- Los pedidos guardan snapshot de entrega para no depender de APIs externas al consultarlos después.
- Los movimientos de inventario son append-only y no se eliminan desde la API.
- Los productos se desactivan en lugar de eliminarse físicamente.

## Migraciones y base de datos

SQLite es la base local del MVP.

Aplicar migraciones:

```bash
uv run python manage.py migrate
```

Verificar que no faltan migraciones:

```bash
uv run python manage.py makemigrations --check --dry-run
```

Antes de cambios riesgosos sobre una base local con datos útiles:

```bash
cp db.sqlite3 "db.sqlite3.bak-$(date +%Y%m%d-%H%M%S)"
```

No subir `db.sqlite3` ni respaldos al repositorio.

## Pruebas y calidad

Ejecutar todo:

```bash
uv run python manage.py check
uv run python manage.py makemigrations --check --dry-run
uv run pytest -q
uv run ruff check .
uv run black --check .
```

Formatear backend:

```bash
uv run black .
uv run ruff check . --fix
```

Las pruebas de servicios externos deben usar mocks. No deben depender de Nominatim ni OpenRouteService en vivo.

## Crear superusuario local

```bash
uv run python manage.py createsuperuser
```

Un superusuario tiene permisos de administración aunque su campo `role` no sea `administrador`.

## Notas para el equipo frontend

- La base de la API es `http://localhost:8000/api`.
- Autenticación: JWT Bearer token.
- El frontend no debe llamar directamente a Nominatim ni a OpenRouteService.
- Usar `/api/delivery/geocode/` y `/api/delivery/estimate/` durante checkout.
- La documentación Swagger local está en `/api/docs/`.
