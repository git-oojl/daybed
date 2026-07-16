# Frontend de Daybed

Frontend React/Vite para la tienda de muebles Daybed.

Este lado del proyecto contiene la estructura inicial de rutas, layouts y vistas para que el equipo implemente la interfaz sobre la API del backend.

## Stack

- React
- Vite
- React Router
- npm
- ESLint
- MUI como librería UI propuesta para el MVP

## Instalación local

Desde la raíz del repositorio:

```bash
cd frontend
npm ci
cp .env.example .env
npm run dev
```

El servidor de desarrollo queda disponible en:

```text
http://localhost:5173
```

## Variables de entorno

Archivo local esperado:

```bash
frontend/.env
```

Valor recomendado para desarrollo:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_BACKEND_ORIGIN=http://localhost:8000
```

No se debe versionar `frontend/.env`.

`VITE_API_BASE_URL` se usa por el cliente HTTP. `VITE_BACKEND_ORIGIN` se usa por el proxy local de Vite para llamadas relativas a `/api/...`.

## Comandos

```bash
npm run dev
npm run lint
npm run build
```

## Organización esperada

```text
frontend/src/
├── app/
├── auth/
├── components/
├── dev-preview/
├── layouts/
├── pages/
├── routes/
└── services/
```

## Preparación de integración

El proyecto ya incluye una capa base para integrar las vistas con el backend sin que cada pantalla tenga que resolver configuración, tokens o parsing de errores por separado.

Archivos principales:

- `src/services/apiClient.js`: cliente Axios con `VITE_API_BASE_URL`, JSON headers, bearer token y normalización de errores.
- `src/services/apiEndpoints.js`: constantes de endpoints del backend.
- `src/services/backendServices.js`: funciones por dominio para cuentas, catálogo, carrito, delivery, pedidos, inventario y dashboard.
- `src/services/apiErrors.js`: helpers para mensajes y errores de validación del backend.
- `src/services/apiFixtures.js`: fixtures con forma de respuesta real para armar estados visuales antes de conectar vistas.
- `src/auth/tokenStorage.js`: persistencia de access token, refresh token y usuario.
- `src/auth/authService.js`: login, registro, refresh, logout y perfil propio.
- `src/auth/authStore.js`: store Zustand para sesión de usuario.
- `src/auth/roleMapping.js`: mapeo entre roles del backend y viewers del frontend.

Las vistas todavía no están conectadas a estas funciones. La intención es que el equipo frontend pueda importar servicios y store cuando empiece a cablear cada pantalla.

## Guía simple para conectar una vista

No es obligatorio llamar Axios directamente. La forma recomendada en este proyecto es usar los helpers ya preparados.

Paso 1: si la vista necesita iniciar sesión, usar el store:

```js
import { useAuthStore } from "../../auth/authStore.js";

const login = useAuthStore((state) => state.login);

await login({
  email: formData.email,
  password: formData.password,
});
```

Paso 2: si la vista necesita crear cuenta, usar el servicio de auth:

```js
import { registerCustomer } from "../../auth/authService.js";

await registerCustomer({
  nombre: formData.nombre,
  apellido: formData.apellido,
  email: formData.email,
  telefono: formData.telefono,
  estado: formData.estado,
  ciudad: formData.ciudad,
  password: formData.password,
  confirmPassword: formData.confirmPassword,
});
```

Paso 3: si la vista necesita datos protegidos, usar un servicio del dominio:

```js
import { cartService } from "../../services/backendServices.js";

const cart = await cartService.get();
```

El token se agrega solo desde `apiClient.js`. La vista no necesita armar el header `Authorization` manualmente.

Regla práctica: la vista maneja formulario, loading, errores y navegación; `src/auth/` y `src/services/` manejan backend, tokens y endpoints.

## Integración con backend

- La API base local es `http://localhost:8000/api`.
- Antes de integrar vistas contra datos reales, el backend local debe tener migraciones y semillas cargadas: `uv run python manage.py migrate` y `uv run python manage.py seed_demo` desde `/backend`.
- El login usa JWT en `/api/auth/token/`.
- El login usa `email` y `password`.
- La respuesta de login incluye `access`, `refresh` y `user`.
- Las requests protegidas deben enviar:

```http
Authorization: Bearer <ACCESS_TOKEN>
```

- El registro de cliente acepta los campos actuales de la vista: `nombre`, `apellido`, `email`, `telefono`, `estado`, `ciudad`, `password` y `confirmPassword`.
- Los roles que devuelve el backend son `cliente`, `empleado` y `administrador`.
- El frontend mapea esos roles a `customer`, `employee` y `admin` para `ProtectedRoute` y el preview de desarrollo.
- El frontend no debe llamar directamente a Nominatim ni OpenRouteService.
- Para checkout usar los endpoints del backend:
  - `/api/delivery/geocode/`
  - `/api/delivery/estimate/`
  - `/api/checkout/`
