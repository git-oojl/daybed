# Daybed

Daybed es una aplicación web full-stack para una tienda de muebles. El proyecto combina un backend en **Django REST Framework** con un frontend en **React/Vite** para cubrir un flujo académico realista: catálogo, cuentas de cliente, carrito, checkout simulado, estimación de entrega, pedidos, inventario y panel interno.

El MVP no procesa pagos reales ni gestiona logística real. La entrega se estima con APIs externas desde el backend y los pedidos se manejan con estados internos.

## Estado del proyecto

La base backend ya incluye:

- API REST con Django REST Framework.
- Autenticación JWT.
- Usuario personalizado con roles `cliente`, `empleado` y `administrador`.
- Catálogo público y endpoints de gestión para personal.
- Carrito autenticado para clientes.
- Checkout simulado y creación de pedidos.
- Estimación de entrega mediante servicios externos encapsulados en backend.
- Gestión operativa de inventario.
- Métricas básicas de dashboard.
- Pruebas backend con `pytest`.
- Herramientas de calidad con `ruff` y `black`.

El frontend contiene estructura y vistas base para que el equipo implemente UI e integración con la API.

## Estructura

```text
daybed/
├── backend/        # API Django/DRF
├── frontend/       # React/Vite
├── docs/           # Documentación técnica y funcional
├── infra/          # Espacio reservado para infraestructura futura
├── .gitignore
└── README.md
```

## Requisitos

- Git.
- Python 3.12 gestionado con `uv`.
- Node.js LTS y npm.
- WSL2/Linux recomendado para desarrollo local.

## Configuración rápida en WSL2/Linux

Clonar el proyecto:

```bash
git clone <URL_DEL_REPOSITORIO>
cd daybed
```

Backend:

```bash
cd backend
uv sync
cp .env.example .env
uv run python manage.py migrate
uv run python manage.py check
uv run python manage.py runserver
```

Frontend, en otra terminal:

```bash
cd frontend
npm ci
cp .env.example .env
npm run dev
```

URLs locales principales:

```text
Backend: http://localhost:8000
API docs: http://localhost:8000/api/docs/
Frontend: http://localhost:5173
```

## Variables de entorno

No se debe versionar ningún archivo `.env`. Cada integrante debe crear su copia local desde los ejemplos:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Para usar estimación real de distancia, `backend/.env` necesita una API key de OpenRouteService:

```env
OPENROUTESERVICE_API_KEY=tu-api-key-local
```

Las pruebas automatizadas no deben depender de servicios externos reales.

## Comandos útiles

Backend:

```bash
cd backend
uv run python manage.py check
uv run python manage.py makemigrations --check --dry-run
uv run pytest -q
uv run ruff check .
uv run black --check .
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

## Documentación

- [Backend](backend/README.md)
- [Frontend](frontend/README.md)
- [Índice de documentación](docs/README.md)
- [Endpoints backend](docs/ENDPOINTS_BACKEND.md)
- [Modelo de datos](docs/MODELO_DATOS.md)
- [APIs externas](docs/API_EXTERNAS.md)
- [Alcance del MVP](docs/ALCANCE.md)
- [Decisiones técnicas](docs/DECISIONES_TECNICAS.md)
- [Flujo de contribución](docs/CONTRIBUCION.md)

## Convenciones de seguridad

- No subir `.env`, bases SQLite locales, respaldos de base de datos, cachés ni archivos generados.
- No usar credenciales reales en commits, issues, capturas o documentación.
- No ejecutar comandos destructivos contra bases compartidas.
- No hacer llamadas reales a pagos, correos, SMS, webhooks o servicios de producción.
- No afirmar que Stripe, logística real o despliegue productivo existen si no están implementados y probados.

## Notas para Windows

El flujo recomendado es trabajar desde WSL2. Si se usa PowerShell, los comandos equivalentes principales son:

```powershell
Copy-Item .env.example .env
```

En backend se mantiene la regla: usar siempre `uv run python manage.py ...`, no `python manage.py ...` directamente.
