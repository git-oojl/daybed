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
```

No se debe versionar `frontend/.env`.

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

## Integración con backend

- La API base local es `http://localhost:8000/api`.
- El login usa JWT en `/api/auth/token/`.
- Las requests protegidas deben enviar:

```http
Authorization: Bearer <ACCESS_TOKEN>
```

- El frontend no debe llamar directamente a Nominatim ni OpenRouteService.
- Para checkout usar los endpoints del backend:
  - `/api/delivery/geocode/`
  - `/api/delivery/estimate/`
  - `/api/checkout/`

## Vistas y preview de desarrollo

Existe documentación específica de las vistas base en:

```text
docs/FRONTEND_VIEWS.md
```

El helper de preview es solo para desarrollo y está protegido por `import.meta.env.DEV`, por lo que no debe aparecer en builds de producción.
