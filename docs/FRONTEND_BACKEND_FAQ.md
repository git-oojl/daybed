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
También trae `effective_permission_codes`, que el frontend usa para ocultar navegación y controles internos no autorizados.

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

No hay roles `editor` ni `invitado`. Un visitante sin sesión es anónimo; el frontend puede mostrarlo como `Visitante no autenticado` solo como referencia de capacidades públicas.

## 8. Cómo protegemos rutas?

`ProtectedRoute` ya lee `authStore`.

- Sin sesión en ruta protegida: manda a `/login`.
- Con sesión pero rol incorrecto: manda a `/no-autorizado`.
- En rutas internas de empleado, también puede exigir `requiredPermission`.

El backend siempre es la autoridad final: una ruta oculta en frontend no reemplaza
los permisos DRF, y una respuesta `403` debe tratarse como decisión definitiva.

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

Ese registro publico crea siempre cuentas `cliente`. Las cuentas `empleado` y `administrador` no se crean desde el registro publico; se crean por un administrador desde gestion interna o desde Django Admin en desarrollo.

## 12. Cómo conecto el pago del checkout?

Usar `/api/checkout/` a través de los servicios existentes. El checkout es simulado y acepta:

- `payment_method: "card"`
- `payment_method: "transfer"`
- `payment_method: "cash"`

Para tarjeta, enviar también `card_number`, `card_expiry` y `card_cvv`. Esos campos son solo de entrada y no deben guardarse en estado persistente del frontend. Para transferencia y efectivo, el pedido queda pendiente hasta que una pantalla interna marque el pago simulado como recibido con `orderService.updatePaymentStatus(...)`.

## 13. Cómo muestro errores del backend?

Las llamadas pasan por `apiClient.js` y normalizan errores con `apiErrors.js`.

En un `catch`, normalmente puedes usar:

- `error.message` para mensaje general.
- `error.fieldErrors` para errores por campo.

## 14. Dónde están los endpoints listos?

`frontend/src/services/apiEndpoints.js` tiene las rutas.

`frontend/src/services/backendServices.js` tiene funciones por área:

- `accountService`
- `catalogService`
- `cartService`
- `deliveryService`
- `storeService`
- `orderService`
- `inventoryService`
- `dashboardService`
- `accessService`

## 15. El frontend debe llamar Nominatim u OpenRouteService?

No. El frontend debe llamar al backend:

- `/api/delivery/geocode/`
- `/api/delivery/estimate/`

La configuración global de la única tienda Daybed se consulta y actualiza por backend:

- `/api/store/settings/`

No guardes API keys, proveedores externos ni credenciales en estado frontend. La key de OpenRouteService se configura solo en `backend/.env` como `OPENROUTESERVICE_API_KEY`.

## 16. Hay datos mock para trabajar antes de conectar una vista?

Sí. `frontend/src/services/apiFixtures.js` tiene respuestas con forma parecida al backend real.

## 17. Qué le paso a una IA si necesito ayuda y no puede abrir todo el repo?

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

## 18. Qué pasa con `/dev/preview` cuando el backend está activo?

Sigue existiendo y es seguro usarlo. El Dev Switcher detecta `/api/health/` y muestra si el backend está activo. Si el backend responde, el flujo normal es usar `Modo normal`; si no responde, se puede usar `Modo preview` para revisar vistas con estado simulado.

El panel muestra `Backend activo` o `Backend no disponible`; al pasar el cursor o enfocar esa zona se ven los checks del health check y del modo que aplica para ese estado. El toggle `Normal` / `Preview` cambia entre rutas reales y `/dev/preview`. Sin selección explícita previa en la sesión del navegador, el switcher inicia en `Modo normal` si el backend responde y en `Modo preview` si no responde; después respeta la selección del dev durante esa sesión.

Regla práctica:

- `Modo normal`: usa rutas reales, sesión real guardada, token real y backend real.
- `Modo preview`: usa `/dev/preview`, sesión simulada local, layout/perfil simulados y no guarda login real. Si la vista elegida requiere acceso, el switcher cambia automáticamente a un perfil simulado permitido. Si una ruta interna apunta a una vista registrada, el switcher la traduce de vuelta a `/dev/preview` manteniendo el perfil/layout cuando son compatibles. Esa preferencia no se guarda fuera de la sesión del navegador.

Desde `/dev/preview` no se envía el token real y se bloquean requests de escritura para evitar cambios accidentales en la base local.
