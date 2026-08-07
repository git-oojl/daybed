# Daybed agent contract

This repository is intended to be operable by a coding agent in a Linux x86_64 sandbox with no outbound network access.

## Repository layout

- `backend/`: Django + Django REST Framework, managed with `uv`.
- `frontend/`: React + Vite, managed with `npm`.
- `docs/`: architecture/API/project documentation.
- `scripts/`: deterministic agent bootstrap, validation, and serve commands.
- `.vendor/`: optional hermetic payload containing CPython, Node/npm, uv, and dependency caches for offline sandboxes. It is intentionally not required for normal developer clones, but a sandbox bundle should include it.

## Runtime contract

- Target sandbox OS: Linux x86_64 (validated against Debian GNU/Linux 13 / trixie).
- Python: CPython 3.12.12 for the backend. The backend lock is Python 3.12-only; do not silently run it with 3.13.
- Node.js: 22.16.0.
- npm: 10.9.2.
- uv: 0.10.0 or a compatible newer release.
- Database: local SQLite (`backend/db.sqlite3`). No external DB is required.

The target sandbox may have Python 3.13 system-wide. Ignore that interpreter for backend work. Use the provided `make` targets, which select the project/vendor Python 3.12 runtime.

## First commands

From the repository root:

```bash
make doctor
make bootstrap
make validate
```

If `make bootstrap` reports that `.vendor` is missing, this is not a code failure. The sandbox has no network. Build the fat bundle on an internet-connected Linux x86_64 machine with:

```bash
bash scripts/build-sandbox-bundle.sh
```

Then upload the generated archive instead of the thin source archive.

## Development commands

```bash
make backend      # Django on 0.0.0.0:8000
make frontend     # Vite on 0.0.0.0:5173
make serve        # both processes
make validate     # Django checks/tests + frontend lint/build/tests
make backend-test
make frontend-test
```

Do not call bare `python manage.py ...` unless you have already activated the generated backend environment. Prefer the Makefile/scripts so the correct interpreter and offline cache are selected.

## Local setup performed by bootstrap

`make bootstrap`:

1. copies `backend/.env.example` to `backend/.env` if needed;
2. copies `frontend/.env.example` to `frontend/.env` if needed;
3. creates/synchronizes the backend `.venv` from the lockfile;
4. installs frontend dependencies from `package-lock.json`;
5. runs Django migrations;
6. loads demo data with `seed_demo`.

The `.env` files, SQLite DB, virtualenv, `node_modules`, build outputs, and generated media remain local/ignored.

## Demo accounts

- customer: `cliente@example.com` / `DemoPassword123!`
- secondary customer: `cliente.plus@example.com` / `DemoPassword123!`
- employee: `empleado@example.com` / `DemoPassword123!`
- application admin: `admin@example.com` / `DemoPassword123!`

## Application integration

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- API base: `http://localhost:8000/api`
- Django admin: `http://localhost:8000/admin/`
- Frontend expects `VITE_API_BASE_URL=http://localhost:8000/api`.
- Django CORS is configured for the local Vite origin.

External routing/geocoding integrations may be unavailable in an offline sandbox. Do not treat missing outbound internet or a missing OpenRouteService API key as a frontend/backend boot failure. Tests should mock external HTTP behavior where relevant.

## Change discipline

- Preserve `backend/uv.lock` and `frontend/package-lock.json` unless dependencies are intentionally changed.
- If backend dependencies or Python compatibility change, regenerate `uv.lock` on a networked machine and rebuild the sandbox vendor payload.
- If frontend dependencies change, regenerate `package-lock.json` and rebuild the sandbox vendor payload.
- Add migrations for Django model changes; do not commit the SQLite database.
- Before reporting a task complete, run `make validate`. If a validation step cannot run, report the exact environmental blocker rather than guessing.
- Never add production secrets to `.env.example`, scripts, fixtures, logs, or documentation.

## Browser / E2E contract
- Playwright is pinned by `PLAYWRIGHT_VERSION` in `agent/runtime.env`.
- Chromium is vendored under `.vendor/playwright-browsers` and selected through `PLAYWRIGHT_BROWSERS_PATH` in `scripts/agent-common.sh`.
- `make browser-check` launches Chromium headlessly and performs a minimal DOM assertion.
- `make smoke` boots Django + Vite and runs `frontend/tests/routeSmoke.test.mjs` against the real rendered application.
- The final sandbox upload must not rely on downloading browsers at runtime.