- Productos siguen usando `id` como identificador para carrito (`product_id`). El backend también devuelve `sku`, dimensiones estructuradas (`width_cm`, `height_cm`, `depth_cm`, `length_cm`, `diameter_cm`, `weight_kg`) y `specifications` para mostrar fichas técnicas y filtros sin romper vistas existentes.
- No usar un campo libre `dimensions`; la API activa usa campos numéricos y `structured_dimensions`.
- Los items de pedido devuelven `product_sku` y `product_snapshot` para mostrar el producto comprado aunque el catálogo cambie después.

Ejemplo de login desde una vista:

```js
import { useAuthStore } from "./auth/authStore.js";

const login = useAuthStore((state) => state.login);

await login({
  email: "cliente@example.com",
  password: "DemoPassword123!",
});
```

Ejemplo de consulta protegida:

```js
import { cartService } from "./services/backendServices.js";

const cart = await cartService.get();
```

## Rutas protegidas

`ProtectedRoute` ya lee la sesión desde `authStore`.

- Usuario sin sesión en ruta protegida: redirige a `/login`.
- Usuario autenticado sin rol permitido: redirige a `/no-autorizado`.
- Rutas públicas y de soporte aceptan invitado.
- Rutas de carrito, checkout y cuenta de cliente requieren rol `cliente`.
- Rutas internas aceptan `empleado` y `administrador`.
- Rutas de admin aceptan solo `administrador`.

## Contexto útil para trabajar con IA

Si una IA no puede abrir todo el proyecto, no necesita recibir el zip completo para ayudar con integración. Darle primero estos archivos suele ser suficiente:

- `frontend/README.md`: reglas simples de integración, variables de entorno, rutas protegidas y ejemplos.
- `frontend/src/auth/authStore.js`: estado de sesión, login, refresh, logout y usuario actual.
- `frontend/src/auth/authService.js`: funciones directas de login, registro, refresh, logout y `/accounts/me/`.
- `frontend/src/auth/roleMapping.js`: traducción de roles backend `cliente`, `empleado`, `administrador` a roles frontend.
- `frontend/src/services/apiClient.js`: configuración de Axios, base URL, bearer token y errores.
- `frontend/src/services/backendServices.js`: funciones listas para llamar endpoints por dominio.
- `frontend/src/services/apiEndpoints.js`: mapa completo de rutas del backend.
- `frontend/src/routes/ProtectedRoute.jsx`: lógica de redirección por sesión y rol.
- `docs/backend/ENDPOINTS_BACKEND.md`: payloads reales, permisos y endpoints del backend.
- `docs/backend/openapi.yaml`: contrato OpenAPI completo si la IA puede leer archivos largos.

Para pedir ayuda a una IA con una vista específica, pasar también el archivo de esa página, por ejemplo `frontend/src/pages/account/LoginPage.jsx`, y pedir que use los servicios existentes en lugar de crear otro cliente HTTP.

## Vistas y preview de desarrollo

Existe documentación específica de las vistas base en:

```text
docs/FRONTEND_VIEWS.md
```

El helper de preview es solo para desarrollo y está protegido por `import.meta.env.DEV`, por lo que no debe aparecer en builds de producción.

### Dev preview y backend activo

`/dev/preview` sigue funcionando aunque el backend esté apagado. El Dev Switcher revisa automáticamente `/api/health/` y muestra si el backend está activo o no.

Reglas de seguridad del preview:

- El toggle `Normal` / `Preview` cambia entre rutas reales y `/dev/preview`.
- `Modo normal` usa la sesión real guardada, envía el bearer token real y navega por las rutas reales.
- `Modo preview` usa una sesión simulada local para revisar vista/layout/acceso.
- La opción "Simular como" solo se usa en preview.
- Al cambiar a una vista restringida en preview, el switcher elige automáticamente un perfil simulado con acceso.
- El texto `Backend activo` / `Backend no disponible` muestra si `/api/health/` responde; al pasar el cursor o enfocar se ven los checks del health check y del modo que aplica para ese estado.
- La sesión simulada no se guarda en `localStorage`.
- El preview no envía el bearer token real al backend.
- Desde `/dev/preview`, el cliente API bloquea requests de escritura (`POST`, `PATCH`, `PUT`, `DELETE`) para evitar crear sesiones, pedidos o cambios reales por accidente.
- Para probar login real, checkout real o acciones contra backend, usar las rutas reales, no `/dev/preview`.

Uso recomendado:

- Usar `/dev/preview` para revisar visualmente estados de acceso, layouts y vistas.
- Usar rutas reales con usuarios semilla para probar integración backend completa.
