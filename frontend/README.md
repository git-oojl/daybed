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

## Integración con backend

- La API base local es `http://localhost:8000/api`.
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

## Vistas y preview de desarrollo

Existe documentación específica de las vistas base en:

```text
docs/FRONTEND_VIEWS.md
```

El helper de preview es solo para desarrollo y está protegido por `import.meta.env.DEV`, por lo que no debe aparecer en builds de producción.
