# Documentación del backend

Esta carpeta contiene documentación técnica del backend de Daybed, incluyendo diagramas del sistema y el contrato OpenAPI de la API REST.

## Arquitectura general del backend

![Arquitectura del backend](./diagrams/arquitectura_backend.png)

El backend está organizado en módulos funcionales: autenticación, cuentas de usuario, catálogo, carrito, pedidos, inventario, entregas, configuración de tienda y dashboard administrativo. Esta separación permite mantener responsabilidades claras entre las partes principales del sistema.

La autenticación pública está preparada para las vistas actuales del frontend: login con `email` y `password`, registro de cliente con los campos `nombre`, `apellido`, `telefono`, `estado`, `ciudad`, `password` y `confirmPassword`, perfil propio en `/api/accounts/me/`, refresh de tokens y logout con blacklist del refresh token.

El catálogo mantiene `Product` como item comprable/SKU del MVP. Para evitar rigidez sin sobrediseñar, producto incluye `sku`, dimensiones estructuradas opcionales y `specifications` JSON; las categorías pueden declarar `specification_schema` para documentar qué specs existen y cuáles son filtrables. No hay campo libre `dimensions`, `ProductVariant` ni EAV en esta etapa.

## Diagrama entidad-relación

![Diagrama ERD del backend](./diagrams/diagrama_erd_backend.png)

El diagrama entidad-relación fue generado a partir de los modelos definidos en Django. Representa el diseño lógico de entidades y relaciones utilizadas por el backend.

## Flujo del pedido

![Flujo del pedido](./diagrams/flujo_pedido.png)

Este flujo representa el proceso principal de negocio: el cliente agrega productos al carrito, confirma el pedido, el sistema valida el stock, crea el pedido y actualiza el inventario.

## Contrato OpenAPI

El archivo [`openapi.yaml`](./openapi.yaml) contiene la especificación OpenAPI generada desde Django REST Framework. Esta especificación documenta los endpoints, métodos HTTP, esquemas de entrada, respuestas y autenticación de la API.

El resumen manual de payloads y permisos está en [`ENDPOINTS_BACKEND.md`](./ENDPOINTS_BACKEND.md).

## Datos semilla para desarrollo

El backend incluye un comando de semillas para que cada integrante trabaje con su propia base SQLite local sin compartir `db.sqlite3`. Es parte del setup normal del proyecto:

```bash
cd backend
uv run python manage.py migrate
uv run python manage.py seed_demo
```

Para limpiar y recrear solo los datos demo conocidos:

```bash
uv run python manage.py seed_demo --reset
```

Credenciales incluidas:

| Rol | Email | Password |
| --- | --- | --- |
| Cliente | `cliente@example.com` | `DemoPassword123!` |
| Empleado | `empleado@example.com` | `DemoPassword123!` |
| Administrador | `admin@example.com` | `DemoPassword123!` |

La semilla cubre catálogo con SKUs y dimensiones estructuradas, carrito, pedidos en todos los estados e inventario. El detalle de entidades está en [`MODELO_DATOS.md`](./MODELO_DATOS.md).

Estos usuarios sirven para probar API y frontend. Para entrar a `/admin/` y editar datos manualmente desde Django Admin, crear un superusuario local:

```bash
uv run python manage.py createsuperuser
```

El superusuario es opcional para integración API/frontend y no reemplaza `seed_demo`.

## Archivos incluidos

```text
docs/backend/
  openapi.yaml
  diagrams/
    arquitectura_backend.mmd
    arquitectura_backend.png
    diagrama_erd_backend.png
    flujo_pedido.mmd
    flujo_pedido.png
```

## Cobertura de pruebas

La cobertura de pruebas se puede generar localmente con:

```bash
cd backend
uv run coverage erase
uv run coverage run -m pytest
uv run coverage report
uv run coverage html
```

El reporte HTML se genera en:

```text
backend/htmlcov/index.html
```
