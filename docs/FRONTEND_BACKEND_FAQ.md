# Preguntas frecuentes frontend + backend

## 1. Para crear cuenta e iniciar sesión debemos usar Axios?

No directamente. El proyecto ya tiene Axios configurado en `frontend/src/services/apiClient.js`.

Lo recomendado es usar los helpers existentes:

- Login: `useAuthStore((state) => state.login)`
- Registro: `registerCustomer(...)` desde `frontend/src/auth/authService.js`
- Otros endpoints: servicios en `frontend/src/services/backendServices.js`

## 2. Entonces las vistas no deben importar Axios?

Preferentemente no. Las vistas deberían importar servicios del proyecto, no crear llamadas HTTP sueltas. Así todas las pantallas comparten base URL, token, errores y headers.

## 3. Dónde está la URL del backend?

En `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_BACKEND_ORIGIN=http://localhost:8000
```

## 4. Cómo se guarda la sesión?

`frontend/src/auth/authStore.js` maneja la sesión con Zustand.

`frontend/src/auth/tokenStorage.js` guarda `access`, `refresh` y `user` en `localStorage`.

## 5. Tengo que poner `Authorization` manualmente?

No. `apiClient.js` agrega automáticamente:

```http
Authorization: Bearer <ACCESS_TOKEN>
```

si hay token guardado.

## 6. Qué devuelve el login?

`POST /api/auth/token/` devuelve:

- `access`
- `refresh`
- `user`

El `user` trae `role` con valores del backend: `cliente`, `empleado`, `administrador`.

## 7. Qué roles usamos en frontend?

El backend devuelve roles en español:

- `cliente`
- `empleado`
- `administrador`

El frontend los mapea a:

- `customer`
- `employee`
- `admin`

Ese mapeo está en `frontend/src/auth/roleMapping.js`.

## 8. Cómo protegemos rutas?

`ProtectedRoute` ya lee `authStore`.

- Sin sesión en ruta protegida: manda a `/login`.
- Con sesión pero rol incorrecto: manda a `/no-autorizado`.

## 9. Qué archivo leo primero para integrar una pantalla?

Empieza por `frontend/README.md`.

Después revisa:

- `frontend/src/auth/authStore.js`
- `frontend/src/auth/authService.js`
- `frontend/src/services/backendServices.js`
- `frontend/src/services/apiEndpoints.js`
- `docs/backend/ENDPOINTS_BACKEND.md`

## 10. Cómo conecto `LoginPage`?

Usar:

```js
const login = useAuthStore((state) => state.login);

await login({ email, password });
```

Luego navegar según el rol o según la ruta previa.

## 11. Cómo conecto `RegisterPage`?

Usar `registerCustomer` desde `frontend/src/auth/authService.js`.

El payload esperado puede usar los nombres actuales de la vista:

```js
{
  nombre,
  apellido,
  email,
  telefono,
  estado,
  ciudad,
  password,
  confirmPassword,
}
```

## 12. Cómo muestro errores del backend?

Las llamadas pasan por `apiClient.js` y normalizan errores con `apiErrors.js`.

En un `catch`, normalmente puedes usar:

- `error.message` para mensaje general.
- `error.fieldErrors` para errores por campo.

## 13. Dónde están los endpoints listos?

`frontend/src/services/apiEndpoints.js` tiene las rutas.

`frontend/src/services/backendServices.js` tiene funciones por área:

- `accountService`
- `catalogService`
- `cartService`
- `deliveryService`
- `orderService`
- `inventoryService`
- `dashboardService`

## 14. El frontend debe llamar Nominatim u OpenRouteService?

No. El frontend debe llamar al backend:

- `/api/delivery/geocode/`
- `/api/delivery/estimate/`

## 15. Hay datos mock para trabajar antes de conectar una vista?

Sí. `frontend/src/services/apiFixtures.js` tiene respuestas con forma parecida al backend real.

## 16. Qué le paso a una IA si necesito ayuda y no puede abrir todo el repo?

Pásale:

- `frontend/README.md`
- El archivo de la vista que quieres conectar
- `frontend/src/auth/authStore.js`
- `frontend/src/auth/authService.js`
- `frontend/src/services/backendServices.js`
- `frontend/src/services/apiClient.js`
- `docs/backend/ENDPOINTS_BACKEND.md`

Y dile: "usa los servicios existentes, no crees otro cliente HTTP".

## 17. Para carrito usamos `id` o `sku` del producto?

Para acciones del backend se sigue usando `product_id`, que corresponde al `id` numérico del producto. `sku` es para mostrar, buscar o identificar el item en catálogo/inventario.

El producto ahora también puede traer dimensiones estructuradas y `specifications`; son campos extra para fichas técnicas y filtros, no rompen las vistas que solo usan `name`, `price`, `main_image` o `id`.
