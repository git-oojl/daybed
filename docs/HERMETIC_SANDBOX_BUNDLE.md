# Entorno hermético y bundles de sandbox

Esta guía documenta qué contiene `.vendor`, cuándo debe actualizarse y cuál script usar. El objetivo es que el entorno Linux/Playwright sea reconstruible sin depender de memoria de conversación, paths específicos o una máquina concreta.

## Contrato versionado

El contrato está en archivos que sí pertenecen a Git:

- `agent/runtime.env`: OS/arquitectura y versiones exactas de Python, Node, npm, uv y Playwright;
- `backend/pyproject.toml` + `backend/uv.lock`;
- `frontend/package.json` + `frontend/package-lock.json`;
- `scripts/`: bootstrap, validación, browser, restore, build, finalización y aceptación;
- `Makefile`;
- `AGENTS.md`.

El payload binario `.vendor/` no pertenece a Git.

## Contenido de `.vendor`

El bundle actual espera, como mínimo:

```text
.vendor/
├── bin/uv
├── node/                    # Node/npm Linux x86_64
├── python/                  # CPython 3.12 vendorizado
├── uv-cache/                # dependencias backend para instalación offline
├── npm-cache/               # dependencias frontend para npm ci offline
└── playwright-browsers/     # Chromium compatible con Playwright
```

## Qué comando usar

### Solo cambió código/documentación/migraciones/tests

No reconstruyas `.vendor`.

Ejemplos: `.gitignore`, componentes React, views/serializers Django, CSS, documentación, migraciones que no agregan paquetes.

Si deseas crear un nuevo anchor con el mismo payload por respaldo/transferencia:

```bash
make bundle
```

Esto ejecuta `scripts/finalize-sandbox-bundle.sh`, no necesita Internet y:

1. preserva temporalmente `.env`, DB, `.venv`, `node_modules`, media y otros estados locales;
2. repara symlinks de `.vendor`;
3. ejecuta doctor/bootstrap/validate/browser-check/smoke;
4. empaqueta sin secretos ni estado mutable;
5. extrae el tar en un path aleatorio y repite aceptación fría;
6. mantiene cualquier anchor anterior intacto mientras valida el candidato; solo lo reemplaza después de aceptación completa;
7. restaura tu estado local original.

### Cambió una dependencia Python/Node o una versión de runtime

Ejemplos:

- `backend/pyproject.toml` / `backend/uv.lock` cambiaron;
- `frontend/package.json` / `frontend/package-lock.json` agregaron/actualizaron paquetes;
- cambió Python, Node, npm o uv en `agent/runtime.env`.

Reconstruye el entorno completo desde Internet:

```bash
make rebuild-bundle
```

Equivale a:

```bash
bash scripts/build-sandbox-bundle.sh
```

Requiere Linux x86_64 con Internet y herramientas host `uv`, Node/npm, `curl` y `tar`. Descarga/congela los runtimes exactos, repuebla los cachés y descarga Chromium según el lock actual. Al final delega al finalizador canónico y produce un `playwright-ready` aceptado.

### Cambió Playwright / Chromium

Si cambias `PLAYWRIGHT_VERSION` o actualizas Playwright deliberadamente:

```bash
make upgrade-browser
```

Equivale a:

```bash
bash scripts/upgrade-browser-bundle.sh
```

Esto actualiza `playwright` de forma exacta en `package.json`/`package-lock.json`, repuebla npm cache, descarga su Chromium correspondiente y termina en el mismo finalizador/aceptación canónicos.

Si además cambió Node/Python/u otras dependencias, prefiere `make rebuild-bundle` para reconstruir todo el payload.

## Restaurar un anchor en otro clone/path

```bash
make restore-vendor VENDOR_ARCHIVE=/ruta/al/anchor.tar.gz
```

No importa si:

- el clone se llama `daybed-pase-final`, `daybed`, `foo` o cualquier otro nombre;
- está en `/home/...`, `/opt/...` u otro path Linux;
- el directorio raíz dentro del tar tiene otro nombre.

El script descubre ambos lados y compara los contratos antes de instalar `.vendor`.

## Validar un tar ya producido

```bash
make accept-bundle BUNDLE=/ruta/al/bundle-playwright-ready.tar.gz
```

La aceptación:

- extrae a un directorio temporal aleatorio;
- exige un único root de proyecto;
- rechaza symlinks absolutos o rotos;
- ejecuta el entorno con `env -i` y PATH mínimo;
- corre doctor, bootstrap, validate, browser-check y smoke.

Eso es la prueba de que el bundle no depende accidentalmente del HOME, caches globales o path del builder.

## Política de anchors

No conservar un tar por commit.

Recomendación:

1. Git conserva todo el historial de fuente/receta.
2. Mantener **un solo environment anchor vigente** fuera del repo.
3. Opcionalmente mantener su SHA-256:

```bash
sha256sum daybed-environment-anchor.tar.gz > daybed-environment-anchor.tar.gz.sha256
sha256sum -c daybed-environment-anchor.tar.gz.sha256
```

4. Reemplazar el anchor solo después de que el nuevo bundle pase aceptación.

## Qué NO va al repositorio

Nunca versionar:

- `.vendor/`;
- `backend/.venv/`;
- `frontend/node_modules/`;
- `.env` reales;
- `backend/db.sqlite3`;
- `.agent-logs/` / `.agent-tmp/`;
- bundles `.tar.gz`.

## Orden correcto después de desastre / clone nuevo

Con un anchor compatible disponible:

```bash
git clone git@github.com:git-oojl/daybed.git daybed-pase-final
cd daybed-pase-final
git switch pase-final
make restore-vendor VENDOR_ARCHIVE=/ruta/daybed-environment-anchor.tar.gz
make bootstrap
make validate
make smoke
```

Sin anchor, debes usar un host Linux x86_64 con Internet y reconstruir el payload:

```bash
make rebuild-bundle
```

No esperes que `make bootstrap` en un clone sin `.vendor` reconstruya por Internet: el bootstrap hermético está diseñado intencionalmente para usar los cachés vendorizados y operar offline.
