# Flujo de contribución

Guía breve para trabajar en Daybed sin romper el proyecto ni subir archivos locales.

## Antes de empezar

Revisar estado del repositorio:

```bash
git status --short --branch
git log --oneline --decorate -10
```

No mezclar cambios grandes y no relacionados en el mismo commit.

## Backend

Usar siempre `uv`:

```bash
cd backend
uv sync
uv run python manage.py check
uv run pytest -q
```

No usar:

```bash
python manage.py migrate
```

Usar:

```bash
uv run python manage.py migrate
```

## Frontend

```bash
cd frontend
npm ci
npm run lint
npm run build
```

## Antes de subir cambios

Desde la raíz o carpeta correspondiente:

```bash
git diff --check
git diff --stat
```

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

## Archivos que no deben subirse

- `.env`
- `db.sqlite3`
- respaldos de SQLite
- `__pycache__/`
- `.pytest_cache/`
- `.ruff_cache/`
- `node_modules/`
- builds (`dist/`, `build/`)
- archivos ZIP locales
- logs y evidencias temporales

## Migraciones

Si se cambian modelos:

```bash
cd backend
uv run python manage.py makemigrations
uv run python manage.py migrate
uv run python manage.py makemigrations --check --dry-run
```

Revisar el archivo de migración antes de subirlo.

## Base de datos local

Antes de una migración riesgosa sobre datos locales importantes:

```bash
cd backend
cp db.sqlite3 "db.sqlite3.bak-$(date +%Y%m%d-%H%M%S)"
```

No subir la base ni sus respaldos.

## Commits

Usar mensajes claros en español o inglés, según el estilo de la rama.

Ejemplos:

```text
feat: agrega carrito autenticado
fix: corrige transición de pedidos confirmados
docs: actualiza documentación del backend
```

No hacer commits con cambios de formato mezclados con cambios funcionales grandes.
