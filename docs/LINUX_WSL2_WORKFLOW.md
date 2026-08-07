# Flujo de desarrollo en Debian / WSL2

Este documento es la guía operativa recomendada para trabajar Daybed en Debian mediante WSL2. El `README.md` raíz conserva el setup manual general del proyecto; esta guía describe el flujo automatizado y reproducible usado para desarrollo, validación y trabajo con el entorno hermético.

## Principio: Git y `.vendor` son capas distintas

Daybed se maneja como dos capas:

1. **Código fuente (Git)**: backend, frontend, migraciones, tests, scripts, lockfiles y documentación.
2. **Entorno hermético (`.vendor`)**: Python, Node/npm, uv, cachés offline y Chromium para Playwright.

`.vendor/` está ignorado por Git. Un `git clone` nunca lo descarga. El entorno se recupera desde un único **environment anchor** (`*.tar.gz`) o se reconstruye desde Internet.

El nombre y la ubicación del clone no son importantes. Los scripts detectan la raíz del proyecto a partir de su propia ubicación.

## Estructura recomendada

Ejemplo solamente; los nombres pueden cambiar:

```text
~/src/daybed-playwright-build/
├── daybed-pase-final/                 # clone Git activo
├── daybed-environment-anchor.tar.gz   # único bundle hermético vigente
└── daybed-environment-anchor.tar.gz.sha256  # opcional
```

No hace falta guardar decenas de bundles. Conserva solo el anchor vigente y Git como historial del código.

## Flujo diario

Desde la raíz del proyecto:

```bash
git status
make bootstrap
# desarrollar
make validate
make smoke
git diff
git add -A
git commit -m "..."
git push
```

### `make bootstrap`

Hace que el checkout quede ejecutable usando `.vendor`:

- crea `backend/.env` y `frontend/.env` desde los ejemplos si faltan;
- reconstruye/sincroniza `backend/.venv` desde `backend/uv.lock` usando el caché vendorizado;
- reconstruye `frontend/node_modules` desde `frontend/package-lock.json` usando el caché vendorizado;
- aplica migraciones;
- ejecuta `seed_demo`;
- ejecuta `manage.py check`.

Se puede volver a ejecutar después de cambiar de branch, aplicar un paquete de cambios, agregar migraciones o borrar estado local.

### `make validate`

Verifica consistencia sin depender del navegador:

- Django system check;
- `makemigrations --check --dry-run`;
- `migrate --check`;
- pytest del backend;
- ESLint;
- build de Vite;
- tests del frontend.

Debe ejecutarse antes de aceptar/commitear cambios importantes.

### `make smoke`

Prueba la aplicación real:

- inicia Django en `127.0.0.1:8000`;
- inicia Vite en `127.0.0.1:5173`;
- lanza Chromium mediante Playwright;
- recorre las rutas definidas en `frontend/tests/routeSmoke.test.mjs`;
- falla ante errores de página/console o fallos de render.

`make smoke` ya ejecuta el browser check. `make browser-check` se usa principalmente para diagnosticar Chromium de forma aislada.

## Recuperación después de un clone completamente nuevo

### 1. Clonar la branch correcta

```bash
cd ~/src/daybed-playwright-build
git clone git@github.com:git-oojl/daybed.git daybed-pase-final
cd daybed-pase-final
git switch pase-final
```

### 2. Restaurar `.vendor`

**Este paso va antes de `make bootstrap`** en el flujo hermético/offline.

```bash
make restore-vendor VENDOR_ARCHIVE=../daybed-environment-anchor.tar.gz
```

Equivalente directo:

```bash
bash scripts/restore-vendor.sh ../daybed-environment-anchor.tar.gz
```

`restore-vendor.sh` es agnóstico al nombre/path tanto del clone como del proyecto contenido en el tar. Además:

- revisa rutas inseguras antes de extraer;
- localiza exactamente un `.vendor` dentro del bundle;
- compara `agent/runtime.env`, `backend/pyproject.toml`, `backend/uv.lock`, `frontend/package.json` y `frontend/package-lock.json` entre el bundle y el checkout;
- rechaza anchors incompatibles;
- repara symlinks para la ubicación actual;
- ejecuta `agent-doctor.sh`;
- si se reemplazaba un `.vendor` existente y algo falla, restaura el anterior.

No uses `--force` para saltar incompatibilidades salvo que sepas exactamente por qué el anchor y los lockfiles son diferentes.

### 3. Recrear estado local y validar

```bash
make doctor
make bootstrap
make validate
make smoke
```

Si Chromium no abre por librerías del sistema después de reinstalar completamente Debian/WSL2:

```bash
make browser-deps
make browser-check
make smoke
```

`make browser-deps` usa Playwright para instalar las dependencias Debian/Ubuntu del Chromium vendorizado y requiere `sudo`.

## Servidores para desarrollo

```bash
make serve
```

O por separado:

```bash
make backend
make frontend
```

URLs locales:

- frontend: `http://localhost:5173`
- backend: `http://localhost:8000`
- API: `http://localhost:8000/api`
- Django admin: `http://localhost:8000/admin/`

## Variables de entorno y seed

El flujo Make no cambia el modelo del proyecto descrito en el README:

- `backend/.env.example` sigue siendo la plantilla del backend;
- `frontend/.env.example` sigue siendo la plantilla del frontend;
- `backend/.env` y `frontend/.env` siguen siendo locales y no se versionan;
- `seed_demo` sigue siendo la fuente de datos demo reproducibles;
- `db.sqlite3` sigue siendo estado local y no se versiona.

Para rutas reales de OpenRouteService agrega la key únicamente a `backend/.env`. El bootstrap no inventa ni versiona secretos.

## Trial by fire de recuperación

Para demostrar que Git + anchor bastan para reconstruir el entorno:

```bash
cd ~/src/daybed-playwright-build
mv daybed-pase-final daybed-pase-final.previous

git clone git@github.com:git-oojl/daybed.git daybed-pase-final
cd daybed-pase-final
git switch pase-final

make restore-vendor VENDOR_ARCHIVE=../daybed-environment-anchor.tar.gz
make doctor
make bootstrap
make validate
make smoke
make bundle
```

`make bundle` debe producir un nuevo `*-openai-sandbox-linux-x86_64-playwright-ready.tar.gz` junto al clone y ejecutar aceptación en una extracción fría aleatoria. Si ya existe un anchor con ese nombre, permanece intacto hasta que el candidato nuevo haya pasado toda la aceptación; solo entonces se reemplaza.

Cuando el trial pase y confirmes que el nuevo bundle es válido, puedes borrar el clone anterior y reemplazar el anchor viejo por el nuevo si quieres conservar un único checkpoint binario.
