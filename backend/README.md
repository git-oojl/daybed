# Backend de Daybed

Backend REST para Daybed, una tienda de muebles academica con usuarios por rol, catalogo, carrito, checkout y pago simulado, entregas, pedidos, inventario y metricas operativas.

Este archivo es el resumen rapido. La documentacion completa vive en `/docs`.

## Lectura recomendada

| Documento | Uso |
| --- | --- |
| [`../docs/README.md`](../docs/README.md) | Indice general de documentacion del proyecto. |
| [`../docs/backend/README.md`](../docs/backend/README.md) | Vista tecnica del backend, diagramas y contrato OpenAPI. |
| [`../docs/backend/ENDPOINTS_BACKEND.md`](../docs/backend/ENDPOINTS_BACKEND.md) | Endpoints REST, payloads y permisos. |
| [`../docs/backend/MODELO_DATOS.md`](../docs/backend/MODELO_DATOS.md) | Entidades, campos y reglas de datos. |
| [`../docs/backend/openapi.yaml`](../docs/backend/openapi.yaml) | Contrato OpenAPI generado desde Django REST Framework. |
| [`../docs/DECISIONES_TECNICAS.md`](../docs/DECISIONES_TECNICAS.md) | Decisiones de arquitectura y alcance tecnico. |
| [`../docs/API_EXTERNAS.md`](../docs/API_EXTERNAS.md) | Integracion con Nominatim/OpenStreetMap y OpenRouteService. |

## Stack

- Python 3.12
- Django 5
- Django REST Framework
- SimpleJWT con blacklist de refresh tokens
- SQLite como base oficial del MVP local
- `uv` para entorno y dependencias
- `django-environ`, `django-cors-headers`, `django-filter`, `drf-spectacular`
- pytest, ruff y black para calidad

## Ejecucion local

Desde la raiz del repositorio:

```bash
cd backend
uv sync
cp .env.example .env
uv run python manage.py migrate
uv run python manage.py seed_demo
uv run python manage.py check
uv run python manage.py runserver
```

URLs locales:

```text
Backend: http://localhost:8000
Swagger: http://localhost:8000/api/docs/
OpenAPI: http://localhost:8000/api/schema/
```

## Variables principales

Archivo esperado:

```text
backend/.env
```

Valores base para desarrollo:

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

EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
DEFAULT_FROM_EMAIL=no-reply@daybed.local
FRONTEND_PASSWORD_RESET_URL=http://localhost:5173/restablecer-password
```

Los valores `STORE_LATITUDE`, `STORE_LONGITUDE`, `DELIVERY_BASE_FEE` y
`DELIVERY_PRICE_PER_KM` son fallback/bootstrap para crear la configuración
persistente inicial de tienda. Después de creada, la API usa
`/api/store/settings/` como fuente de verdad para origen, tarifas y umbral de
envío gratis.

`OPENROUTESERVICE_API_KEY` puede quedar vacio para instalar, probar y correr el backend. Para probar el flujo completo de checkout con distancia y duracion reales, debe configurarse en `backend/.env`:

```env
OPENROUTESERVICE_API_KEY=tu_api_key_de_openrouteservice
```

No se debe poner la key real en archivos versionados ni en variables del frontend. Nominatim/OpenStreetMap no requiere key; OpenRouteService se usa desde el backend para rutas.

En desarrollo, `EMAIL_BACKEND` usa consola para imprimir los enlaces de
recuperacion de contraseña. En producción debe configurarse un backend SMTP o
proveedor transaccional real y `FRONTEND_PASSWORD_RESET_URL` debe apuntar a la
ruta pública del frontend.

## Datos semilla locales

Cada persona del equipo debe crear su propia base SQLite local con migraciones y semillas. Este paso es parte del setup normal: sin semillas, el frontend y las pruebas manuales no tienen estados realistas de catálogo, carrito, pedidos e inventario.

No conviene sincronizar `db.sqlite3` entre teammates porque el archivo cambia constantemente, puede pisar trabajo local y no deja historial revisable como las migraciones o el codigo.

Crear o actualizar datos demo:

```bash
uv run python manage.py migrate
uv run python manage.py seed_demo
```

Recrear desde cero solo los datos demo conocidos:

```bash
uv run python manage.py seed_demo --reset
```

Usuarios demo:

| Rol | Email | Password |
| --- | --- | --- |
| Cliente | `cliente@example.com` | `DemoPassword123!` |
| Cliente secundario | `cliente.plus@example.com` | `DemoPassword123!` |
| Empleado | `empleado@example.com` | `DemoPassword123!` |
| Administrador | `admin@example.com` | `DemoPassword123!` |

La semilla incluye configuracion de tienda, categorias activas e inactivas, productos activos e inactivos, SKUs, dimensiones estructuradas, especificaciones flexibles, imagen principal y galerias demo, stock bajo, stock agotado, carritos de clientes, pedidos en todos los estados, pagos simulados e historial de inventario.

Estos usuarios son suficientes para probar endpoints y vistas frontend. Para usar el panel Django Admin en `/admin/` o crear datos manualmente desde la interfaz administrativa de Django, crea un superusuario local:

```bash
uv run python manage.py createsuperuser
```

El superusuario no reemplaza las semillas; es una herramienta opcional para edición manual local.

## Contrato rapido para frontend

Base API:

```text
http://localhost:8000/api
```

Login con correo:

```http
POST /api/auth/token/
Content-Type: application/json
```

```json
{
  "email": "cliente@example.com",
  "password": "DemoPassword123!"
}
```

Respuesta:

```json
{
  "access": "<ACCESS_TOKEN>",
  "refresh": "<REFRESH_TOKEN>",
  "user": {
    "id": 1,
    "username": "cliente",
    "email": "cliente@example.com",
    "first_name": "Cliente",
    "last_name": "Demo",
    "phone": "5550101",
    "state": "Baja California",
    "city": "Tijuana",
    "role": "cliente"
  }
}
```

Usar endpoints protegidos:

```http
Authorization: Bearer <ACCESS_TOKEN>
```

Registro compatible con las vistas actuales:

```http
POST /api/accounts/register/
Content-Type: application/json
```

Este endpoint de registro publico siempre crea cuentas `cliente`. Las cuentas `empleado` y `administrador` son privilegiadas y deben crearse desde la gestion interna de usuarios por un administrador o, en desarrollo local, desde Django Admin/superuser.

Checkout y pago simulado:

```http
POST /api/checkout/
Content-Type: application/json
```

`payment_method` acepta `card`, `transfer` o `cash`. Para `card`, los campos `card_number`, `card_expiry` y `card_cvv` son solo de entrada: el backend valida formato basico, simula autorizacion y guarda solo datos enmascarados. Tarjetas terminadas en `0000` simulan rechazo. Para `transfer` y `cash`, el pedido queda pendiente de confirmacion simulada hasta que staff/admin marque el pago como recibido desde la vista interna o con `PATCH /api/manage/orders/{id}/`.

```json
{
  "nombre": "Cliente",
  "apellido": "Demo",
  "email": "cliente@example.com",
  "telefono": "5550101",
  "estado": "Baja California",
  "ciudad": "Tijuana",
  "password": "DemoPassword123!",
  "confirmPassword": "DemoPassword123!"
}
```

Logout:

```http
POST /api/auth/logout/
Content-Type: application/json
```

```json
{
  "refresh": "<REFRESH_TOKEN>"
}
```

## Roles

| Rol | Uso |
| --- | --- |
| `cliente` | Perfil propio, carrito, checkout y pedidos propios. |
| `empleado` | Operacion interna segun el paquete configurable de permisos operativos. |
| `administrador` | Gestion de usuarios internos y permisos operativos completos. |

Los superusuarios de Django tambien cuentan como administradores. Solo
`empleado` tiene permisos configurables en `/api/access/roles/empleado/`.
`cliente`, `administrador`, user management, permission management y store
settings no son togglables. La API rechaza roles fuera de `cliente`,
`empleado`, `administrador`; un visitante sin sesion es anonimo, no rol
`invitado`.

## Reglas backend relevantes

- El correo de usuarios se normaliza a minusculas y se valida como unico sin distinguir mayusculas/minusculas.
- `/api/accounts/register/` crea solamente cuentas `cliente`; empleados y administradores se gestionan por administradores.
- `/api/accounts/me/` devuelve `effective_permission_codes`; se calculan contra permisos actuales, no como claims permanentes del JWT.
- No se permite desactivar o degradar accidentalmente al ultimo administrador/superuser activo desde la gestion interna.
- La gestion de productos rechaza precios negativos.
- Checkout rechaza datos de entrega negativos o coordenadas fuera de rango.
- Checkout recalcula `delivery_fee` desde la configuración persistente de tienda y aplica envío gratis por umbral.
- Checkout rechaza carritos con productos inactivos o categorias inactivas.
- Checkout simula pagos con tarjeta, transferencia y efectivo; no guarda datos crudos de tarjeta ni realiza cobros reales.
- Staff/admin puede marcar pagos simulados de transferencia o efectivo como recibidos desde el detalle interno del pedido.
- El stock se descuenta al confirmar el pedido, no al agregar al carrito ni al crear el pedido `pending`.
- `Product` sigue siendo el item comprable/SKU del MVP: tiene `sku`, dimensiones estructuradas opcionales y `specifications` JSON para especificaciones por categoría sin introducir variantes ni EAV.
- No existe campo libre `dimensions`; las dimensiones se guardan en campos numéricos.
- `OrderItem` guarda snapshot del producto comprado para preservar historial aunque el catálogo cambie.

## Comandos utiles

```bash
uv run python manage.py migrate
uv run python manage.py makemigrations --check --dry-run
uv run python manage.py check
uv run pytest -q
uv run ruff check .
uv run black --check .
```

Crear superusuario local para `/admin/`:

```bash
uv run python manage.py createsuperuser
```

## Base de datos

SQLite es la base oficial para el MVP local. No subir `db.sqlite3` ni respaldos al repositorio.

Para compartir un estado inicial entre el equipo, actualizar migraciones, el comando `seed_demo` y la documentacion. Evitar pasar archivos `.sqlite3` salvo como respaldo puntual entre dos personas, nunca como fuente oficial del proyecto.

Antes de cambios riesgosos sobre una base local con datos utiles:

```bash
cp db.sqlite3 "db.sqlite3.bak-$(date +%Y%m%d-%H%M%S)"
```
